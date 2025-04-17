import app from "~/stores/app";
import {getOS, getOSversion, getBrowser, getUUID} from "./utils";

const userevent = {
	api: "",
	uid: 0,
	deviceId: "",
	os: "",
	osVersion: "",
	browser: "",
	version: "",
};

/**
 *
 * @param {Partial<typeof userevent>} conf
 */
export function initUserEvent(conf) {
	Object.assign(userevent, conf);
	if (!userevent.deviceId) userevent.deviceId = getUUID();
	if (!userevent.os) userevent.os = getOS();
	if (!userevent.osVersion) userevent.osVersion = getOSversion();
	if (!userevent.browser) userevent.browser = getBrowser();
	if (!userevent.version) userevent.version = app.version;
}

/**
 * 事件上报
 * @param {string} name
 * @param {number} [value]
 */
export function sendEvent(name, value) {
	let {api, ...rest} = userevent;
	let data = JSON.stringify({
		...rest,
		name,
		value,
	});
	console.warn("sendEvent", name, value);
	if (process.env.NODE_ENV === "development") return name;
	try {
		if (location.protocol === "https:" && navigator.sendBeacon) navigator.sendBeacon(api, data);
		else fetch(api, {body: data, method: "POST"});
	} catch (error) {
		console.error("sendEvent error", error);
	}
	return name;
}

/** 激活事件 */
export function sendActivityEvent() {
	if (localStorage.getItem("hd_first_visit_date")) return;
	sendEvent("activity");
	localStorage.setItem("hd_first_visit_date", Date.now());
}

export function sendLaunchEvent() {
	sendEvent("launch");
}

export function sendViewEvent(name) {
	sendEvent("view_" + name);
}

export function sendClickEvent(name, value) {
	sendEvent("click_" + name, value);
}

export function sendLoginEvent(user, name) {
	let uid = typeof user === "number" ? user : user.id;
	if (!uid) return console.error("登录事件需要uid");
	if (userevent.uid === uid) return;
	userevent.uid = uid;
	if (!name) name = "未知";
	sendEvent("login_" + name);
}
