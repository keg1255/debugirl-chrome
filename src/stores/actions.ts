// 定义一些全局的actions
import app from "./app";
import {shareLocal} from "./local";
import {dlg} from "~/dialogs";
import {clearKeys, compare, decodeQuery, encodeQuery, isEmpty, onlyone} from "@/common/utils";
import axios, {apiGet} from "../lib/axios";
import {sendActivityEvent, sendLaunchEvent} from "@/common/userevent";

export function onLogin(user, loginby?: string) {
	shareLocal.user = user;
}

export function logout() {
	if (shareLocal.user) axios.apiGet("/users/logout").finally(() => (shareLocal.user = null));
	else shareLocal.user = null;
}

export const refreshUserInfo = onlyone(async function () {
	if (!shareLocal.user) {
		let query = decodeQuery(location.search.slice(1));
		if (query.code && /^[\w\+\/\=]+\.\w{32}$/.test(query.code))
			return axios
				.apiGet("/users/third-login", {code: query.code})
				.then((x) => {
					shareLocal.user = x;
					return true;
				})
				.catch((e) => {
					console.error(e);
					logout();
					return false;
				})
				.finally(() => {
					delete query.code;
					let url = location.origin + location.pathname + "?" + encodeQuery(query);
					if (url.endsWith("?")) url = url.slice(0, -1);
					history.replaceState({}, "", url);
				});
		return false;
	}
	return apiGet("/users/whoami", null, {loading: false})
		.then((x) => {
			let user = {...x};
			let prev = {...shareLocal.user};
			delete user.online_at;
			delete user.online_max;
			delete prev.online_at;
			delete prev.online_max;
			if (compare(user, prev)) return true;
			console.log("user", clearKeys({...user}, prev));
			shareLocal.user = x;
			return true;
		})
		.catch((e) => {
			console.error(e);
			if (e && e.code == 401) logout();
			return false;
		});
});

export function addUsers(users) {
	users.forEach((x) => (app.userMap[x.id] = x));
}

export function getUser(id, key) {
	if (key) {
		let user = app.userMap[id];
		if (!user) return null;
		return user[key];
	}
	return app.userMap[id] || null;
}

export function onNeedLogin() {
	return dlg.show("Login").then((user) => onLogin(user));
}

export async function checkMobileOrder() {
	if (!shareLocal.user) return false;
	let id = localStorage.getItem("mobile_pay_id");
	if (!id) return false;
	localStorage.removeItem("mobile_pay_id");
	apiGet("/pay/webpay_query", {id}, {loading: false}).then((ret) => {
		if (ret.pay_at > 0) {
			refreshUserInfo();
		}
	});
}

export function showLoading(msg?: string, cancelToken?: {cancel: (msg?: string) => void}) {
	app.loading_msg = msg;
	app.loading_cancel = cancelToken;
	app.loading = 1;
}

export function hideLoading() {
	app.loading = 0;
	app.loading_msg = "";
	app.loading_cancel = null;
}

let isFirstStart = true;
/**
 * 软件首页启动时调用, 通常在 pages/index.vue 的 mounted 中调用
 * 通用的处理放这里, 项目专用的处理放 pages/index.vue
 */
export function onAppStart() {
	console.log("isFirstStart", isFirstStart);
	if (!isFirstStart) return;
	isFirstStart = false;
	// 目前为虚拟登录状态
	if (localStorage.getItem("virtual_user_token")) {
		if (shareLocal.user) localStorage.removeItem("virtual_user_token");
		else dlg.show("Login", {usertoken: localStorage.getItem("virtual_user_token")});
	}
	// 启动事件
	sendLaunchEvent();
	// 激活事件
	sendActivityEvent();
	return true;
}
