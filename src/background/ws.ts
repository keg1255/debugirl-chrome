import {Rpc} from "~/common/rpc";
import {once} from "../common/utils";
import {Buffer} from "buffer";

export function newWsClient(opt: {url: string; rpc: Rpc; onWs: (ws: WebSocket) => void}) {
	const {url, rpc, onWs} = opt;
	let stoped = false;
	let restart_timer;
	let pre_ws: WebSocket;
	function start() {
		if (stoped) return;
		let ws = new WebSocket(url);
		pre_ws = ws;
		let ready = Promise.race([once(ws, "open"), once(ws, "error").then((x) => Promise.reject(x))]);
		let send_at = 0;
		ws.send = (function (fn) {
			return function () {
				const args = arguments;
				return ready.then(() => {
					send_at = Date.now();
					return fn.apply(this, args);
				});
			};
		})(ws.send);

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
			console.log("close", reason);
			restart();
		});
		ws.addEventListener("error", (e) => {
			console.error("ws error", e);
			restart();
		});

		var timer = setInterval(() => {
			if (ws && ws.readyState == 1 && send_at < Date.now() - 4e3) ws.send("ping");
		}, 5e3);

		function restart() {
			if (pre_ws != ws) return;
			clearInterval(timer);
			clearTimeout(restart_timer);
			if (stoped) return;
			restart_timer = setTimeout(start, 1e3);
		}
		onWs(ws);
	}
	start();
	return {
		stop: () => {
			clearTimeout(restart_timer);
			stoped = true;
		},
	};
}
