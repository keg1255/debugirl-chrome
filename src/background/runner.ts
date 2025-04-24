import storages from "~/common/storages";
import {newPromise, onlyone} from "~/common/utils";
import {addChromeApi, callChrome} from "./chrome_runner";
import {Rpc} from "~/common/rpc";
import config from "~/lib/config";

const scripts = storages["chrome.scripts"];

const runners = new Set<Rpc>();
let waitRunner = newPromise<Rpc>();
const initRunner = onlyone(async function () {
	if (!runners.size) {
		try {
			await chrome.offscreen.createDocument({
				url: "options.html",
				reasons: [chrome.offscreen.Reason.WORKERS],
				justification: "run script",
			});
		} catch (error) {
			console.error("create offscreen document", error);
			console.log({
				url: chrome.runtime.getURL("options.html"),
				active: false,
				index: 0,
			});
			await chrome.tabs.create({
				url: chrome.runtime.getURL("options.html"),
				active: false,
				index: 0,
			});
		}
		await waitRunner;
	}
	return runners.values().find((x) => x);
});
addChromeApi("chrome.runScript", async function ({name, code, url, data}) {
	console.log("runScript", name, data);
	return initRunner().then((rpc) => rpc.call("runScript", {name, code, url, data}));
});

const tabListeners = new Set<(message: any) => void>();
addChromeApi("chrome.addTabListener", async function (listener: (message: any) => void) {
	tabListeners.add(listener);
});

const tabPorts = new Set<chrome.runtime.Port>();
chrome.runtime.onConnect.addListener(function (port) {
	if (port.name === "runner") {
		const rpc = new Rpc({
			name: "background",
			write: async (data) => {
				port.postMessage(data);
			},
			define: (path, args, abort) => {
				return callChrome(path, args, abort);
			},
			textMode: true,
		});
		runners.add(rpc);
		waitRunner.resolve(rpc);
		port.onMessage.addListener(function (msg) {
			rpc.onmessage(msg);
		});
		port.onDisconnect.addListener(function () {
			runners.delete(rpc);
			if (!runners.size) waitRunner = newPromise();
		});
	}
	if (port.name === "tab") {
		tabPorts.add(port);
		port.onDisconnect.addListener(function () {
			tabPorts.delete(port);
		});
	}
});
chrome.tabs.onCreated.addListener((tab) => {
	const message = {type: "created", data: tab};
	tabListeners.forEach((listener) => listener(message));
	tabPorts.forEach((port) => port.postMessage(message));
});
chrome.tabs.onRemoved.addListener((tabId) => {
	const message = {type: "removed", data: tabId};
	tabListeners.forEach((listener) => listener(message));
	tabPorts.forEach((port) => port.postMessage(message));
});
chrome.tabs.onActivated.addListener((activeInfo) => {
	const message = {type: "activated", data: activeInfo};
	tabListeners.forEach((listener) => listener(message));
	tabPorts.forEach((port) => port.postMessage(message));
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	const message = {type: "updated", data: {tabId, changeInfo}};
	tabListeners.forEach((listener) => listener(message));
	tabPorts.forEach((port) => port.postMessage(message));
});

chrome.action.setBadgeBackgroundColor({color: "#f00"});
let runningSet = new Set<number>();
export function startLoop() {
	const now = Date.now();
	let errorCount = 0;
	scripts.list.forEach((script) => {
		if (!script.autorun) return;
		if (script.result?.class == "error") errorCount++;
		if (runningSet.has(script.id)) return;
		let next_at = Math.max(
			(+script.run_at || 0) + (+script.freq || 300) * 1000,
			+script.next_at || 0
		);
		if (next_at > now) return;
		runningSet.add(script.id);
		initRunner()
			.then((rpc) => rpc.call("runScript", {id: script.id, name: script.name}))
			.finally(() => {
				runningSet.delete(script.id);
			});
	});
	if (errorCount > 0) chrome.action.setBadgeText({text: errorCount.toString()});
	else chrome.action.setBadgeText({text: ""});
	setTimeout(startLoop, 1000);
}
