<template>
	<hd-dialog-center>
		<div class="dialogs-login">
			<div class="dialogs-login__right">
				<i-svg class="close" src="./assets/close.svg" @click="onClose"></i-svg>
				<!-- 微信登录 -->
				<div v-if="mode == 'wx'" class="login-right">
					<div class="login-title">
						<i-svg src="./assets/wechat.svg"></i-svg>
						微信扫码登录
						<div v-if="!isMobile && last_login_mode == 'wx'" class="last-login">上次登录</div>
					</div>
					<div class="login-weixin">
						<iframe
							ref="webview"
							frameborder="0"
							sandbox="allow-scripts allow-top-navigation allow-same-origin"
							:src="weixin_url"
							@load="loaded = true"
						></iframe>
						<i-loading v-show="!loaded"></i-loading>
					</div>
				</div>
				<!-- 手机登录 -->
				<div v-else class="login-right login-phone">
					<h1 class="show-mobile">手机快捷登录</h1>
					<div class="tip show-mobile">输入您的手机号，进行验证码登录</div>
					<hd-form-phone ref="fp" @login="doLogin"></hd-form-phone>
					<label class="user-agreement show-mobile">
						<input v-model="checked" type="checkbox" />
						请勾选并同意<span class="link" @click="openUserAgreement">《用户协议》</span>及<span
							class="link"
							@click="openPrivacy"
							>《隐私政策》</span
						>
					</label>
				</div>
				<div v-show="!isMobile" class="dividing">其它登录方式</div>
				<div v-show="!isMobile" class="others">
					<div class="item qq" @click="qqLogin">
						<i-svg name="qq"></i-svg>
						<div class="name">QQ登录</div>
						<div v-if="last_login_mode == 'qq'" class="last-login">上次登录</div>
					</div>
					<div v-if="mode != 'wx'" class="item weixin" @click="mode = 'wx'">
						<i-svg name="weixin"></i-svg>
						<div class="name">微信登录</div>
						<div v-if="last_login_mode == 'wx'" class="last-login">上次登录</div>
					</div>
					<div v-if="mode != 'phone'" class="item phone" @click="mode = 'phone'">
						<i-svg name="phone"></i-svg>
						<div class="name">手机登录</div>
						<div v-if="last_login_mode == 'phone'" class="last-login">上次登录</div>
					</div>
				</div>
			</div>
		</div>
	</hd-dialog-center>
</template>

<script lang="ts">
import {Buffer} from "buffer";
import axios from "~/lib/axios";
import {encodeQuery, isMobile, watchLocal} from "@/common/utils";
import {onLogin} from "~/stores/actions";
import toast from "~/lib/toast";
import config from "~/lib/config";

const weixin_appid = "wx4fb27087911b4d4f";
function getWeixinURL(appid: string) {
	const redirect = "https://www.quan2go.com/login-callback.html?appid=" + appid;
	const redirect_uri =
		`https://www.quan2go.com/api/users/wechat-web?` + encodeQuery({appid, from: redirect});
	return (
		`https://open.weixin.qq.com/connect/qrconnect?` +
		encodeQuery({
			appid,
			scope: "snsapi_login",
			redirect_uri,
			state: "",
			login_type: "jssdk",
			self_redirect: "true",
			styletype: "",
			sizetype: "",
			bgcolor: "",
			rst: "",
			href:
				"data:text/css;base64," +
				Buffer.from(
					`.title{display:none}
.impowerBox .info{position:absolute;top:0;left:0;right:0;bottom:0;width:auto;display:flex;align-items:center;justify-content:center}
.js_wx_default_tip{display:none}
.status_txt{display:none !important}
.impowerBox .status.normal{background:none;box-shadow:none;-webkit-box-shadow:none;}
.impowerBox .status_icon{margin:0}
body{padding:0 !important;background:none !important;overflow:hidden}
*{user-select:none}
.impowerBox .wrp_code .qrcode{border:0;margin:0;width:100%}`
				).toString("base64"),
		})
	);
}

export default {
	props: {
		usertoken: String,
		bindid: [String, Number],
	},
	emits: ["close"],
	data() {
		return {
			mode: this.usertoken ? "phone" : "wx", // wx, qq, phone
			checked: false,
			local: watchLocal("login.local", {
				last_login_mode: "",
			}),
			isMobile: false,
			loaded: false,
			weixin_url: getWeixinURL(weixin_appid),
		};
	},
	computed: {
		last_login_mode() {
			return this.local.last_login_mode;
		},
	},
	watch: {
		mode(val) {
			if (val == "wx") this.loaded = false;
		},
	},
	mounted() {
		if (isMobile()) {
			this.isMobile = true;
			this.mode = "phone";
		}

		window.addEventListener("message", this.onmessage);
		window.addEventListener("paste", this.onpaste);
	},
	beforeUnmount() {
		window.removeEventListener("message", this.onmessage);
		window.removeEventListener("paste", this.onpaste);
	},
	methods: {
		onmessage(e) {
			this.willNavigate(e.data);
		},
		onpaste(e) {
			let text = e.clipboardData.getData("text");
			try {
				let data = JSON.parse(text);
				this.willNavigate(data);
			} catch (error) {
				console.error(text, error);
			}
		},
		onClose() {
			this.$emit("close");
		},
		// 登录事件
		async onLogin(user, mode) {
			this.local.last_login_mode = mode;
			onLogin(user, mode);
			this.$emit("close", user);
		},
		onWeixin(user) {
			// 登录成功 微信
			this.onLogin(user, "wx");
		},
		// 点击登录按钮进行登录
		async doLogin() {
			let shake = this.$el.querySelector(".user-agreement");
			if (!this.checked && shake && shake.clientWidth) {
				if (shake) {
					shake.classList.add("shake");
					setTimeout(() => {
						shake.classList.remove("shake");
					}, 1000);
				}
				return;
			}
			try {
				let user = await this.$refs.fp.submit();
				if (!user) return;
				console.log("user", user);
				// 登录成功 手机
				this.onLogin(user, "phone");
			} catch (err) {
				toast.error(err);
			}
		},
		openUserAgreement() {
			window.open(config.userAgreement);
		},
		openPrivacy() {
			window.open(config.privacy);
		},
		qqLogin() {
			let features =
				"height=500, width=800, top=200, left=500, toolbar=no, menubar=no, scrollbars=no,resizable=no, location=no, status=no";
			let url =
				`https://graph.qq.com/oauth2.0/authorize?` +
				encodeQuery({
					display: "pc",
					client_id: "102066647",
					response_type: "code",
					scope: "all",
					redirect_uri: `https://www.quan2go.com/api/users/webqq?from=${encodeURIComponent(
						"https://www.quan2go.com/login-callback.html?type=qq-login-callback"
					)}`,
					state: "state",
				});
			window.open(url, "QQ登录", features);
		},
		async willNavigate({type, code}) {
			if (!code) return;
			if (type == "qq-login-callback") {
				let user = await axios.apiPost("/users/webqq", {code}).catch(() => {});
				if (user) {
					this.onLogin(user, "qq");
				}
				return;
			}
			if (type == "weixin-login-callback") {
				let user = await axios
					.apiPost("/users/wechat-web", {code, appid: weixin_appid})
					.catch(() => {});
				if (user) {
					this.onLogin(user, "wx");
				}
			}
		},
	},
};
</script>

<style lang="less">
@import "~@/styles/define.less";

.dialogs-login {
	display: flex;
	max-width: 100vw;
	background: #ffffff;
	border-radius: 10px;
	font-family: Microsoft YaHei UI;
	> .dialogs-login__right {
		width: 331px;
		padding: 43px 20px;
		position: relative;
		.top-tip {
			position: absolute;
			top: 14px;
			left: 20px;
			right: 41px;
			font-size: 12px;
			font-weight: 400;
			color: #ff7a00;
			line-height: 19px;
		}
		> .close {
			position: absolute;
			right: 10px;
			top: 10px;
			width: 26px;
			height: 26px;
		}
	}

	.last-login {
		position: absolute;
		left: 100%;
		top: -23px;
		font-size: 12px;
		width: 55px;
		height: 23px;
		line-height: 23px;
		text-align: center;
		background: @primary;
		border-radius: 6px 6px 6px 0px;
		color: #fff;
	}
	.login-right {
		position: relative;
		text-align: center;
		line-height: 1;
		.login-title {
			font-size: 20px;
			font-weight: bold;
			color: #1c2028;
			position: relative;
			display: inline-flex;
			align-items: center;
			> .i-svg {
				margin-right: 10px;
			}
			.last-login {
			}
		}
		.login-weixin {
			width: 180px;
			height: 180px;
			margin: 13px auto 37px;
			position: relative;
			iframe {
				height: 100%;
				position: relative;
				z-index: 1;
			}
		}
	}
	.login-phone {
		padding-top: 23px;
		.login-title {
			margin-bottom: 44px;
		}
		.user-agreement {
			font-size: 14px;
			color: #757e8a;
			margin-bottom: 47px;
			margin-top: 16px;
			text-align: left;
			.link {
				.magic-link(@primary);
				color: @primary;
			}
			&.shake {
				animation: shake 0.3s ease-in-out 0s 2;
				@keyframes shake {
					0% {
						transform: translateX(0);
					}
					25% {
						transform: translateX(5px);
					}
					50% {
						transform: translateX(0);
					}
					75% {
						transform: translateX(-5px);
					}
					100% {
						transform: translateX(0);
					}
				}
			}
		}
	}
	.dividing {
		.dividing-line(#C4C4C4, 40px);
		font-size: 12px;
		font-weight: 400;
		color: #1c2028;
		width: 192px;
		margin: 0 auto;
		margin-bottom: 30px;
		&::before {
			background: linear-gradient(270deg, #e2e6f3 0%, rgba(226, 230, 243, 0) 100%);
		}
		&::after {
			background: linear-gradient(90deg, #e2e6f3 0%, rgba(226, 230, 243, 0) 100%);
		}
	}

	.others {
		display: flex;
		width: 142px;
		margin: 0 auto;
		justify-content: space-between;
		> .item {
			text-align: center;
			cursor: pointer;
			position: relative;
			> .i-svg {
				margin-bottom: 8px;
				svg {
					width: 32px;
					height: 32px;
				}
			}
			> .name {
				font-size: 12px;
				color: #8ca1b1;
			}
			> .last-login {
				top: -15px;
				left: 86%;
			}
		}
	}
}

@media screen and (max-width: @mobile-width) {
	.dialogs-login {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		border-radius: 0;
		padding: 0;
		> img {
			display: none;
		}
		> .dialogs-login__right {
			width: 100%;
			padding: 20.67vw 10.67vw 0;
		}
		> .back {
			width: 24px;
			height: 24px;
			position: fixed;
			top: 10px;
			left: 16px;
		}
		.last-login {
			display: none;
		}
		.login-phone {
			text-align: left;
			> h1 {
				font-size: 6.4vw;
				font-weight: 600;
				color: #1c2028;
				line-height: 7.5vw;
				margin-bottom: 1.87vw;
			}
			> .tip {
				font-size: 3.2vw;
				font-weight: 400;
				color: #999999;
				line-height: 3.75vw;
				margin-bottom: 13.33vw;
			}
			.login-title {
				font-size: 24px;
				margin-bottom: 10px;
			}
			.input-box {
				height: 14.93vw;
				background: #f8f9fa;
				border-radius: 2.67vw 2.67vw 2.67vw 2.67vw;
				.lefticon {
					width: 6.4vw;
					height: 6.4vw;
					left: 5.33vw;
					top: 4.27vw;
					> svg {
						width: 6.4vw;
						height: 6.4vw;
						color: #9da9b9;
					}
					+ input {
						padding-left: 15.73vw;
						background-color: transparent;
					}
				}
				.input-btn {
					padding: 0 5.53vw;
					margin: 0;
					width: auto;
					background-color: transparent;
					color: #1c77ff;
					height: 14.93vw;
					line-height: 14.93vw;
					font-size: 4.27vw;
					&.disabled {
						background-color: transparent;
						color: #999999;
					}
				}
				img {
					transform: translateX(0);
				}
			}
			.image-code {
				padding-left: 5.87vw;
				.input-btn {
					padding: 0 4vw;
				}
			}
			.i-input {
				border: 0;
				width: 1px;
				font-size: 4.27vw;
				flex: 1;
			}
			.error-tips {
				height: 16px;
				line-height: 16px;
				font-size: 12px;
				margin-bottom: 14px;
			}
			.login-btn {
				height: 13.33vw;
				border-radius: 2.67vw 2.67vw 2.67vw 2.67vw;
				margin-top: 0;
				font-size: 4.27vw;
				margin-bottom: 6.13vw;
				&.disabled {
					background: #e5eaf1;
					opacity: 1;
				}
			}
			.user-agreement {
				display: flex;
				align-items: center;
				font-size: 3.2vw;
				line-height: 1;
				margin: 0;
				> input {
					margin-right: 2.53vw;
				}
			}
		}
		.dividing {
			.dividing-line(#C4C4C4, 40px);
			color: #333;
			width: 192px;
			margin: 0 auto;
			margin-bottom: 30px;
		}

		.others {
			display: flex;
			width: 142px;
			margin: 0 auto;
			justify-content: space-between;
			> .item {
				text-align: center;
				cursor: pointer;
				position: relative;
				> .i-svg {
					margin-bottom: 8px;
					svg {
						width: 32px;
						height: 32px;
					}
				}
				> .name {
					font-size: 12px;
					color: #8ca1b1;
				}
				> .last-login {
					top: -15px;
					left: 86%;
				}
			}
		}
	}
}
</style>
