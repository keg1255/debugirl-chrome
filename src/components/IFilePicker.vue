<template>
	<div
		class="i-file-picker"
		:class="{dragover}"
		@dragover.prevent="dragover = true"
		@dragleave="dragover = false"
		@drop.prevent="ondrop"
		@click="pick"
	>
		<slot :dragover="dragover"></slot>
	</div>
</template>
<script>
import {dropFiles, pick, pickDir} from "@/common/utils";
export default {
	name: "IFilePicker",
	components: {},
	props: {
		multiple: Boolean, // 是否支持多选
		dir: Boolean, // 是否支持文件夹
		ext: String, // 支持的文件类型
	},
	data() {
		return {
			dragover: false,
		};
	},
	computed: {
		clickable() {
			return this._.vnode.props.onClick;
		},
	},
	mounted() {},
	methods: {
		async ondrop(e) {
			this.dragover = false;
			let files = await dropFiles(e);
			if (files.length > 0) {
				this.upload(files);
			}
		},
		async pick() {
			if (!this.clickable) return;
			let file = await pick(this.ext || "image", this.multiple);
			if (file) {
				this.upload(file.length ? file : [file]);
			}
		},
		async pickDir() {
			let files = await pickDir();
			if (files) {
				this.upload(files);
			}
		},
		upload(files) {
			this.$emit("upload", files);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-file-picker {
	&.primary {
		.background3(@primary);
		color: #fff;
		cursor: pointer;
		padding: 10px 20px;
		text-align: center;
	}
}
</style>
