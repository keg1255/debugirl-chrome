<template>
	<div class="i-dash" @click="$emit('click', $event)">
		<svg
			class="item"
			xmlns="http://www.w3.org/2000/svg"
			width="100%"
			:height="height"
			:viewBox="`0 0 ${width} 1`"
		>
			<path
				:d="'M0,0h' + width"
				:stroke-width="height"
				stroke="#535353"
				:stroke-dasharray="value"
			></path>
		</svg>
	</div>
</template>
<script>
export default {
	name: "IDash",
	components: {},
	props: {
		width: {default: 170},
		height: {default: 2},
		value: String,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-dash {
}
</style>
