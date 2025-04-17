<template>
	<div class="hd-form-phone">
		<!-- 手机号 -->
		<div class="input-box">
			<i-svg class="lefticon" src="./assets/phone-input.svg"></i-svg>
			<i-input
				ref="phoneInput"
				:value="phoneNumber"
				maxlength="11"
				mask="num"
				placeholder="请输入你的手机号"
				@input="onPhoneNumber"
				@blur="onChangePhonneNumber"
			></i-input>
		</div>
		<div class="error-tips" :class="{show: phoneError}">{{ phoneError }}</div>
		<!-- 图片验证码 -->
		<template v-if="imageURL">
			<div class="input-box image-code">
				<i-input
					ref="imageInput"
					:value="imageCode"
					placeholder="图形验证码"
					maxlength="4"
					@input="onImageCode"
					@blur="onChangeImageCode"
				></i-input>
				<span class="input-btn">
					<img :src="imageURL" @click="onClickImageCode()" />
				</span>
			</div>
			<div class="error-tips" :class="{show: imageError}">{{ imageError }}</div>
		</template>
		<!-- 验证码 -->
		<div class="input-box">
			<i-svg class="lefticon" src="./assets/phone-sms.svg"></i-svg>
			<i-input
				ref="smsInput"
				:value="smsCode"
				placeholder="验证码"
				class="smscode"
				mask="num"
				maxlength="4"
				@input="onSmsCode"
			></i-input>
			<span
				class="input-btn"
				:class="{disabled: smsTimeout > 0 || !phoneNumber || phoneError}"
				@click="sendSms()"
			>
				{{ smsTimeout ? smsTimeout + "s" : "获取验证码" }}
			</span>
		</div>
		<div class="error-tips" :class="{show: smsError}">{{ smsError }}</div>
		<div
			class="login-btn"
			:class="{disabled: !phoneNumber || !smsCode}"
			@click="emit('login', {phone: phoneNumber, imgcode: imageCode, smscode: smsCode})"
		>
			登录
		</div>
	</div>
</template>
<script setup lang="ts">
import {debounce, formatError, isChineseMobilePhone, onlyone} from "~/common/utils";
import {PhoneLogin, type PhoneLoginBase} from "./form-phone.lib";
import toast from "~/lib/toast";
import {onUnmounted, ref, useTemplateRef} from "vue";

const props = withDefaults(
	defineProps<{
		phone?: PhoneLoginBase;
	}>(),
	{
		phone: () => new PhoneLogin(),
	}
);

const emit = defineEmits(["login"]);

const phoneNumber = ref(""); // 手机号
const imageCode = ref(""); // 图片验证码
const smsCode = ref(""); // 验证码
const smsTimeout = ref(0); // 验证码倒计时
const imageURL = ref(""); // 图片验证码地址
const phoneError = ref(""); // 手机号错误
const imageError = ref("");
const smsError = ref("");

const phoneInput = useTemplateRef<HTMLInputElement>("phoneInput");
const imageInput = useTemplateRef<HTMLInputElement>("imageInput");
const smsInput = useTemplateRef<HTMLInputElement>("smsInput");

// Methods
function onPhoneNumber(str: string) {
	if (str.length > 11) str = str.slice(0, 11);
	phoneNumber.value = str;
	if (phoneError.value) onChangePhonneNumber();
	if (imageURL.value) {
		imageURL.value = "";
	}
}

function onChangePhonneNumber() {
	if (!phoneNumber.value) {
		phoneError.value = "请输入手机号";
	} else if (!isChineseMobilePhone(phoneNumber.value)) {
		phoneError.value = "手机号不正确";
	} else {
		phoneError.value = "";
	}
}

function onImageCode(str: string) {
	if (str.length > 4) str = str.slice(0, 4);
	imageCode.value = str;
	if (imageError.value) onChangeImageCode();
}

function onChangeImageCode() {
	if (imageURL.value && !imageCode.value) {
		imageError.value = "请输入图形验证码";
	} else {
		imageError.value = "";
	}
}

function getImageCode() {
	imageError.value = "";
	imageCode.value = "";
	return props.phone.getCaptchaImage().then((url) => {
		imageURL.value = url;
		setTimeout(() => {
			imageInput.value?.focus();
		}, 500);
	});
}
const onClickImageCode = debounce(getImageCode);

var timer;
const sendSms = onlyone(async function () {
	if (!phoneNumber.value) {
		onChangePhonneNumber();
		phoneInput.value?.focus();
		return;
	}
	if (smsTimeout.value > 0) return toast.error(`请${smsTimeout.value}秒后再试`);
	smsError.value = "";
	return props.phone
		.sendSms({phone: phoneNumber.value, imgcode: imageCode.value, getImageCode: getImageCode})
		.then(() => {
			smsTimeout.value = 60;
			clearInterval(timer);
			timer = setInterval(() => {
				smsTimeout.value--;
				if (smsTimeout.value <= 0) {
					clearInterval(timer);
				}
			}, 1000);
		})
		.catch((e) => {
			toast.error(e);
		});
});

onUnmounted(() => {
	clearInterval(timer);
});

function onSmsCode(str: string) {
	if (str.length > 4) str = str.slice(0, 4);
	smsCode.value = str;
	if (smsError.value) onChangeSmsCode();
}

function onChangeSmsCode() {
	if (!smsCode.value) {
		smsError.value = "请输入验证码";
	} else if (!/^[0-9]{4,6}$/.test(smsCode.value)) {
		smsError.value = "请输入正确的验证码";
	} else {
		smsError.value = "";
	}
}

async function doLogin() {
	if (!phoneNumber.value) {
		onChangePhonneNumber();
		phoneInput.value?.focus();
		return;
	}
	if (imageURL.value && !imageCode.value) {
		onChangeImageCode();
		imageInput.value?.focus();
		return;
	}
	if (!smsCode.value) {
		onChangeSmsCode();
		smsInput.value?.focus();
		return;
	}
	return props.phone.submit({phone: phoneNumber.value, smscode: smsCode.value}).catch((e) => {
		smsError.value = formatError(e);
		throw e;
	});
}

defineExpose({
	submit: doLogin,
});
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-form-phone {
	.input-box {
		position: relative;
		display: flex;
		align-items: center;
		.lefticon {
			width: 24px;
			height: 24px;
			position: absolute;
			left: 10px;
			top: 12px;
			z-index: 1;
			+ input {
				padding-left: 44px;
			}
		}
		.smscode {
			// width: 186px;
			flex: 1;
		}
		.input-btn {
			width: 110px;
			height: 48px;
			line-height: 48px;
			border-radius: 10px;
			font-size: 14px;
			font-weight: 400;
			background: #1c77ff;
			color: #ffffff;
			text-align: center;
			white-space: nowrap;
			display: inline-block;
			margin-left: 10px;
			cursor: pointer;
			&.disabled {
				opacity: 0.5;
			}
		}
	}
	.image-code {
		input {
			padding-left: 12px;
		}
		.input-btn {
			background-color: transparent;
		}
	}
	.i-input {
		width: 291px;
		height: 48px;
		background: #f5f9fd;
		border-radius: 10px;
		border: 1px solid rgba(17, 35, 61, 0.1);
		font-size: 14px;
	}
	.error-tips {
		text-align: left;
		height: 15px;
		width: 100%;
		color: @error;
		line-height: 16px;
		opacity: 0;
		font-size: 12px;
		margin-bottom: 5px;
		&.show {
			opacity: 1;
		}
	}
	.login-btn {
		margin-top: 20px;
		height: 48px;
		line-height: 48px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 400;
		background: #1c77ff;
		color: #ffffff;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		margin-bottom: 40px;
		&.disabled {
			background: #c8d1de;
		}
	}
}
</style>
