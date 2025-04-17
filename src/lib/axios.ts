import {cacheFirst, encodeHref, md5, sign} from "@/common/utils";
import Axios, {type AxiosRequestConfig, type AxiosResponse} from "axios";
import cfg from "./config";
import app from "../stores/app";
import {shareLocal} from "../stores/local";
import toast from "./toast";
import {onNeedLogin} from "../stores/actions";

declare module "axios" {
	interface AxiosRequestConfig {
		/** 显示加载中 */
		loading?: boolean | ((...args: any[]) => any);
		/** 忽略错误 */
		ignore?: boolean;
	}
	interface AxiosInstance {
		get<T = any, R = AxiosResponse<T>>(
			url: string,
			params?: any,
			config?: AxiosRequestConfig
		): Promise<R>;
		get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
	}
}

const axios = Axios.create({
	timeout: 30e3,
});

axios.get = (function (get) {
	return function (url: string, params: any, config?: AxiosRequestConfig) {
		if (!config) config = {};
		config.params = params;
		return get.call(axios, url, config) as any;
	};
})(axios.get);

function extendConfig(method: string, url: string, config?: AxiosRequestConfig) {
	if ((cfg as any).apiDomain && !/^\w+:\/\//.test(url)) url = (cfg as any).apiDomain + url;
	config = Object.assign({url, method, headers: {}}, config);
	if (
		cfg.signkey &&
		config.method == "post" &&
		config.data &&
		!/Buffer|Blob|File|FormData/.test(config.data.constructor.name)
	) {
		config.data.timestamp = Date.now();
		config.data.sign = sign(config.data, cfg.signkey);
	}
	if (shareLocal.user) {
		config.headers["X-Auth-Token"] = shareLocal.user.token;
	}
	if (config.loading !== false) app.loading = Math.max(1, app.loading + 1);
	return config;
}

function parseApi(res: AxiosResponse) {
	if (res.config.loading !== false) app.loading = Math.max(0, app.loading - 1);
	// #ifdef H5
	if (typeof res.data === "string" || res.data instanceof ArrayBuffer || res.data instanceof Blob) {
		return res.data;
	}
	// #endif
	// #ifndef H5
	if (typeof res.data === "string" || res.data instanceof ArrayBuffer) {
		return res.data;
	}
	// #endif
	if (res.data.code === 0) {
		return res.data.data;
	}
	if (!res.config.ignore) {
		setTimeout(() => {
			toast.error(res.data.msg);
		});
		if (res.data.code == 401) onNeedLogin();
	}
	return Promise.reject(res.data);
}

const apiGet0 = cacheFirst((url: string, config?: AxiosRequestConfig) => {
	return Promise.resolve()
		.then(() => extendConfig("get", url, config))
		.then((config) => axios(config))
		.catch((x) => ({...x, data: {code: -1, msg: x.toString(), err: x}}))
		.then(parseApi);
}, 500);

export function apiGet(url: string, params?: any, config?: AxiosRequestConfig) {
	return apiGet0(encodeHref(url, params), config);
}

export function apiPost(url: string, body?: any, config?: AxiosRequestConfig) {
	return Promise.resolve()
		.then(() => extendConfig("post", url, config))
		.then((config) => axios(Object.assign(config, {data: body})))
		.catch((x) => ({...x, data: {code: -1, msg: x.toString(), err: x}}))
		.then(parseApi);
}

export function apiFile(file: File, publicRead?: boolean) {
	const chunksize = 5 * 1024 * 1024;
	let offset = 0;
	let abort;
	let pms: Promise<string | void> = md5(file).then((md5) => {
		if (file.size < chunksize) {
			return apiPost("/file/create-upload", file, {
				params: {
					name: file.name,
					size: file.size,
					chunksize: 0,
					md5,
					acl: publicRead ? 1 : 0,
				},
				headers: {
					"content-type": "application/octet-stream",
				},
			});
		}
		return apiGet("/file/create-upload", {
			name: file.name,
			size: file.size,
			chunksize,
			md5,
			acl: publicRead ? 1 : 0,
		}).then((code) => {
			if (code && code.id) return code;
			let pms = Promise.resolve();
			let chunknum = 0;
			let n = Math.ceil(file.size / chunksize);
			while (n--) {
				pms = pms
					.then(
						() =>
							abort ||
							apiPost("/file/upload", file.slice(offset, offset + chunksize), {
								params: {code, chunknum},
								headers: {
									"content-type": "application/octet-stream",
								},
							})
					)
					.then((data) => {
						offset += chunksize;
						chunknum++;
						return data;
					});
			}
			return pms;
		});
	});

	return Object.assign(pms, {
		abort() {
			abort = Promise.reject("abort");
		},
	});
}

export function apiFileOss(file: File, publicRead?: boolean): Promise<{id: number}> {
	app.loading++;
	return md5(file)
		.then((md5) => {
			return apiGet("/file/start-oss", {
				name: file.name,
				size: file.size,
				md5,
				acl: publicRead ? 1 : 0,
			}).then((x) => {
				// 已经上传过了
				if (x.id) return x;
				x.data = file;
				return axios(x).then((x) => {
					return apiGet("/file/end-oss", {
						name: file.name,
						md5,
						acl: publicRead ? 1 : 0,
					});
				});
			});
		})
		.finally(() => app.loading--);
}

export function apiFileURL(file: File) {
	return apiFileOss(file, true).then((x) => apiGet("/file/get", x).then((x) => x.url));
}

export function apiFileUpload(file: File, dir: string, keepName?: boolean): Promise<string> {
	app.loading++;
	return md5(file)
		.then((md5) => {
			let pms = apiGet("/file/public-upload", {
				name: file.name,
				md5,
				dir,
				keep: keepName ? 1 : 0,
			}).then((x) => {
				// 已经上传过了
				if (!x.headers) return x.viewurl;
				x.data = file;
				return axios(x).then(() => x.viewurl);
			});
			if (keepName) return pms.then((url) => encodeHref(url, {h: md5}));
			return pms;
		})
		.finally(() => app.loading--);
}

export default Object.assign(axios, {
	apiGet,
	apiPost,
	apiFile,
	apiFileOss,
	apiFileURL,
	apiFileUpload,
});
