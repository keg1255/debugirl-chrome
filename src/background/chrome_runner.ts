import {waitGone} from "~/common/chrome";
import {newResultDecoder} from "~/common/rpc_encoder";

const apis = new Map<string, (...args: any[]) => Promise<any>>();

export function addChromeApi(path: string, fn: (...args: any[]) => Promise<any>) {
	apis.set(path, fn);
}

/**
 * 调用 chrome api
 */
async function callSelf(path: string, args: any[]) {
	let fn = apis.get(path);
	if (fn) {
		return fn(...args);
	}
	let ss = path.split(".");
	let method = ss.pop();
	let obj: any = self;
	for (let i = 0; i < ss.length; i++) {
		obj = obj[ss[i]];
	}
	if (typeof obj[method] === "function") return obj[method](...args);
	throw `method ${path} not found`;
}

let wid = 1;
const wmap = new Map<number, (data: any) => void>();

/**
 * 调用 chrome api 并处理错误
 */
export function callChrome(path: string, args: any[], abort?: AbortSignal) {
	if (path == "chrome.request") {
		const {url, ...req} = args[0];
		req.method = req.method || "GET";
		req.headers = req.headers || {};
		for (let k in req.headers) {
			let l = k.toLowerCase();
			if (l != k) {
				req.headers[l] = req.headers[k];
				delete req.headers[k];
			}
		}
		let all = [];
		if (req.headers.cookie) {
			let list = req.headers.cookie.split(";").map((x) => x.trim().split("="));
			for (let [k, v] of list) {
				all.push(
					chrome.cookies
						.remove({url, name: k})
						.then(() => chrome.cookies.set({url, name: k, value: v}))
				);
			}
		}
		req.signal = abort;
		return Promise.all(all).then(() => fetch(url, req));
	}
	if (path == "chrome.scripting.executeScript") {
		let item = args[0];
		const rid = wid++;
		return new Promise((resolve, reject) => {
			const decoder = newResultDecoder({
				resolve,
				reject,
				onend() {
					wmap.delete(rid);
				},
			});
			wmap.set(rid, decoder);
			chrome.scripting
				.executeScript({
					target: item.target,
					world: item.world || "ISOLATED",
					func: function (code, wid) {
						if (!("debugirl_eval" in window)) return "sdk not found";
						(window as any).debugirl_eval(wid, code);
						return 1;
					},
					args: [item.code, rid],
				})
				.then((x) => {
					if (x[0].result == 1) {
						return waitGone(item.target.tabId).then(() => reject("gone"));
					}
					throw x[0].result || "gone";
				})
				.catch((err) => {
					wmap.delete(rid);
					reject(err);
				});
		});
	}
	console.log("callChrome", path, args);
	return callSelf(path, args)
		.then((x) => {
			console.log("callChrome result", path, x);
			return x;
		})
		.catch((err) => {
			console.log("callChrome error", path, err);
			return err;
		});
}

function onMessage(message, sender, sendResponse) {
	if (+message.wid) {
		let wid = +message.wid;
		let send = wmap.get(wid);
		delete message.wid;
		if (send) send(message);
		return;
	}
}
chrome.runtime.onMessage.addListener(onMessage);
// 只有 background 可以收到 onMessageExternal
chrome.runtime.onMessageExternal.addListener(onMessage);
