<template>
	<div class="i-auto-scroll">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IAutoScroll",
	components: {},
	props: {
		content: {},
	},
	data() {
		return {};
	},
	computed: {},
	watch: {
		content(val) {
			this.onChange();
		},
	},
	mounted() {},
	methods: {
		onChange() {
			let el = this.$el;
			if (el.scrollTop == el.scrollHeight - el.clientHeight) {
				this.$nextTick(() => {
					el.scrollTop = el.scrollHeight - el.clientHeight;
				});
			}
			console.log(el.scrollTop == el.scrollHeight - el.clientHeight);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-auto-scroll {
}
</style>
