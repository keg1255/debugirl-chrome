import {defineManifest} from "@crxjs/vite-plugin";
import packageData from "../package.json" assert {type: "json"};

const isDev = process.env.NODE_ENV == "development";

export default defineManifest({
	name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ""}`,
	description: packageData.description,
	version: packageData.version,
	manifest_version: 3,
	icons: {
		16: "icons/16x16.png",
		48: "icons/48x48.png",
		96: "icons/96x96.png",
		128: "icons/128x128.png",
	},
	action: {
		default_popup: "popup.html",
		default_icon: "icons/48x48.png",
	},
	options_page: "options.html",
	// devtools_page: 'devtools.html',
	background: {
		service_worker: "src/background/index.ts",
		type: "module",
	},
	content_scripts: [
		{
			matches: ["http://*/*", "https://*/*"],
			all_frames: true,
			js: ["src/contentScript/index.ts"],
			run_at: "document_start",
		},
	],
	// side_panel: {
	//   default_path: 'sidepanel.html',
	// },
	web_accessible_resources: [
		{
			resources: ["icons/*", "sdk.min.js"],
			matches: ["http://*/*", "https://*/*"],
		},
	],
	externally_connectable: {
		matches: ["*://*/*"],
	},
	host_permissions: ["*://*/*"],
	permissions: [
		"debugger",
		"tabs",
		"cookies",
		"background",
		"activeTab",
		"webNavigation",
		// "contextMenus",
		// 'unlimitedStorage',
		"storage",
		"notifications",
		"scripting",
		// 'identity',
		// 'identity.email',
		"offscreen",
		"declarativeNetRequest",
		"webRequest",
		"proxy",
	],
	// chrome_url_overrides: {
	//   newtab: 'newtab.html',
	// },
});
