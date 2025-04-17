<template>
	<hd-dialog-center icon-style="top:24px;right:30px;width:32px;height:32px;" @close="onClose">
		<div class="dialogs-vip-buy-pc">
			<h2>高级会员套餐</h2>
			<div class="packages">
				<div
					v-for="(item, i) in packages"
					:key="i"
					:class="{active: item == cur}"
					class="package"
					@click="select(item)"
				>
					<div class="price1">
						￥<b>{{ item.price }}&nbsp;</b>
					</div>
					<!-- <div class="price2">{{ item.origin }}</div> -->
					<div class="title">{{ item.name }}</div>
					<div v-if="item.badge" class="badge">
						<span class="content">{{ item.badge }}</span>
					</div>
				</div>
			</div>
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
<script lang="ts">
import {sendEvent} from "@/common/userevent";
import {toQRcode} from "@/common/utils";
import axios from "~/lib/axios";
import {refreshUserInfo} from "~/stores/actions";
import {shareLocal} from "~/stores/local";
import {dlg} from ".";

let pms;
export default {
	name: "VipBuyPC",
	components: {},
	props: {},
	emits: ["close"],
	data() {
		return {
			packages: [],
			cur: null,
			qrcode: "",
			error: "请等待...",
			timer: null,
			timer1: null,
		};
	},
	computed: {},
	watch: {
		cur(val) {
			this.getQR();
		},
	},
	async mounted() {
		pms = pms || axios.apiGet("/pay/packages");
		let waitpms = pms
			.catch((x) => {
				pms = null;
				return [];
			})
			.then((packages) => {
				packages.forEach((x) => {
					x.origin = x.price + ~~(x.price * 1.006);
				});
				this.packages = packages;
			});
		// 先登录再支付 还是 先支付后登录
		const loginFirst = true;
		if (loginFirst && !shareLocal.user) {
			if (!(await dlg.show("Login"))) {
				return this.$emit("close");
			}
		}
		await waitpms;
		this.select(this.packages[0]);
	},
	beforeUnmount() {
		clearInterval(this.timer);
		clearTimeout(this.timer1);
	},
	methods: {
		select(item) {
			this.cur = item;
		},
		async getQR() {
			this.error = "加载中...";
			let item = this.cur;
			console.log(item, this.packages);
			let uid = shareLocal.user.id;
			if (!item.info || item.info.uid != uid || item.info.expire_at < Date.now()) {
				let info = await axios.apiGet("/pay/webpay", {
					id: this.packages.indexOf(item),
				});
				item.info = {...info, uid, expire_at: Date.now() + 180e3};
			}
			let {id, url} = item.info;
			this.stop = stop;
			this.error = "";
			this.qrcode = await toQRcode(url);
			clearInterval(this.timer);
			sendEvent("支付", item.price);
			this.timer = setInterval(() => {
				axios.apiGet("/pay/webpay_query", {id, t: Date.now()}, {loading: false}).then((ret) => {
					if (ret.pay_at > 0) {
						delete item.info;
						sendEvent("支付成功", item.price);
						clearInterval(this.timer);
						clearTimeout(this.timer1);
						refreshUserInfo();
						this.$emit("close", true);
						dlg.removeAll();
					}
				});
			}, 1e3);
			clearTimeout(this.timer1);
			this.timer1 = setTimeout(() => {
				this.error = "二维码已过期，点击刷新";
				clearInterval(this.timer);
			}, 300e3);
		},
		onClose() {
			dlg
				.confirm("支付完成本弹窗会自动关闭, 现在关闭权益到账可能有延迟", {
					title: "温馨提示",
					btns: ["取消", "继续关闭"],
				})
				.then((ok) => {
					if (ok) this.$emit("close");
				});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-vip-buy-pc {
	padding: 43px 62px 86px;
	.auto(padding-left, 62px);
	.auto(padding-right, 62px);
	max-width: 96vw;
	background: #fff url("/images/buy_bg.png");
	background-size: cover;
	border-radius: 12px;
	overflow: hidden;
	> h2 {
		margin: 0;
		font-size: 32px;
		color: #282a43;
		margin-bottom: 30px;
	}
	.packages {
		display: flex;
		.package {
			width: 174px;
			height: 162px;
			background-color: #fff;
			border-radius: 12px;
			border: 2px solid #e5e8f0;
			text-align: center;
			position: relative;
			cursor: pointer;
			.auto(margin-right, 36px);
			&:last-child {
				margin-right: 0;
			}
			&.active {
				background: linear-gradient(180deg, #ffecca 0%, #fff 50%);
				border: 2px solid #f54531;
				.price1 {
					color: #f54531;
				}
			}
			.price1 {
				font-weight: bold;
				margin-top: 35px;
				font-size: 24px;
				font-family: Microsoft YaHei-Bold, Microsoft YaHei;
				line-height: 1;
				> b {
					font-size: 36px;
					line-height: 42px;
				}
			}
			.price2 {
				font-size: 14px;
				line-height: 16px;
				color: #bfc5d9;
				text-decoration: line-through;
				margin-top: 4px;
				font-family: Microsoft YaHei-Bold, Microsoft YaHei;
			}
			.title {
				background: #ffe9bf;
				border-radius: 36px;
				font-size: 14px;
				color: #6a4813;
				display: inline-block;
				margin-top: 18px;
				line-height: 1;
				padding: 8px 10px;
			}
			.badge {
				position: absolute;
				width: 73px;
				height: 27px;
				left: -1.5px;
				top: -27px / 2;
				text-align: center;
				line-height: 27px;
				font-size: 14px;
				color: #ffffff;
				background-color: #f54531;
				border-radius: 6px 0 6px 0;
			}
		}
	}
	.box3 {
		margin-top: 36px;
		display: flex;
		justify-content: center;
		.qrbox {
			border: 2px solid #e2e6f3;
			border-radius: 4px;
			padding: 10px 12px;
			.qrcode {
				width: 122px;
				height: 122px;
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
