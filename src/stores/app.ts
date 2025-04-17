import {makeStore} from "@/common/utils";
import {shareLocal} from "./local";

const app = makeStore({
	data: {
		ua: {
			desktop: false,
			mobile: false,
			macos: false,
		},
		loading: 0, // 加载中
		loading_msg: "", // 加载中提示
		loading_cancel: null, // 取消加载
		tick: Date.now(), // 当前时间
		online: true, // 网络状态
		hidden: false, // 窗口是否可见
		host: "", // 当前域名,支持服务端渲染
		baseURL: "", //
		maxed: false, // 是否最大化
		fulled: false, // 是否全屏
		newVersion: "", // 新版本号
		innerWidth: 1920, // 宽度
		innerHeight: 1080, // 高度
		scrollY: 0,
		leftmouse: false, // 鼠标左键是否按下
		version: "",
		userMap: {}, // 用户信息
	},
	computed: {
		second() {
			return Math.floor(this.tick / 1000);
		},
		uid() {
			return shareLocal.user && shareLocal.user.id;
		},
		isvip() {
			let user = shareLocal.user;
			return user && user.vip && user.vip.expire_at > this.tick;
		},
		isMobile() {
			return this.innerWidth < 540;
		},
	},
});

export default app;
