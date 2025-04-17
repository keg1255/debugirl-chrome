import {Interpreter} from "eval5";
import {newResultEncoder} from "../common/rpc_encoder";

let script = document.createElement("script");
script.setAttribute("eid", chrome.runtime.id);
script.src = chrome.runtime.getURL("sdk.min.js");
document.documentElement.appendChild(script);

const interpreter = new Interpreter(window);
function eval1(code: string) {
	return interpreter.evaluate(code);
}
function exec(wid, code) {
	console.log(code);
	const {resolve, reject} = newResultEncoder({send, textMode: true});
	setTimeout(() => {
		try {
			var pms = eval1(code);
			if (pms && typeof pms.then === "function") {
				pms
					.then(function (data) {
						resolve(data);
					})
					.catch(function (err) {
						console.error(err);
						reject(err);
					});
			} else {
				resolve(pms);
			}
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
	function send(data) {
		chrome.runtime.sendMessage({...data, wid});
	}
}

const win: any = window;
// executeScript 插件
win.debugirl_eval = exec;
