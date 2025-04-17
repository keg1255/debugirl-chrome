<template>
	<span class="i-color-span"
		><span v-if="isColor" :style="{backgroundColor: value}"></span>{{ value }}</span
	>
</template>
<script>
import {isColor} from "@/common/utils";
export default {
	name: "IColorSpan",
	components: {},
	props: {
		value: String,
	},
	data() {
		return {};
	},
	computed: {
		isColor() {
			return isColor(this.value);
		},
	},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-color-span {
	display: inline-flex;
	align-items: center;
	line-height: 1;
	> span {
		width: 1em;
		height: 1em;
		border-radius: 50%;
		display: inline-block;
		margin-right: 3px;
	}
}
</style>
