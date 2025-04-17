import {Buffer} from "buffer";
import app from "../stores/app";
import {local, shareLocal} from "../stores/local";
import toast from "../lib/toast";
import {dlg} from "~/dialogs";
import config from "~/lib/config";

export function installInject(vueApp) {
	app.host = location.host;

	function inject(key, value) {
		vueApp.config.globalProperties[key] = value;
	}
	inject("$app", app);
	inject("$local", local);
	inject("$toast", toast);
	inject("$dlg", dlg);
}
