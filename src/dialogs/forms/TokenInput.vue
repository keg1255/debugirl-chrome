<template>
	<div class="forms-token-input">
		<i-input :value="value" class="form-input" @input="oninput"></i-input>
		<button class="primary" @click="rand">随机</button>
	</div>
</template>
<script>
import {randomString} from "@/common/utils";

export default {
	name: "TokenInput",
	components: {},
	props: {
		value: String,
		mask: String,
		len: [Number, Array],
	},
	emits: ["input"],
	computed: {},
	mounted() {},
	methods: {
		rand() {
			if (this.mask) {
				let v = this.mask.replace(/#+/g, (m) => {
					return randomString(m.length);
				});
				this.$emit("input", v);
				return;
			}
			let len = this.len;
			if (Array.isArray(len)) len = len.pop();
			let v = randomString(+len || 32);
			this.$emit("input", v);
		},
		oninput(v) {
			this.$emit("input", v);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.forms-token-input {
	button {
		margin-left: 6px;
	}
}
</style>
