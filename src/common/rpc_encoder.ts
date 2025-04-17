import {formatError} from "./utils";
import {Buffer} from "buffer";

export function newResultEncoder(opt: {send: (data: any) => any; textMode?: boolean}) {
	const {send, textMode} = opt;
	function sendStream(rs) {
		let reader = rs.getReader();
		function next() {
			reader
				.read()
				.then(({done, value}) => {
					if (done) return send({type: "end"});
					if (textMode) {
						if (value instanceof ArrayBuffer) value = new Uint8Array(value);
						if (value instanceof Uint8Array)
							send({type: "write", text: Buffer.from(value).toString("base64")});
						else send({type: "write", data: value});
					} else {
						send({type: "write", data: value});
					}
					next();
				})
				.catch((err) => reject(err));
		}
		next();
	}
	function resolve(res) {
		if (res instanceof ReadableStream) {
			sendStream(res);
			return;
		}
		if (res instanceof Response) {
			let headers = {};
			res.headers.forEach((value, key) => {
				headers[key] = value;
			});
			send({type: "response", status: res.status, headers});
			sendStream(res.body);
			return;
		}
		if (res instanceof File) {
			return res.arrayBuffer().then((buf) => {
				let data = textMode ? Buffer.from(new Uint8Array(buf)).toString("base64") : buf;
				send({type: "file", name: res.name, size: res.size, mimeType: res.type, data});
			});
		}
		if (res instanceof Blob) {
			return res.arrayBuffer().then((buf) => {
				let data = textMode ? Buffer.from(new Uint8Array(buf)).toString("base64") : buf;
				send({type: "blob", size: res.size, mimeType: res.type, data});
			});
		}
		if (textMode) {
			if (res instanceof ArrayBuffer) res = new Uint8Array(res);
			if (res instanceof Uint8Array) {
				return send({type: "resolve", text: Buffer.from(res).toString("base64")});
			}
		}
		send({type: "resolve", data: res});
	}
	function reject(err) {
		send({type: "reject", err: formatError(err)});
	}
	return {resolve, reject};
}

export function newResultDecoder(opt: {
	resolve: (data: any) => any;
	reject: (err: any) => any;
	onend: () => void;
}) {
	const {resolve, reject, onend} = opt;
	let controller: ReadableStreamDefaultController;
	return function (data) {
		if (data.type == "abort") {
			reject(data.reason);
			onend();
			return;
		}
		if (data.type == "resolve") {
			resolve(data.text ? Buffer.from(data.text, "base64") : data.data);
			onend();
			return;
		}
		if (data.type == "reject") {
			reject(data.err);
			onend();
			if (controller) controller.close();
			return;
		}
		if (data.type == "response") {
			let rs = new ReadableStream({start: (x) => (controller = x)});
			resolve(new Response(rs, {status: data.status, headers: data.headers}));
			return;
		}
		if (data.type == "file") {
			let buf = typeof data.data === "string" ? Buffer.from(data.data, "base64") : data.data;
			resolve(new File([buf], data.name, {type: data.mimeType}));
			return;
		}
		if (data.type == "blob") {
			let buf = typeof data.data === "string" ? Buffer.from(data.data, "base64") : data.data;
			resolve(new Blob([buf], {type: data.mimeType}));
			return;
		}
		if (data.type == "write") {
			if (!controller) {
				let rs = new ReadableStream({start: (x) => (controller = x)});
				resolve(rs);
			}
			let buf = data.text ? Buffer.from(data.text, "base64") : data.data;
			controller.enqueue(buf);
			return;
		}
		if (data.type == "end") {
			controller.close();
			onend();
			return;
		}
		return true;
	};
}
