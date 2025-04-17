import {Rpc} from "~/common/rpc";
import {runScript} from "./script_runner";

const port = chrome.runtime.connect({name: "runner"});
export const runner_rpc = new Rpc({
	name: "runner",
	write: (data) => {
		port.postMessage(data);
	},
	define: (path, args) => {
		if (path == "runScript") {
			return runScript(args);
		}
		return Promise.reject("no method " + path);
	},
	textMode: true,
});
port.onMessage.addListener(function (msg) {
	runner_rpc.onmessage(msg);
});
