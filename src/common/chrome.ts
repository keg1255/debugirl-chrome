import {Buffer} from "buffer";
import {newPromise, sleep} from "./utils";

const removeMap = new Map<number, IPromise<void>>();
const loadingMap = new Map<number, IPromise<void>>();
const completeMap = new Map<number, IPromise<void>>();
chrome.tabs.onRemoved.addListener((tabId) => {
	const item = removeMap.get(tabId);
	if (item) {
		item.resolve();
		removeMap.delete(tabId);
		loadingMap.delete(tabId);
		completeMap.delete(tabId);
	}
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status == "loading") {
		let item = loadingMap.get(tabId);
		if (item) {
			item.resolve();
			loadingMap.delete(tabId);
		}
		return;
	}
	if (changeInfo.status == "complete") {
		let item = completeMap.get(tabId);
		if (item) {
			item.resolve();
			completeMap.delete(tabId);
		}
	}
});

export function waitLoading(tabId: number) {
	let pms = removeMap.get(tabId);
	if (!pms) {
		pms = newPromise();
		removeMap.set(tabId, pms);
	}
	return pms;
}

export function waitComplete(tabId: number) {
	let item = completeMap.get(tabId);
	if (!item) {
		item = newPromise();
		completeMap.set(tabId, item);
	}
	return item;
}

export function waitRemoved(tabId: number) {
	let pms = removeMap.get(tabId);
	if (!pms) {
		pms = newPromise();
		removeMap.set(tabId, pms);
	}
	return pms;
}

export function waitGone(tabId: number) {
	return Promise.race([waitRemoved(tabId), waitLoading(tabId)]);
}

export async function waitLoaded(tabId: number) {
	while (true) {
		let tab = await chrome.tabs.get(tabId);
		if (tab.status == "complete") return;
		await waitComplete(tabId);
		await sleep(500);
	}
}

export function isBackground() {
	return !("window" in self);
}

const notifyMap = new Map<string, Promise<string>>();
export function notify(opt: {title: string; message: string; iconUrl?: string}) {
	let {title, message, iconUrl} = opt;
	if (!iconUrl) iconUrl = chrome.runtime.getURL("icons/128x128.png");
	let prev = notifyMap.get(title);
	if (prev) {
		prev.then((id) => {
			chrome.notifications.clear(id);
		});
	}
	let pms = new Promise<string>((resolve, reject) => {
		chrome.notifications.create(
			{
				type: "basic",
				iconUrl,
				title,
				message,
			},
			resolve
		);
	});
	notifyMap.set(title, pms);
	return pms;
}
