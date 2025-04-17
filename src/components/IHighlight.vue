<template>
	<span class="i-highlight" v-html="html1"></span>
</template>
<script>
export default {
	name: "IHighlight",
	components: {},
	props: {
		content: String,
		html: String,
		value: String,
	},
	data() {
		return {};
	},
	computed: {
		html1() {
			if (this.html) {
				var list = [];
				return this.html
					.replace(/<[^>]+>/g, function (x) {
						list.push(x);
						return "##&&~~&&##";
					})
					.replace(
						new RegExp(this.value.trim().split(/\s+/).join("|"), "gi"),
						(x) => `<span class="color">${x}</span>`
					)
					.replace(/##&&~~&&##/g, function (x) {
						return list.shift();
					});
			}
			return this.content
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(
					new RegExp(this.value.trim().split(/\s+/).join("|"), "gi"),
					(x) => `<span class="color">${x}</span>`
				);
		},
	},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-highlight {
}
</style>
