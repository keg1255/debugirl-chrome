<template>
	<div class="forms-upload-input normal-input" @dragover.prevent @drop.prevent="onDrop">
		<div class="input-box">
			<input
				:value="val"
				class="form-input"
				@input="oninput"
				@focus="open = true"
				@blur="open = false"
				@click="open = true"
				@paste="onpaste"
			/>
			<button class="upload-btn" @click="pick">上传</button>
			<i-tooltip v-if="val">
				<a :href="val" target="_blank">访问</a>
			</i-tooltip>
		</div>
	</div>
</template>
<script>
import {pick} from "@/common/utils";
import axios from "~/lib/axios";
export default {
	name: "UploadInput",
	components: {},
	props: {
		accept: String,
		value: {},
		modelValue: {},
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {
			open: false,
		};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
	},
	mounted() {},
	methods: {
		async pick() {
			let file = await pick(this.accept);
			let url = await axios.apiFileURL(file);
			this.oninput(url);
		},
		oninput(e) {
			if (e.target) e = e.target.value;
			this.$emit("input", e);
			this.$emit("update:modelValue", e);
		},
		async onDrop(e) {
			let file = e.dataTransfer.files[0];
			if (!file) return;
			let url = await axios.apiFileURL(file);
			this.oninput(url);
		},
		async onpaste(e) {
			let file = e.clipboardData.files[0];
			if (!file) return;
			let url = await axios.apiFileURL(file);
			this.oninput(url);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.forms-upload-input {
	position: relative;
	a {
		color: inherit;
	}
	> .input-box {
		position: relative;
		flex: 1;
		display: flex;
		> .form-input {
			padding-right: 61px;
		}
		> .upload-btn {
			position: absolute;
			right: 0;
			top: 0;
			bottom: 0;
			width: 60px;
			line-height: 1;
			text-align: center;
			color: #fff;
			border-radius: 0 4px 4px 0;
			.background3(#1890ff);
		}
	}
}
</style>
