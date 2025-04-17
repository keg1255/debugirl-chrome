<template>
	<hd-dialog-center @close="$emit('close')">
		<div class="dialogs-web-login">
			<!-- 手机登录 -->
			<div class="login-phone">
				<div class="login-title">账号密码登录</div>
				<!-- 账号 -->
				<i-input
					v-model="body.account"
					maxlength="11"
					class="input-box"
					placeholder="请输入你的账号"
					@submit="doLogin"
				></i-input>
				<div class="error-tips" :class="{show: accountError}">{{ accountError }}</div>
				<!-- 验证码 -->
				<div v-if="captchaURL" class="input-box">
					<i-input
						v-model="body.code"
						placeholder="验证码"
						maxlength="6"
						@submit="doLogin"
					></i-input>
					<img :src="captchaURL" alt="" @click="clickCaptcha" />
				</div>
				<div class="error-tips" :class="{show: accountError}">{{ accountError }}</div>
				<div class="input-box">
					<i-input
						v-model="body.passwd"
						placeholder="密码"
						type="password"
						maxlength="32"
						@submit="doLogin"
					></i-input>
				</div>
				<div class="error-tips" :class="{show: passwdError}">{{ passwdError }}</div>
				<div class="gray">请注意账号安全</div>
				<div class="login-btn" @click="doLogin">登录</div>
				<div v-if="dingding_client_id" class="dividing">其它登录方式</div>
				<div v-if="dingding_client_id" class="others">
					<i-svg name="dingding" @click="dingding"></i-svg>
				</div>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script>
import axios from "~/lib/axios";
import config from "~/lib/config";
export default {
	name: "WebLogin",
	components: {},
	props: {},
	emits: ["close"],
	data() {
		return {
			body: {
				account: "",
				passwd: "",
			},
			accountError: "",
			passwdError: "",
			captchaURL: "",
			dingding_client_id: config.dingding_client_id,
		};
	},
	computed: {},
	watch: {},
	mounted() {},
	methods: {
		doLogin() {
			return axios
				.apiPost("/users/login", this.body)
				.then((user) => {
					this.$emit("close", user);
				})
				.catch((e) => {
					if (/图片验证码/.test(e.msg) || (this.captchaURL && /密码不正确/.test(e.msg))) {
						this.clickCaptcha();
					}
				});
		},
		clickCaptcha(e) {
			axios
				.apiGet("/sys/captcha", {
					scene: "login",
					base64: 1,
				})
				.then((e) => {
					this.captchaURL = e.url;
					this.body.token = e.token;
				});
			if (e) e.target.previousElementSibling.focus();
		},
		dingding() {
			const redirect_uri = location.href;
			let apiurl = config.apiDomain;
			if (!/^https?:/.test(apiurl)) {
				apiurl = location.origin + apiurl;
			}
			location.href = `https://login.dingtalk.com/oauth2/challenge.htm?redirect_uri=${apiurl}/users/dingding&response_type=code&client_id=${this.dingding_client_id}&scope=snsapi_login&state=${redirect_uri}&prompt=consent`;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-web-login {
	max-width: 100vw;
	background: #ffffff;
	box-shadow: 2px 7px 20px rgba(85, 111, 153, 0.11);
	padding: 3rem;
	display: flex;

	.gray {
		font-size: 15px;
		color: #7b8794;
	}
	.link {
		.magic-link(@primary);
		color: @primary;
	}
	.badge {
		display: none;
		position: absolute;
		right: 43px;
		top: 3px;
	}
	.login-phone {
		.login-title {
			font-size: 19px;
			color: #2a303b;
			font-weight: bold;
			margin-bottom: 24px;
		}
		.i-input {
			border: 1px solid #e2e8f0;
			height: 52px;
			padding: 12px 14px;
			flex: 1;
		}
		.input-box {
			position: relative;
			width: 320px;
			display: flex;
			.input-btn {
				.magic-link(@primary);
				color: @primary;
				position: absolute;
				right: 12px;
				top: 50%;
				transform: translateY(-50%);
			}
			img {
				transform: translateX(12px);
			}
		}
		.error-tips {
			height: 20px;
			width: 100%;
			color: @error;
			line-height: 20px;
			opacity: 0;
			&.show {
				opacity: 1;
			}
		}
		.gray {
			margin-top: 16px;
		}
		.login-btn {
			width: 320px;
			height: 52px;
			font-weight: bold;
			font-size: 16px;
			margin-top: 12px;
			.flex-center;
			.magic-bg-btn(@primary);
		}
	}
	.dividing {
		.dividing-line(#C4C4C4, 40px);
		font-size: 12px;
		font-weight: 400;
		color: #1c2028;
		width: 192px;
		margin: 24px auto;
		&::before {
			background: linear-gradient(270deg, #e2e6f3 0%, rgba(226, 230, 243, 0) 100%);
		}
		&::after {
			background: linear-gradient(90deg, #e2e6f3 0%, rgba(226, 230, 243, 0) 100%);
		}
	}
	.others {
		display: flex;
		justify-content: space-around;
		> .i-svg {
			width: 40px;
			height: 40px;
		}
	}
}
</style>
