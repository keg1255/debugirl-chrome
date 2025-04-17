<template>
	<div class="i-rate" :style="sty" @click="click" @mousedown="mousedown">
		<slot></slot>
	</div>
</template>
<script>
import {sliderMixin} from "./mixins";
export default {
	mixins: [sliderMixin],
	props: {
		value: {type: Number, required: true},
	},
	computed: {
		sty() {
			const rate = this.percent;
			return {
				backgroundImage: `linear-gradient(to right, var(--color), var(--color) ${rate}%,var(--bgcolor) ${rate}%, var(--bgcolor) 100%)`,
			};
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";

.i-rate {
	--bgcolor: #e2e8f0;
	--color: #bac6f8;
	width: 118px;
	min-height: 6px;
	border-radius: 4px;
	display: inline-block;
	text-align: center;
	cursor: default;
}
</style>
