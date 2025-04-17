<template>
	<hd-dialog-center icon-style="top:12px;right:12px;" @close="$emit('close')">
		<div class="dialogs-e-charts">
			<i-chart :list="list" :round="round"></i-chart>
		</div>
	</hd-dialog-center>
</template>
<script>
export default {
	name: "ECharts",
	components: {},
	props: {
		list: Array,
		round: Number,
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
.dialogs-e-charts {
	background-color: #fff;
	padding: 32px;
	border-radius: 12px;
	> .i-chart {
		width: 80vw;
		height: 80vh;
	}
}
</style>
