<template>
	<hd-dialog-center @close="onClose">
		<div class="dialogs-charge">
			<h2>捐赠{{ props.score }}元</h2>
			<div class="box3">
				<div class="qrbox">
					<div class="qrcode">
						<img v-show="qrcode" :src="qrcode" alt="" />
						<div v-show="error" class="i-loading" @click="getQR">
							<i-svg name="i-loading"></i-svg>
							<span>{{ error }}</span>
						</div>
					</div>
					<div class="tip">
						<!-- <i-svg name="wxpay"></i-svg> -->
						<i-svg name="alipay"></i-svg>
						<span>支付宝扫码支付</span>
					</div>
				</div>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script setup lang="ts">
import {sendEvent} from "@/common/userevent";
import {onlyone, toQRcode} from "@/common/utils";
import axios from "~/lib/axios";
import {refreshUserInfo} from "~/stores/actions";
import {shareLocal} from "~/stores/local";
import {dlg} from ".";
import {onBeforeUnmount, onMounted, ref} from "vue";

const props = defineProps({
	score: {type: Number, default: 100},
});

const qrcode = ref("");
const error = ref("加载中...");

const emit = defineEmits(["close"]);

let timer = null;
let timer1 = null;
const getQR = onlyone(async function () {
	if (!error.value) return;
	error.value = "加载中...";
	let info = await axios.apiGet("/pay/webpay", {
		score: props.score,
	});
	let {id, url} = info;
	error.value = "";
	qrcode.value = await toQRcode(url);
	clearInterval(timer);
	sendEvent("积分充值", props.score);
	timer = setInterval(() => {
		axios.apiGet("/pay/webpay_query", {id, t: Date.now()}, {loading: false}).then((ret) => {
			if (ret.pay_at > 0) {
				sendEvent("充值成功", props.score);
				clearInterval(timer);
				clearTimeout(timer1);
				refreshUserInfo();
				emit("close", true);
				dlg.removeAll();
			}
		});
	}, 1e3);
	clearTimeout(timer1);
	timer1 = setTimeout(() => {
		error.value = "二维码已过期，点击刷新";
		clearInterval(timer);
	}, 300e3);
});

function onClose() {
	emit("close");
}

onMounted(async () => {
	// 先登录再支付 还是 先支付后登录
	const loginFirst = true;
	if (loginFirst && !shareLocal.user) {
		if (!(await dlg.show("Login"))) {
			return emit("close");
		}
	}
	getQR();
});

onBeforeUnmount(() => {
	clearInterval(timer);
	clearTimeout(timer1);
});
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-charge {
	padding: 43px;
	background-color: #fff;
	border-radius: 12px;
	overflow: hidden;
	> h2 {
		margin: 0;
		font-size: 24px;
		color: #282a43;
		margin-bottom: 24px;
		text-align: center;
	}
	.box3 {
		display: flex;
		justify-content: center;
		.qrbox {
			border: 2px solid #e2e6f3;
			border-radius: 4px;
			padding: 10px 12px;
			.qrcode {
				width: 160px;
				height: 160px;
				position: relative;
				img {
					width: 100%;
					height: 100%;
				}
				> .i-loading {
					cursor: pointer;
				}
			}
			.tip {
				font-size: 12px;
				color: #606178;
				line-height: 14px;
				margin-top: 10px;
				display: flex;
				align-items: center;
				justify-content: center;
				> .i-svg {
					width: 25px;
					height: 25px;
					> svg {
						width: 25px;
						height: 25px;
					}
					margin-right: 10px;
				}
			}
		}
	}
}
</style>
