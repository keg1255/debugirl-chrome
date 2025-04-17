import {addChromeApi} from "./chrome_runner";
import {notify, waitLoaded, waitRemoved} from "~/common/chrome";

let notify_map = new Map();
chrome.notifications.onClicked.addListener(function (id) {
	let url = notify_map.get(id);
	if (url) {
		chrome.tabs.create({url});
		chrome.notifications.clear(id);
		notify_map.delete(id);
	}
});

addChromeApi("chrome.notify", async function (opt) {
	let {title, message, iconUrl} = opt;
	return notify({title, message, iconUrl});
});

addChromeApi("chrome.waitLoaded", async function (tabId) {
	return waitLoaded(tabId);
});

addChromeApi("chrome.waitRemove", async function (tabId) {
	return waitRemoved(tabId);
});

addChromeApi("chrome.fetch", async function (url, opt) {
	return fetch(url, opt);
});
