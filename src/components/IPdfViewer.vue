<template>
	<iframe class="i-pdf-viewer" :src="url" frameborder="0" @load="onload"></iframe>
</template>
<script>
export default {
	name: "IPdfViewer",
	components: {},
	props: {
		file: {},
	},
	data() {
		return {
			inited: false,
		};
	},
	computed: {
		url() {
			if (!this.inited) return "";
			let {file} = this;
			if (file instanceof Blob) file = URL.createObjectURL(file);
			return `pdf.js/web/viewer.html?file=${file}`;
		},
	},
	mounted() {
		this.inited = true;
	},
	methods: {
		setPage(num) {
			let iframe = this.$el;
			iframe.contentWindow.PDFViewerApplication.page = num;
		},
		onload() {
			let iframe = this.$el;
			iframe.contentWindow.webViewerOpenFile = () => {
				this.$emit("pick");
			};
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-pdf-viewer {
	width: 100%;
	height: 100%;
}
</style>
