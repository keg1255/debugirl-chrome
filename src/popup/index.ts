chrome.tabs.query({}, (tabs) => {
	let url = chrome.runtime.getURL("options.html");
	let tab = tabs.find((tab) => tab.url.startsWith(url));
	if (tab) {
		chrome.tabs.update(tab.id, {active: true});
	} else {
		chrome.tabs.create({url: url + "#/my-scripts/?pageSize=100"});
	}
});
