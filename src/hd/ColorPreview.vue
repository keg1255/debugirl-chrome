<template>
	<div class="hd-color-preview" :style="style"></div>
</template>
<script>
export default {
	name: "ColorPreview",
	components: {},
	props: {
		value: String,
	},
	data() {
		return {};
	},
	computed: {
		style() {
			var style = {};
			if (!this.value || /rgba\(\d+,\d+,\d+,0\)/.test(this.value))
				style.background = "url(icons/icon-toumpingpu.png)";
			else {
				style.background = this.value;
				if (/\(255,255,255,1\)/.test(this.value)) style.borderColor = "#f0f0f0";
			}
			return style;
		},
	},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-color-preview {
	height: 0.9rem;
	border: 1px solid transparent;
}
</style>
