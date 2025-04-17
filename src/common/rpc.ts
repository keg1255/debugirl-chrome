import {Buffer} from "buffer";
import {newResultDecoder, newResultEncoder} from "./rpc_encoder";
import {tryJSON} from "./utils";

interface RpcOptions {
	name?: string;
	write: (data: string | Buffer) => void;
	define: (path: string, args: any, abort?: AbortSignal) => Promise<any>;
	textMode: boolean;
}

export class Rpc {
	private rid = 0;
	private id2cb = new Map<number, (...args: any[]) => any>();
	private cb2id = new Map<(...args: any[]) => any, number>();
	private id2abort = new Map<number, AbortController>();
	private opt: RpcOptions;
	constructor(opt: RpcOptions) {
		this.opt = opt;
	}

	private send(data: any) {
		// console.log("send", this.opt.name, data);
		this.opt.write(data);
	}

	onclose() {
		const {id2cb, cb2id} = this;
		id2cb.forEach((cb) => {
			cb({type: "reject", err: "api close"});
		});
		id2cb.clear();
		cb2id.clear();
		this.send = () => {};
	}

	emit(path: string, args?: any) {
		this.send({path, args});
	}

	call(path: string, args?: any, abort?: AbortSignal, onend?: () => void) {
		const {id2cb, cb2id} = this;
		return new Promise<any>((resolve, reject) => {
			if (typeof args === "object" && !Buffer.isBuffer(args)) {
				for (let k in args) {
					let v = args[k];
					if (typeof v == "function") {
						let rid = cb2id.get(v);
						if (rid) {
							if (path.endsWith("removeListener")) {
								id2cb.delete(rid);
								cb2id.delete(v);
							}
						} else {
							rid = ++this.rid;
							id2cb.set(rid, v);
							cb2id.set(v, rid);
						}
						args[k] = `cbid:${rid}`;
					}
				}
			}
			let rid = ++this.rid;
			this.send({rid, path, args});
			let decoder = newResultDecoder({
				resolve,
				reject,
				onend: () => {
					id2cb.delete(rid);
					cb2id.delete(decoder);
					onend?.();
				},
			});
			if (abort) {
				abort.addEventListener("abort", () => {
					reject(abort.reason);
					id2cb.delete(rid);
					cb2id.delete(decoder);
					this.send({type: "abort", rid, reason: abort.reason});
					onend?.();
				});
			}
			id2cb.set(rid, decoder);
			cb2id.set(decoder, rid);
		});
	}

	async onmessage(buf: any) {
		if (Buffer.isBuffer(buf)) {
			buf = buf.toString();
		}
		let msg = tryJSON(buf);
		// console.log("recv", this.opt.name, msg);
		if (msg.path) {
			// 调用函数
			let {path, args, rid} = msg;
			for (let k in args) {
				let v = args[k];
				let m = /^cbid:(\d+)$/.exec(v);
				if (m) {
					let rid = +m[1];
					args[k] = (...args) => {
						this.send({rid, args});
					};
				}
			}
			let abort = new AbortController();
			let pms = Promise.resolve().then(() => {
				return this.opt.define(path, args, abort.signal);
			});
			if (!rid) return pms;
			this.id2abort.set(rid, abort);
			const {resolve, reject} = newResultEncoder({
				send: (data) => this.send({...data, rid}),
				textMode: this.opt.textMode,
			});
			pms
				.then(resolve)
				.catch(reject)
				.finally(() => {
					this.id2abort.delete(rid);
				});
			return;
		}
		if (msg.rid) {
			if (msg.type == "abort") {
				let abort = this.id2abort.get(msg.rid);
				if (abort) abort.abort(msg.reason);
				this.id2abort.delete(msg.rid);
				return;
			}
			const {id2cb} = this;
			let cb = id2cb.get(msg.rid);
			if (!cb) return;
			if (Array.isArray(msg.args)) {
				cb(...msg.args);
				return;
			}
			cb(msg);
		}
	}
}
