import {createApp} from "vue";
import {installDirective} from "./directive";
import {installInject} from "./inject";
import "~/styles/common.less";
import "~/styles/index.less";
import {Buffer} from "buffer";
import {createRouter, createWebHashHistory} from "vue-router";
import Layout from "~/layouts/default.vue";
import {waitLocals} from "~/common/utils/vuetool";
import {refreshUserInfo} from "~/stores/actions";
import {local} from "~/stores/local";
import app from "~/stores/app";
import {isMacos, isMobile} from "~/common/utils";

globalThis.Buffer = Buffer;

const VER = 1;
export function createPage(routes: any[]) {
	return waitLocals().then(() => {
		const win: any = window;
		win.app = app;
		win.local = local;
		refreshUserInfo();
		setInterval(() => {
			app.tick = Math.floor(Date.now() / 1000) * 1e3;
		}, 1e3);
		// 更新联网状态
		app.online = navigator.onLine;
		window.addEventListener("online", () => {
			app.online = true;
		});
		window.addEventListener("offline", () => {
			app.online = false;
		});
		// 更新窗口可见状态
		app.hidden = document.hidden;
		document.addEventListener("visibilitychange", () => {
			app.hidden = document.hidden;
		});
		// 更新鼠标左键按下状态
		document.addEventListener(
			"mousedown",
			(e) => {
				app.leftmouse = e.button === 0;
			},
			true
		);
		document.addEventListener(
			"mouseup",
			(e) => {
				app.leftmouse = false;
			},
			true
		);
		// 更新ua
		app.ua.mobile = isMobile();
		app.ua.desktop = !app.ua.mobile;
		app.ua.macos = isMacos();
		for (let k in app.ua) {
			document.body.classList.add(app.ua[k] ? k : "no-" + k);
		}
		// 更新窗口大小
		window.addEventListener("resize", () => {
			// 监听resize事件，并修改最大化状态
			app.maxed =
				window.screen.availWidth === window.outerWidth &&
				window.screen.availHeight === window.outerHeight;
			app.fulled = document.fullscreenElement != null;
			app.innerWidth = window.innerWidth;
			app.innerHeight = window.innerHeight;
		});
		window.addEventListener("scroll", () => {
			app.scrollY = window.scrollY;
		});
		app.scrollY = window.scrollY;
		app.innerWidth = window.innerWidth;
		app.innerHeight = window.innerHeight;

		//! 本地数据升级，当local数据结构变化时需要做兼容处理
		if (local.version < 1) {
			// 数据本地升级
		}
		local.version = VER;

		const vue = createApp(Layout);
		const router = createRouter({
			history: createWebHashHistory(),
			routes,
		});
		vue.use(router);
		installDirective(vue);
		installInject(vue);
		return vue.mount("#app");
	});
}
