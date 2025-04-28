import storages from "~/common/storages";
import {debounce, formatError, getDistance, randN, sleep} from "@/common/utils";
import {newClient} from "./ws_client";
import {addChromeApi} from "./chrome_runner";
import {Buffer} from "buffer";
import {waitGone, waitLoaded, waitRemoved} from "~/common/chrome";
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
				if (k in evt.data) {
					def[k] = evt.data[k];
				}
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

interface TabState {
	point: Point;
	count: number;
	pms: Promise<any>;
}
const tabsMap = new Map<number, TabState>();
addChromeApi("chrome.dispatch", async function (tabId: number, params: any) {
	return withDebugger(tabId, async (state) => {
		const target = {tabId};
		function getPoint() {
			return {
				x: isNaN(params.x) ? state.point.x : +params.x,
				y: isNaN(params.y) ? state.point.y : +params.y,
			};
		}
		function emit(type: string) {
			return chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
				clickCount: 1,
				button: "left",
				...params,
				...getPoint(),
				type,
			});
		}
		if (typeof params == "string") {
			let pms: Promise<any> = Promise.resolve();
			for (let i = 0; i < params.length; i++) {
				pms = pms.then(() =>
					chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", {
						type: "char",
						text: params[i],
					})
				);
			}
			return pms;
		}
		if (/mouse/.test(params.type)) {
			return chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
				clickCount: 1,
				button: "left",
				...params,
				...getPoint(),
			});
		}
		if (params.type == "path") {
			let point = getPoint();
			let a = {
				x: randN(point.x * 2),
				y: randN(point.y * 2),
			};
			if (Math.random() < 0.5) a.x = 0;
			else a.y = 0;
			await move(a);
			// console.log("move", a);
			while (getDistance(a, point) > 3) {
				let dx = point.x - a.x;
				let dy = point.y - a.y;
				dx = (dx > 4 ? 4 : dx < -4 ? -4 : 0) + randN(dx / 2);
				dy = (dy > 4 ? 4 : dy < -4 ? -4 : 0) + randN(dy / 2);
				a.x += dx;
				a.y += dy;
				await sleep(randN(100));
				await move(a);
				// console.log("move", a);
			}
			await sleep(100);
			function move(a: Point) {
				return chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
					type: "mouseMoved",
					x: a.x,
					y: a.y,
				});
			}
			params.type = "click";
		}
		if (params.type == "click") {
			await emit("mousePressed");
			await emit("mouseReleased");
			return;
		}
		if ("x" in params) {
			// move
			state.point.x = params.x;
			state.point.y = params.y;
			return chrome.debugger.sendCommand(target, "Input.dispatchMouseEvent", {
				type: "mouseMoved",
				x: params.x,
				y: params.y,
			});
		}
		return chrome.debugger.sendCommand(target, "Input.dispatchKeyEvent", params);
	});
});

function withDebugger(tabId: number, cb: (state: TabState) => Promise<any>) {
	const target = {tabId};
	if (!tabsMap.has(tabId)) {
		tabsMap.set(tabId, {point: {x: randN(10), y: randN(100)}, count: 0, pms: Promise.resolve()});
		waitRemoved(tabId).then(() => {
			tabsMap.delete(tabId);
		});
	}
	const state = tabsMap.get(tabId);
	state.count++;
	if (state.count == 1) {
		state.pms = state.pms.then(() => chrome.debugger.attach(target, "1.3"));
	}
	return state.pms
		.then(cb)
		.catch(console.error)
		.then(() => {
			state.count--;
			if (state.count == 0) {
				return chrome.debugger.detach(target);
			}
		});
}

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
