import {Buffer} from "buffer";
import config from "../lib/config";
import {Rpc} from "~/common/rpc";
import {deepClone, formatError} from "~/common/utils";
import {runner_rpc} from "~/options/runner_rpc";
import {scriptsLocal} from "~/stores/local";

const workers = new Set<Worker>();
const port = chrome.runtime.connect({name: "tab"});
port.onMessage.addListener((msg) => {
	workers.forEach((worker) => {
		worker.postMessage(msg);
	});
});

export function runScript(opt: {
	id: number;
	name: string;
	code?: string;
	url?: string;
	data?: any;
}) {
	let url = opt.url;
	if (opt.url) {
		url = opt.url;
		if (!/https?:/.test(url)) url = config.apiDomain + url;
		url = "/__code__.js?url=" + encodeURIComponent(url);
	} else if (opt.code) {
		url = "/__code__.js?code=" + encodeURIComponent(Buffer.from(opt.code).toString("base64"));
	} else {
		url = "/__code__.js?id=" + opt.id;
	}
	if (!url) throw "need code or url";
	let one = scriptsLocal.list.find((x) => x.id == opt.id);
	if (!one) {
		one = {id: opt.id, name: opt.name, freq: 300, run_at: Date.now()};
		if (opt.id) {
			scriptsLocal.list.push(one);
		}
	} else {
		one.run_at = Date.now();
	}
	return new Promise<any>((resolve, reject) => {
		let worker = new Worker(url);
		let timer = setTimeout(() => {
			reject("timeout");
			onClose();
		}, 300e3);
		function send(data) {
			let transfer = [];
			// 递归遍历对象，查找 ArrayBuffer
			function findArrayBuffers(obj) {
				if (obj instanceof Uint8Array) {
					transfer.push(obj.buffer);
					return obj.buffer;
				}
				if (obj instanceof ArrayBuffer) {
					transfer.push(obj);
					return obj;
				}
				if (typeof obj === "object" && obj !== null) {
					for (let key in obj) {
						obj[key] = findArrayBuffers(obj[key]);
					}
				}
				return obj;
			}
			data = findArrayBuffers(data);

			try {
				worker.postMessage(data, transfer);
			} catch (e) {
				console.error(data, e);
			}
		}
		const worker_rpc = new Rpc({
			name: "worker",
			write: (data) => send(data),
			define: (path, data, abort) => {
				if (path == "inited") {
					worker_rpc
						.call("run", {name: opt.name, data: opt.data}, abort, onClose)
						.then((x) => {
							console.log("run result", x);
							resolve(x);
						})
						.catch(reject);
					return;
				}
				if (path == "keepalive") {
					clearTimeout(timer);
					timer = setTimeout(() => {
						reject("timeout");
						onClose();
					}, +data || 60e3);
					return;
				}
				if (path == "setNextAt") {
					if (!opt.id) return console.warn(`临时脚本不能setNextAt`);
					if (typeof data != "number") return Promise.reject("setNextAt param must be a number");
					one.next_at = data;
					return;
				}
				if (path == "setStore") {
					if (!opt.id) return console.warn(`临时脚本不能setStore`);
					one.store = data;
					return;
				}
				if (path == "getStore") {
					if (!opt.id) return console.warn(`临时脚本不能getStore`);
					return deepClone(one.store);
				}
				if (path == "chrome.notify" && data[0]) {
					data[0].title = opt.name;
				}
				if (path.startsWith("chrome.storage")) {
					return Promise.reject(`chrome.storage is forbidden use getStore and setStore instead`);
				}
				return runner_rpc.call(path, data, abort);
			},
			textMode: false,
		});
		worker.onmessage = (e) => {
			const data = e.data;
			if (!data) return;
			worker_rpc.onmessage(data);
		};
		worker.onerror = (e) => {
			reject(e.message);
			onClose();
		};
		workers.add(worker);
		function onClose() {
			workers.delete(worker);
			clearTimeout(timer);
			worker.terminate();
		}
	})
		.then((result) => {
			if (!opt.code) {
				if (result || (one.result && one.result.class == "error")) {
					one.result = {text: result, class: "success"};
				}
			}
			return result;
		})
		.catch((err) => {
			if (/failed status:404/.test(err)) {
				let idx = scriptsLocal.list.findIndex((x) => x.id == opt.id);
				if (idx >= 0) {
					scriptsLocal.list.splice(idx, 1);
				}
				console.log("remove script", opt.id);
			}
			if (!opt.code) {
				if (err instanceof Error) err = err + "";
				one.result = {text: formatError(err), class: "error"};
			}
			throw err;
		});
}
