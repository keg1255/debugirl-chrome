<template>
	<hd-dialog-center>
		<div class="dialogs-vip-buy-mobile">
			<i-svg class="back" name="back" @click="$emit('close')"></i-svg>
			<div class="topbox">
				<img class="vipbuy" :src="`images/vipbuy.png`" alt="开通会员" />
				<div class="vipbox">
					<div class="header">
						<div class="title" :class="{active: tab == 0}" @click="tab = 0">
							<span>尊享会员特权</span>
							<div class="selected">
								<i-svg class="smail" name="smail"></i-svg>
							</div>
						</div>
						<div class="title" :class="{active: tab == 1}" @click="tab = 1">
							<span>用户评价</span>
							<div class="selected">
								<i-svg class="smail" name="smail"></i-svg>
							</div>
						</div>
					</div>
					<div class="tips">
						<div class="tip">
							<i-svg name="vip_quick" img></i-svg>
							<div>更快地响应</div>
						</div>
						<div class="tip">
							<i-svg name="vip_nolimit" img></i-svg>
							<div>提问无限制</div>
						</div>
						<div class="tip">
							<i-svg name="vip_feature" img></i-svg>
							<div>新功能优先体验</div>
						</div>
					</div>
					<div class="list">
						<div v-for="(item, i) in reviews" :key="i" class="review">
							<img class="avatar" :src="item.avatar" :alt="item.name" />
							<div class="info">
								<div class="title">
									<b>{{ item.name }}</b>
									<i-svg v-for="(item, i) in 5" :key="i" class="star" name="star"></i-svg>
								</div>
								<div class="desc">{{ item.desc }}</div>
							</div>
						</div>
					</div>
				</div>
				<div class="line2">
					开通会员前请先点击阅读<span class="link" @click="openUserAgreement">《用户协议》</span>
				</div>
			</div>
			<div class="footer">
				<div class="packages">
					<div
						v-for="(item, i) in packages"
						:key="i"
						:class="{active: item == cur}"
						class="package"
						@click="select(i)"
					>
						<div class="price1">
							￥<b>{{ item.price }}&nbsp;</b>
						</div>
						<div class="price2">{{ item.origin }}</div>
						<div class="title">{{ item.name }}</div>
						<div v-if="i == 0" class="badge">
							<span class="content">新人折扣</span>
						</div>
					</div>
				</div>
				<div class="pay-type">
					<div class="btn" @click="paytype = 'weixinpay'">
						<i-svg class="icon" name="weixin1"></i-svg>
						微信支付
						<i-svg
							class="checked"
							:name="paytype == 'weixinpay' ? 'checked' : 'unchecked'"
							img
						></i-svg>
					</div>
					<div class="btn" @click="paytype = 'alipay'">
						<i-svg class="icon" name="alipay"></i-svg>
						支付宝支付
						<i-svg
							class="checked"
							:name="paytype == 'alipay' ? 'checked' : 'unchecked'"
							img
						></i-svg>
					</div>
				</div>
				<button class="pay-btn" @click="payMobile">立即支付</button>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script lang="ts">
import {debounce, newCancelToken} from "@/common/utils";
import axios from "~/lib/axios";
import config from "~/lib/config";
import {refreshUserInfo} from "~/stores/actions";
import app from "~/stores/app";
import {shareLocal} from "~/stores/local";
import {dlg} from ".";
import {showLoading} from "~/stores/actions";
import {hideLoading} from "~/stores/actions";

let pms;
export default {
	name: "VipBuyMobile",
	components: {},
	props: {},
	emits: ["close"],
	data() {
		return {
			tab: 0,
			idx: -1,
			error: "请等待...",
			rest: {},
			use_coupon: true,
			paytype: "weixinpay", // 支付方式 weixinpay alipay
			reviews: [
				{
					name: "南风知我意",
					avatar: "/images/review/a1.png",
					desc: "这个图片处理网站真的很实用，它可以批量压缩图片，还可以批量修改图片大小,赞！",
				},
				{
					name: "吹梦到西洲",
					avatar: "/images/review/a2.png",
					desc: "真的很喜欢这个asar编辑功能，线上客户出问题远程过去打开asar加上调试代码，真的很方便",
				},
				{
					name: "西比比西",
					avatar: "/images/review/a3.png",
					desc: "我喜欢这个抠图功能，还可以批量抠图，使用起来非常地愉悦和舒适~",
				},
			],
			packages: [],
			timer: null,
		};
	},
	computed: {
		year() {
			return this.packages[0];
		},
		ua() {
			return app.ua;
		},
		cur() {
			let cur = this.packages[this.idx];
			if (this.use_coupon) return cur;
			return {...cur, ...cur.origin};
		},
		paypack() {
			let cur = this.cur;
			if (!cur) return "";
			return cur.paypack;
		},
	},
	watch: {},
	async mounted() {
		pms = pms || axios.apiGet("/pay/packages");
		let waitpms = pms
			.catch((x) => {
				pms = null;
				return [];
			})
			.then((packages) => {
				packages.forEach((x) => {
					x.origin = ~~(x.price / 0.7);
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
		this.select(0);
	},
	beforeUnmount() {
		clearInterval(this.timer);
		hideLoading();
	},
	methods: {
		select(i) {
			this.idx = i;
		},
		openUserAgreement: debounce(function () {
			window.open(config.userAgreement);
		}),
		async payMobile() {
			// 这里用 item 保存一下，免得支付成功后 this.cur 已经变化了
			let item = this.cur;
			let {id, url} = await axios.apiGet("/pay/webpay", {
				id: this.packages.indexOf(item),
				return_url: location.href,
			});
			localStorage.setItem("mobile_pay_id", id);
			if (this.paytype == "weixinpay") {
				if (/MicroMessenger/i.test(navigator.userAgent)) {
					// 微信内置浏览器orderno借用二码合一接口（下单）
					location.href = url;
				}
			} else {
				// 支付宝支付
				location.href = url;
			}
			const cancel = newCancelToken();
			clearInterval(this.timer);
			showLoading("支付中...", cancel);
			this.timer = setInterval(() => {
				axios.apiGet("/pay/webpay_query", {id}, {loading: false}).then((ret) => {
					if (ret.pay_at > 0) {
						localStorage.removeItem("mobile_pay_id");
						clearInterval(this.timer);
						hideLoading();
						refreshUserInfo();
						this.$emit("close", true);
					}
				});
			}, 1e3);
			cancel.token.promise.then(() => {
				clearInterval(this.timer);
				hideLoading();
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-vip-buy-mobile {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: linear-gradient(195deg, #ffe9c0 0%, #fffbef 30%);
	padding: 15px;
	overflow-y: auto;
	> .back {
		width: 24px;
		height: 24px;
		position: absolute;
		top: 18px;
		bottom: 25px;
	}
	> .topbox {
		margin-top: 40px;
		padding-bottom: 251px;
		> .vipbuy {
			width: 100%;
			margin-bottom: 16px;
		}
		> .vipbox {
			background: #fff;
			border-radius: 15px;
			padding: 13px 10px;
			> .header {
				display: flex;
				> .title {
					flex: 1;
					text-align: center;
					font-size: 15px;
					font-weight: bold;
					color: #96a3bc;
					line-height: 18px;
					> .selected {
						display: none;
						> .smail {
							width: 17px;
						}
					}
					&.active {
						color: #0e1b2e;
						> .selected {
							display: block;
						}
					}
				}
			}
			> .tips {
				display: flex;
				justify-content: space-between;
				padding-top: 18px;
				> .tip {
					width: 92px;
					text-align: center;
					font-size: 12px;
					color: #724b04;
					font-weight: 800;
					> .i-svg {
						margin-bottom: 4px;
					}
				}
			}
			> .list {
				> .review {
					height: 95px;
					background: #fffcf9;
					border-radius: 12px;
					margin-top: 8px;
					padding: 14px 12px;
					display: flex;
					> .avatar {
						width: 20px;
						height: 20px;
						border-radius: 50%;
						margin-right: 8px;
					}
					> .info {
						> .title {
							display: flex;
							align-items: center;
							b {
								font-size: 15px;
								font-weight: bold;
								color: #333333;
								line-height: 18px;
								margin-right: 4px;
							}
							.star {
								width: 17px;
								height: 17px;
								margin-left: 4px;
							}
						}
						> .desc {
							margin-top: 8px;
							font-size: 11px;
							font-weight: 500;
							color: #333333;
							line-height: 16px;
						}
					}
				}
			}
		}
		.line2 {
			margin-top: 18px;
			font-size: 12px;
			color: #727b89;
			> .link {
				color: @primary;
			}
		}
	}
	> .footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #ffffff;
		box-shadow: 0px -1px 8px 0px rgba(87, 74, 26, 0.06);
		border-radius: 15px 15px 0px 0px;
		padding: 23px 15px;
		> .packages {
			display: flex;
			justify-content: space-between;
			.package {
				width: 106px;
				height: 100px;
				background-color: #fff;
				border-radius: 6px;
				border: 1px solid #e5e8f0;
				text-align: center;
				position: relative;
				cursor: pointer;
				&.active {
					background: linear-gradient(195deg, #ffecca 0%, #fff 40%);
					border: 1px solid #f54531;
					.price1 {
						color: #f54531;
					}
				}
				.price1 {
					font-weight: bold;
					margin-top: 18px;
					font-size: 14px;
					font-family: Microsoft YaHei-Bold, Microsoft YaHei;
					line-height: 16px;
					> b {
						font-size: 21px;
						line-height: 25px;
					}
				}
				.price2 {
					font-size: 11px;
					line-height: 13px;
					color: #bfc5d9;
					text-decoration: line-through;
					margin-top: 6px;
					font-family: Microsoft YaHei-Bold, Microsoft YaHei;
				}
				.title {
					line-height: 13px;
					font-size: 11px;
					color: #333;
					font-weight: 500;
					margin-top: 4px;
				}
				.badge {
					position: absolute;
					width: 60px;
					height: 18px;
					left: -1px;
					top: -18px / 2;
					text-align: center;
					line-height: 18px;
					font-size: 11px;
					color: #ffffff;
					background-color: #f54531;
					border-radius: 4px 0 4px 0;
				}
			}
		}
		> .pay-type {
			margin-top: 16px;
			padding: 0 30px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			.icon {
				width: 20px;
				height: 20px;
				margin-right: 12px;
			}
			.checked {
				width: 15px;
				height: 15px;
				margin-left: 23px;
			}
			> .btn {
				.flex-center;
			}
		}
		> .pay-btn {
			margin-top: 15px;
			width: 100%;
			height: 53px;
			line-height: 53px;
			background: linear-gradient(270deg, #dc4631 0%, #ff5555 100%);
			border-radius: 26px;
			text-align: center;
			font-size: 20px;
			font-weight: 800;
			color: #ffffff;
		}
	}
}
</style>
