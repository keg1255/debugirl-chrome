import {Rpc} from "~/common/rpc";
import {once} from "../common/utils";
import {Buffer} from "buffer";

// 重连退避:1s 起,每次失败翻倍,最长 1 分钟
const RETRY_MIN = 1e3;
const RETRY_MAX = 60e3;
// 连接保持这么久才算"稳定",才把退避计数归零(避免服务端连上即断时 1s 一次狂刷)
const RETRY_STABLE = 10e3;

export function newWsClient(opt: {url: string; rpc: Rpc; onWs: (ws: WebSocket) => void}) {
	const {url, rpc, onWs} = opt;
	let stoped = false;
	let restart_timer = null;
	let stable_timer = null;
	let retry = 0;
	let cur: WebSocket = null;
	let ping_timer = null;

	function retryDelay() {
		return Math.min(RETRY_MIN * Math.pow(2, retry), RETRY_MAX);
	}

	function clearPing() {
		if (ping_timer) clearInterval(ping_timer);
		ping_timer = null;
	}

	function safeClose(ws: WebSocket) {
		try {
			if (ws.readyState == 0 || ws.readyState == 1) ws.close();
		} catch (e) {}
	}

	function start() {
		restart_timer = null;
		if (stoped) return;
		const ws = new WebSocket(url);
		cur = ws;
		let send_at = 0;
		let ready = Promise.race([once(ws, "open"), once(ws, "error").then((x) => Promise.reject(x))]);
		// 没有待发送数据时 ready 的失败会变成 unhandled rejection,这里兜一层
		ready.catch(() => {});
		ws.send = (function (fn) {
			return function () {
				const args = arguments;
				return ready.then(() => {
					send_at = Date.now();
					return fn.apply(this, args);
				});
			};
		})(ws.send);

		ws.addEventListener("open", () => {
			if (stable_timer) clearTimeout(stable_timer);
			stable_timer = setTimeout(function () {
				stable_timer = null;
				retry = 0;
			}, RETRY_STABLE);
		});
		ws.addEventListener("message", async (e) => {
			if (e.data instanceof Blob) {
				let buf = await e.data.arrayBuffer();
				rpc.onmessage(Buffer.from(new Uint8Array(buf)));
				return;
			}
			let text = e.data.toString();
			if (text == "ping") return ws.send("pong");
			if (text == "pong") return;
			rpc.onmessage(text);
		});
		ws.addEventListener("close", (reason) => {
			console.log("close", reason, url);
			restart(ws);
		});
		ws.addEventListener("error", (e) => {
			console.error("ws error", e, url);
			restart(ws);
		});

		ping_timer = setInterval(() => {
			if (ws.readyState == 1 && send_at < Date.now() - 4e3) ws.send("ping");
		}, 5e3);

		onWs(ws);
	}

	function restart(ws: WebSocket) {
		// 旧 socket 的事件(已被替换掉的)不再触发重连
		if (ws !== cur) return;
		if (stable_timer) {
			clearTimeout(stable_timer);
			stable_timer = null;
		}
		clearPing();
		// 已经排好一次重连了(比如 error 后又来 close),不重复排、也不重复退避
		if (restart_timer || stoped) return;
		const delay = retryDelay();
		retry++;
		console.log("reconnect in", delay, "ms", url);
		restart_timer = setTimeout(start, delay);
	}

	start();
	return {
		stop: () => {
			if (stoped) return;
			stoped = true;
			if (restart_timer) {
				clearTimeout(restart_timer);
				restart_timer = null;
			}
			if (stable_timer) {
				clearTimeout(stable_timer);
				stable_timer = null;
			}
			clearPing();
			const ws = cur;
			cur = null;
			if (ws) safeClose(ws);
		},
	};
}
