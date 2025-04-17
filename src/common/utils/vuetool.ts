import {deepClone, deepDiff, deepInit, newPromise} from "./utils";
import {getHotkey} from "./webtool";
import {computed, nextTick, onBeforeUnmount, reactive, toRefs, watch} from "vue";

/**
 * @template T
 * @param {T} v
 * @param {(val: T, old: T) => any} [fn]
 * @returns {T}
 */
export function watchData<T extends object>(v: T, fn?: (val: T, old: T) => any): T {
	let data: any = reactive(v);
	if (fn) watch(data, fn, {deep: true});
	return data;
}

export class PromisePool {
	list: Promise<any>[];
	fnList: (() => Promise<any>)[];
	constructor() {
		this.list = [];
		this.fnList = [];
	}

	push(pms: Promise<any> | (() => Promise<any>)) {
		if (typeof pms === "function") this.fnList.push(pms);
		else {
			this.list.push(pms);
			pms.finally(() => {
				var idx = this.list.indexOf(pms);
				if (idx > -1) this.list.splice(idx, 1);
			});
		}
	}

	wait() {
		this.push(Promise.all(this.fnList.map((fn) => fn())));
		return Promise.all(this.list);
	}
}

let watchLocalMap: any = {};
const mountedPms = newPromise();
let initPool = new PromisePool();
let writePool = new PromisePool();

abstract class WatchAgent<T> {
	key: string;
	onchange?: () => void;
	constructor(key: string) {
		this.key = key;
	}

	abstract read(): Promise<[string, T]>;
	abstract write(s: string, data: T): Promise<void>;
}

abstract class WatchSyncAgent<T> extends WatchAgent<T> {
	abstract readSync(): [string, T];
}

class LocalStorageAgent<T> extends WatchSyncAgent<T> {
	constructor(key: string) {
		super(key);
		window.addEventListener("storage", (e) => {
			if (e.key == key) {
				this.onchange?.();
			}
		});
	}

	read(): Promise<[string, T]> {
		return Promise.resolve().then(() => {
			return this.readSync();
		});
	}

	readSync(): [string, T] {
		let s = localStorage.getItem(this.key) as string;
		let data;
		try {
			data = JSON.parse(s);
		} catch (error) {
			s = "";
		}
		return [s, data];
	}

	write(s: string, data: T): Promise<void> {
		return Promise.resolve().then(() => {
			localStorage.setItem(this.key, s);
		});
	}
}

class ChromeAgent<T> extends WatchAgent<T> {
	type: "local" | "sync" | "share";
	version: number | null;

	constructor(key: string, type: "local" | "sync" | "share") {
		super(key);
		this.type = type;
		this.version = 0;
		chrome.runtime.onMessage.addListener((evt, sender, sendResponse) => {
			if (evt.type == this.type + "-change" && evt.key == this.key && this.version < evt.version) {
				this.version = evt.version;
				this.onchange();
			}
		});
	}

	read(): Promise<[string, T]> {
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage({type: this.type + "-read", key: this.key}, (data) => {
				let s = JSON.stringify(data);
				resolve([s, data]);
			});
		});
	}

	write(s: string, data: T): Promise<void> {
		return new Promise((resolve, reject) => {
			this.version = Date.now();
			chrome.runtime.sendMessage(
				{type: this.type + "-write", key: this.key, data: data, version: this.version},
				resolve
			);
		});
	}
}

/**
 * 监听本地数据变化, 有以下数据同步方式
 * 1. local. 开头的数据, 会同步到 localStorage
 * 2. forage. 开头的数据, 会同步到 localforage
 * 3. share. 开头的数据, 会同步到 electron 的 share 数据 (不会持久化数据)
 * 4. 其他情况 在electron中默认同步到 local/文件中, 在web中默认同步到 localStorage 中
 * @param key 数据key
 * @param v 默认数据
 */
export function watchLocal<T>(key: string, v: T): T & {reset: () => void} {
	if (watchLocalMap[key]) {
		return watchLocalMap[key];
	}
	let agent: WatchAgent<T>;
	agent = key.startsWith("share.")
		? new ChromeAgent(key, "share")
		: key.startsWith("sync.")
		? new ChromeAgent(key, "sync")
		: key.startsWith("chrome.")
		? new ChromeAgent(key, "local")
		: new LocalStorageAgent(key);
	agent.onchange = reload;
	const originV = deepClone(v);
	if ((v as any).reset !== undefined) console.error("local中不能定义reset");
	setTimeout(() => {
		(v as any).reset = () => {
			justCopy(v, deepClone(originV));
		};
	});
	let ignore_change = 0; // 记录本机修改次数，防止本机修改引起数据变化的死循环
	let init_status = 0; // 初始化状态，0：未初始化，1：初始化中，2：已初始化
	let latest = ""; // 最新的数据

	function load() {
		return agent!
			.read()
			.then(([s, data]) => {
				latest = s;
				return data;
			})
			.catch((e) => console.error(e));
	}

	// 初始化加载数据
	let initPms = newPromise();
	load().then((x) =>
		mountedPms.then(() => {
			deepInit(v, x);
			init_status = 2;
			setTimeout(() => {
				// 超时没有触发数据变化,也标记为初始化完成
				init_status = 3;
				initPms.resolve();
			}, 1e3);
		})
	);
	// 等待 Nuxt mounted 之后再完成初始化
	initPool.push(() => {
		mountedPms.resolve();
		if (init_status < 1) init_status = 1;
		return initPms;
	});
	function reload() {
		// 初始化完成之后才重新加载数据
		return initPms.then(() =>
			load().then((x) => {
				if (x) {
					if (process.env.NODE_ENV === "development") {
						deepDiff(v, x, function (paths, val1, val2) {
							if (val1 === val2 || typeof val1 === "function") return false;
							console.log(`${key}.${paths.join(".")}`, val1, "->", val2);
							return false;
						});
					}
					justCopy(v, x);
				}
			})
		);
	}
	function justCopy(def: any, val: any) {
		let change = false;
		if (Array.isArray(def)) {
			def.length = 0;
			def.push.apply(def, val);
			if (val && val.length) change = true;
		} else if (typeof def == "object") {
			for (let k in def) {
				if (def[k] != val[k] && typeof def[k] != "function") {
					def[k] = val[k];
					change = true;
				}
			}
		}
		if (change) ignore_change++;
	}
	v = watchData(v as any, function (nval) {
		if (process.env.NODE_ENV === "development") {
			// 如果是开发环境，则检查数据类型是否一致
			deepDiff(originV, nval, function (paths, val1, val2) {
				if (val1 == null || val2 === undefined || paths.length > 1) {
					return false;
				}
				if (typeof val2 === "function") return false;
				if (Array.isArray(val1) && !Array.isArray(val2)) {
					console.error(`${key}#${paths.join(".")}由数组变为了(${typeof val2})${val2}`);
					return true;
				}
				if (val1 === undefined) {
					console.error(`${key}#${paths.join(".")}没有定义,变为了(${typeof val2})${val2}`);
					return true;
				}
				if (typeof val1 !== typeof val2) {
					console.error(
						`${key}#${paths.join(
							"."
						)}类型不一致:(${typeof val1})${val1}变为了(${typeof val2})${val2}`
					);
					return true;
				}
				return false;
			});
		}
		if (!init_status) {
			console.error(`${key}: 请在 waitLocals 之后再进行赋值`);
			return;
		}
		if (init_status < 3) {
			if (init_status == 2) {
				init_status = 3;
				initPms.resolve();
				console.log(key, "初始化成功");
			}
			return;
		}
		let value = JSON.stringify(v, (k, v) => (k[0] == "_" ? undefined : v));
		if (ignore_change > 0) {
			ignore_change--;
			console.warn("更新中...", latest == value);
		}
		if (latest == value) return;
		latest = value;
		console.log(key, "更新数据");
		agent!.write(latest, v);
	});
	watchLocalMap[key] = v;
	return v as any;
}

export function waitLocals() {
	return initPool.wait();
}

export function waitLocalWrite() {
	return nextTick().then(() => writePool.wait());
}

export function loading<T>(name: string, fn: (...args: any[]) => T): T;
export function loading<T>(fn: (...args: any[]) => T): T;
export function loading(
	this: any,
	name: string | ((...args: any[]) => any),
	fn?: (...args: any[]) => any
) {
	if (typeof name === "string") {
		if (this[name]) return;
		this[name] = true;
		return Promise.resolve()
			.then(() => fn!.call(this))
			.then(
				(data) => {
					this[name] = false;
					return data;
				},
				(err) => {
					this[name] = false;
					return Promise.reject(err);
				}
			);
	}
	return loading.call(this, "loading", name);
}

export function vueListen(
	evt: string,
	fn: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions
) {
	document.addEventListener(evt, fn, options);
	onBeforeUnmount(() => {
		document.removeEventListener(evt, fn, options);
	});
}

/**
 * 绑定快捷键
 */
export function bindHotkeys(
	map: {[key in HotKey]?: (evt: KeyboardEvent) => void},
	el?: HTMLElement | Document
) {
	if (!el) el = document;
	function fn(evt: KeyboardEvent) {
		let key = getHotkey(evt);
		if (!key) return;
		let fn = (map as any)[key];
		fn && fn(evt);
	}
	vueListen("keydown", fn, true);
}

type ComputedMap<T extends {[key: string]: (...args) => any}> = {
	[key in keyof T]: ReturnType<T[key]>;
};

export function makeStore<
	D extends object,
	C extends {[key: string]: (this: D, ...args: any[]) => any}
>(store: {data: D; computed: C}): D & ComputedMap<C> {
	let data = reactive(store.data);
	let map: any = {};
	for (let k in store.computed) {
		map[k] = computed(store.computed[k].bind(data));
	}
	return reactive({...toRefs(data), ...map});
}

export function callHook(vm, hook: string, args?: any[]) {
	if (vm.$children) {
		for (let i = 0; i < vm.$children.length; i++) {
			callHook(vm.$children[i], hook, args);
		}
	}
	if (vm.$options) {
		let hooks = vm.$options[hook];
		if (hooks && hooks.length) {
			hooks.forEach((fn) => fn.apply(vm, args || []));
		}
	}
}
