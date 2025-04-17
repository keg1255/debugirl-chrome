<template>
	<div class="ui-toast" :style="style">
		<transition-group name="it-fade-slide-down">
			<div
				v-for="msg in data"
				:key="msg.id"
				class="ui-toast-item"
				:class="msg.status"
				@click="msg.remove()"
			>
				<i-svg v-if="msg.status == 'success'" img src="./assets/success.svg" />
				<i-svg v-if="msg.status == 'error'" img src="./assets/failure.svg" />
				<span>{{ msg.text }}</span>
			</div>
		</transition-group>
	</div>
</template>

<script>
import {toast_list} from "~/lib/toast";
export default {
	name: "UiToast",
	data() {
		return {
			data: toast_list,
		};
	},
	computed: {
		style() {
			if (this.data.length == 0) return {};
			let zIndex = this.data.reduce((n, x) => Math.max(n, x.id), 0);
			return {
				zIndex: zIndex,
			};
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.ui-toast {
	position: fixed;
	top: 16px;
	left: 0px;
	right: 0px;
	text-align: center;
	display: flex;
	align-items: flex-end;
	flex-direction: column;
	z-index: 10000;
	pointer-events: none;
}
.ui-toast-item {
	border-radius: 4px;
	box-shadow: 0px 5px 24px rgba(42, 48, 61, 0.14);
	pointer-events: auto;
	cursor: pointer;
	margin: 5px;
	padding: 18px 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-family: Microsoft YaHei UI;
	font-weight: bold;
	background-color: #fff;
	color: #7b8794;
	-webkit-app-region: no-drag;
	&.normal {
		border-radius: 10px;
		padding: 19px 23px;
		background: rgba(0, 10, 26, 0.6);
		color: #fff;
		font-size: 15px;
		font-weight: 400;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 256px;
	}
	> img {
		width: 28px;
		height: 28px;
		margin-right: 10px;
	}
	> span {
		max-width: 280px;
		line-height: 1.25;
		word-wrap: break-word;
	}
}
@media screen and (max-width: @mobile-width) {
	.ui-toast {
		top: 50%;
		transform: translateY(-50%);
		align-items: center;
	}
	.ui-toast-item {
		min-height: 36px;
		border-radius: 18px;
		box-shadow: 0px 5px 24px rgba(42, 48, 61, 0.14);
		margin: 5px;
		padding: 12px 16px;
		font-size: 14px;
		> img {
			width: 16px;
			height: 16px;
		}
	}
}
</style>
