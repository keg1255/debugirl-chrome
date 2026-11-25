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
	let stoped = false;
	// 一次断开过程只提示一次,避免重连期间反复弹通知
	let notified = false;

	const rpc = new Rpc({
		name: "ws",
		// 注意:这里不能复用下面的 send(),rpc 的写操作要排队等 open
		write: (data) => {
			if (ws) ws.send(JSON.stringify(data));
		},
		define: (path, args, abort) => {
			return callChrome(path, args, abort);
		},
		textMode: true,
	});

	let client = newWsClient({
		url,
		rpc,
		onWs: (x) => {
			// 每个 socket 的回调都只处理自己,避免旧 socket 的事件污染当前状态
			ws = x;
			if (stoped) return x.close();
			x.addEventListener("open", function () {
				if (stoped || ws !== x) return;
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				notified = false;
				onStatusChange("connected");
			});
			x.addEventListener("close", function (e) {
				if (stoped || ws !== x) return;
				onStatusChange("connecting");
				if (!notified) {
					notified = true;
					if (e.reason) notify({title: "连接断开", message: `${e.reason} (code ${e.code})`});
				}
				// timeout 为 0 表示无限重连(由 ws 的退避逻辑负责),只负责超时后放弃
				if (!timeout) return;
				if (timer) return;
				timer = setTimeout(function () {
					timer = null;
					onTimeout();
				}, timeout);
			});
			x.addEventListener("error", function (e) {
				if (stoped || ws !== x) return;
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
		if (stoped) return;
		stoped = true;
		console.log("stop", id, url);
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		// 先清引用再关 socket,避免 close 回调把状态刷回 "connecting"
		ws = null;
		client.stop();
		onStatusChange("disconnected");
	}

	return {
		id,
		url,
		send: (data) => send(ws, data),
		getStatus: () => {
			if (stoped) return {status: "disconnected"};
			return {status: ws && ws.readyState == 1 ? "connected" : "connecting"};
		},
		setTimeout: (n) => {
			timeout = n || 0;
			// 改成无限重连时,撤掉已经排好的放弃计时
			if (!timeout && timer) {
				clearTimeout(timer);
				timer = null;
			}
		},
		stop,
	};
}
