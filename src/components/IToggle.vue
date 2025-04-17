<template>
	<div class="i-toggle" :class="{active: value}" @click="onclick">
		<div class="__dot"></div>
	</div>
</template>
<script>
export default {
	name: "IToggle",
	components: {},
	props: {
		value: {},
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		onclick() {
			this.$emit("input", !this.value);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-toggle {
	width: 40px;
	height: 20px;
	background-color: #f0f0f0;
	border-radius: 10px;
	position: relative;
	display: inline-block;
	cursor: pointer;
	.__dot {
		width: 16px;
		height: 16px;
		background-color: #fff;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 2px;
		transform: translateY(-50%);
		transition: left 0.3s;
	}
	&.active {
		background-color: @primary;
		.__dot {
			left: 22px;
		}
	}
}
</style>
