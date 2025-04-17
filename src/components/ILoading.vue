<template>
	<div v-show="!hide" class="i-loading" :style="{zIndex}">
		<slot v-if="$slots.default"></slot>
		<i-svg v-else name="i-loading"></i-svg>
		<div v-if="msg" class="loading-msg">{{ msg1 }}</div>
		<button v-if="cancelToken" class="error-link" @click="cancel">取消</button>
	</div>
</template>
<script lang="ts">
import {pushIndex} from "~/common/utils";
import app from "~/stores/app";

export default {
	name: "ILoading",
	components: {},
	props: {
		hide: Boolean,
		msg: String,
		cancelToken: Object,
	},
	data() {
		return {
			zIndex: 1000,
		};
	},
	computed: {
		msg1() {
			if (!this.msg) return this.msg;
			return this.msg + ".".repeat((app.second % 3) + 1);
		},
	},
	watch: {
		hide(v) {
			if (!v) this.zIndex = pushIndex();
		},
	},
	mounted() {},
	methods: {
		cancel() {
			this.cancelToken.cancel("已取消");
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-loading {
	.flex-center;
	.fixed-full;
	.space-y(6px);
	position: absolute;
	background-color: rgba(255, 255, 255, 0.8);
	flex-direction: column;
	color: #000;
	text-align: center;
	z-index: 1000;
	> img,
	> .i-svg {
		.loading;
		width: 32px;
		max-width: 50%;
		max-height: 50%;
	}
}
</style>
