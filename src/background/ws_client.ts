import {Buffer} from "buffer";
import {newWsClient} from "./ws";
import "./chrome_extends";
import {callChrome} from "./chrome_runner";
import {notify} from "~/common/chrome";
import {Rpc} from "~/common/rpc";

export function newClient(opt: {
	id: number;
	url: string;
	onTimeout: () => void;
	onStatusChange: (status: string) => void;
}) {
	const {id, url, onTimeout, onStatusChange} = opt;
	console.log("new", id, url);
	let ws: WebSocket = null;
	let timeout = 0;
	let timer = null;

	const rpc = new Rpc({
		name: "ws",
		write: (data) => ws.send(JSON.stringify(data)),
		define: (path, args, abort) => {
			return callChrome(path, args, abort);
		},
		textMode: true,
	});

	let client = newWsClient({
		url,
		rpc,
		onWs: (x) => {
			ws = x;
			ws.addEventListener("open", function () {
				clearTimeout(timer);
				timer = null;
				onStatusChange("connected");
			});
			ws.addEventListener("close", function (e) {
				onStatusChange("connecting");
				if (e.code == 1000) {
					if (e.reason) notify({title: "连接断开", message: e.reason});
					return stop();
				}
				if (!timeout) return;
				if (timer) return;
				timer = setTimeout(onTimeout, timeout);
			});
			ws.addEventListener("error", function (e) {
				onStatusChange("connecting");
			});
		},
	});

	function send(ws: WebSocket, data) {
		if (!ws || ws.readyState !== 1) return;
		console.log("send", data);
		ws.send(JSON.stringify(data));
	}

	function stop() {
		console.log("stop", id, url);
		client.stop();
		if (ws) ws.close();
		onStatusChange("disconnected");
	}

	return {
		id,
		url,
		send: (data) => send(ws, data),
		getStatus: () => {
			return {status: ws && ws.readyState == 1 ? "connected" : "connecting"};
		},
		setTimeout: (n) => {
			timeout = n;
		},
		stop,
	};
}
