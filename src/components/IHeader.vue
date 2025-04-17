<template>
	<div class="i-header">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IHeader",
	components: {},
	props: {
		name: String,
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
.i-header {
	position: relative;
	> * {
		-webkit-app-region: no-drag;
	}
	> .dragarea-flex {
		-webkit-app-region: drag;
		flex: 1;
		height: 100%;
		margin-left: 4px;
		margin-top: 4px;
		padding-bottom: 4px;
	}
	> .dragarea {
		-webkit-app-region: drag;
		position: absolute;
		left: 4px;
		top: 4px;
		bottom: 0;
		right: 4px;
	}
	> .no-drag {
		-webkit-app-region: no-drag;
	}
}
</style>
