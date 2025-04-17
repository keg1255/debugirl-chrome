import storages from "~/common/storages";
import {debounce, formatError} from "@/common/utils";
import {newClient} from "./ws_client";
import {addChromeApi} from "./chrome_runner";
import {Buffer} from "buffer";
import {waitGone, waitLoaded} from "~/common/chrome";
import {startLoop} from "./runner";
import config from "~/lib/config";

const store = storages["chrome.app"];
const userStore = storages["chrome.user"];
let clients = new Map<number, ReturnType<typeof newClient>>();

const ready = (function () {
	let all = [];
	for (let key in storages) {
		let def = storages[key];
		let storage;
		if (key.startsWith("sync.")) {
			storage = chrome.storage.sync;
		} else if (!key.startsWith("share.")) {
			storage = chrome.storage.local;
		}
		if (storage) {
			all.push(
				storage.get(key).then((data) => {
					let val = data[key];
					if (!val) return;
					for (let k in def) {
						if (k in val) def[k] = val[k];
					}
				})
			);
		}
	}
	return Promise.all(all);
})();

export const whenReady = ready.then(() => {
	function refresh() {
		console.log("refresh", store.list);
		let map = new Map<number, ReturnType<typeof newClient>>();
		store.list
			.filter((x) => x.status != "disconnected")
			.forEach((x) => {
				let old = clients.get(x.id);
				if (old && old.url == x.url) {
					map.set(x.id, old);
					clients.delete(x.id);
				} else {
					if (old) old.stop();
					old = newClient({
						id: x.id,
						url: x.url,
						onTimeout: () => {
							let list = store.list.filter((y) => y.url != x.url);
							localWrite("chrome.app", {list});
						},
						onStatusChange: (status) => {
							setItemStatus(x.id, status);
						},
					});
					map.set(x.id, old);
				}
				old.setTimeout(x.timeout);
			});
		for (let k of clients.keys()) {
			let v = clients.get(k);
			v.stop();
		}
		clients = map;
	}
	const onChangeList = debounce(refresh);
	chrome.runtime.onMessage.addListener(onMessage);
	fetch("/config.json")
		.then((x) => x.json())
		.then((x) => {
			console.log("load config", x);
			localWrite("chrome.app", x);
		})
		.catch(() => refresh());

	function localWrite(key: string, data: any) {
		onMessage({type: "local-write", key, data, version: Date.now()}, null, () => {});
	}

	function onMessage(
		evt: any,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	) {
		if (!evt) return;
		if (["local-read", "sync-read", "share-read"].indexOf(evt.type) >= 0) {
			sendResponse(storages[evt.key]);
			return;
		}
		if (["local-write", "sync-write", "share-write"].indexOf(evt.type) >= 0) {
			const def = storages[evt.key];
			for (let k in def) {
				let v = evt.data[k];
				if (v != null) def[k] = v;
			}
			sendResponse(0);
			chrome.runtime.sendMessage({
				type: evt.type.slice(0, -5) + "change",
				key: evt.key,
				version: evt.version,
			});
			if (evt.key == "chrome.app") {
				onChangeList();
			}
			if (evt.type == "local-write") {
				chrome.storage.local.set({[evt.key]: def});
				return;
			}
			if (evt.type == "sync-write") {
				chrome.storage.sync.set({[evt.key]: def});
				return;
			}
			return;
		}
	}
	// 开启定时任务
	startLoop();
	return {localWrite};
});

export function localWrite(key: string, data: any) {
	return whenReady.then((x) => x.localWrite(key, data));
}

export const setLocal = debounce(function (data: Partial<typeof store>) {
	return localWrite("chrome.app", data);
});

export function setItemStatus(id: number, status: string) {
	console.log("setItemStatus", id, status);
	let item = store.list.find((x) => x.id == id);
	if (item && item.status != status) {
		item.status = status;
		setLocal(store);
	}
}

addChromeApi("chrome.setUUID", async function (uuid) {
	setLocal({uuid});
});

addChromeApi("chrome.getUUID", async function () {
	return store.uuid;
});

// 给其它网站调用
chrome.runtime.onMessageExternal.addListener(async (message, sender, sendResponse) => {
	if (!message) return;
	if (message.type == "add" || message.type == "run") {
		let target: any = {tabId: sender.tab.id};
		if (sender.frameId) target.frameIds = [sender.frameId];
		try {
			let tab = await chrome.tabs.create({
				url:
					chrome.runtime.getURL("options.html") +
					"#/my-scripts/?_=" +
					encodeURIComponent(
						Buffer.from(JSON.stringify({...message, ...target})).toString("base64")
					),
			});
			await waitLoaded(tab.id);
			waitGone(tab.id).then(() => {
				send({err: "tab gone"});
			});
		} catch (error) {
			console.error(message.type, error);
			send({err: formatError(error)});
		}

		function send(data) {
			chrome.scripting.executeScript({
				target,
				world: "MAIN",
				func: function (data) {
					(window as any).debugirl(data);
				},
				args: [{...data, rid: message.rid}],
			});
		}
	}
});

// 运行注入代码
self.addEventListener("fetch", (fetchEvent: any) => {
	const url = new URL(fetchEvent.request.url);
	if (url.pathname == "/__code__.js") {
		fetchEvent.respondWith(
			(async () => {
				let code_url = url.searchParams.get("url");
				if (!code_url) {
					let id = url.searchParams.get("id");
					if (+id) code_url = config.apiDomain + "/scripts/get?id=" + id;
				}
				if (code_url) {
					let headers = {};
					if (code_url.startsWith(config.apiDomain)) {
						headers["x-auth-token"] = userStore.user?.token || "";
					}
					let res = await fetch(code_url, {headers});
					let code = await res.text();
					if (res.status != 200) {
						code = `const main=()=>Promise.reject(${JSON.stringify(
							`fetch ${code_url} failed status:${res.status}\n${code}`
						)})`;
					}
					code = `importScripts("chrome.min.js");${code}`;
					return new Response(code, {headers: {"Content-Type": "text/javascript"}});
				}
				let code = url.searchParams.get("code");
				if (code) {
					code = Buffer.from(code, "base64").toString();
					code = `importScripts("chrome.min.js");${code}`;
				}
				return new Response(code, {headers: {"Content-Type": "text/javascript; charset=utf-8"}});
			})()
		);
	}
});
