<template>
	<hd-dialog-center>
		<div class="dialogs-watch-a-d">
			<h2 class="title">请使用微信扫码</h2>
			<i-qr width="300" height="300" :text="url"></i-qr>
			<div class="actions">
				<button class="failure" @click="cancel">放弃</button>
				<button class="success" @click="check">领取奖励</button>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script>
import {debounce, getDayHour} from "@/common/utils";
import axios from "~/lib/axios";
import {refreshUserInfo} from "~/stores/actions";

export default {
	name: "WatchAD",
	components: {},
	props: {
		url: String,
		token: String,
		from: String,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		cancel() {
			this.$emit("close");
		},
		check: debounce(async function () {
			let day = await axios.apiGet("/sharevip/check", {token: this.token, from: this.from});
			if (day && day.day) day = day.day;
			let s = getDayHour(day * 86400e3);
			this.$toast.success("已获得 " + s + " 会员时长");
			refreshUserInfo();
			this.$emit("close", true);
		}),
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-watch-a-d {
	padding: 0 24px;
	background-color: #fff;
	.actions {
		padding: 6px 0;
	}
}
</style>
