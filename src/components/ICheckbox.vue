<template>
	<div class="i-checkbox" :class="{checked: value}" @click="onClick">
		<slot></slot>
		<i-svg class="i-checkbox-icon" :name="value ? trueIcon : falseIcon"></i-svg>
	</div>
</template>
<script>
import {svg2dataurl} from "@/common/utils";
export default {
	name: "ICheckbox",
	components: {},
	props: {
		value: Boolean,
		trueIcon: {
			type: String,
			default: "checked",
		},
		falseIcon: {
			type: String,
			default: svg2dataurl("", {width: 16, height: 16}),
		},
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		onClick(e) {
			this.$emit("input", !this.value);
			this.$emit("click", e);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-checkbox {
	display: inline-flex;
	cursor: pointer;
	align-items: center;
	line-height: 1.5;
	white-space: nowrap;
	> .i-checkbox-icon {
		margin-left: 4px;
		width: 1em;
		height: 1em;
	}
	&.checked {
		> .i-checkbox-icon {
			color: @primary;
		}
	}
	&:not(:last-child) {
		margin-right: 12px;
	}
}
</style>
