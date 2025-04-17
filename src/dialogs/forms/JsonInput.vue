<template>
	<i-input
		class="forms-json-input form-input"
		type="textarea"
		:class="{error}"
		auto-height
		:value="v"
		@input="oninput"
	></i-input>
</template>
<script>
export default {
	name: "JsonInput",
	components: {},
	props: {
		label: String,
		value: {},
		modelValue: {},
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {
			v: "",
			error: "",
		};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
		isJSON() {
			return typeof this.val === "object" || this.val == undefined;
		},
		json() {
			if (this.isJSON) return this.val;
			try {
				return JSON.parse(this.val);
			} catch (e) {
				return this.val;
			}
		},
	},
	watch: {
		json: {
			handler(v) {
				if (typeof v != "string") this.v = JSON.stringify(v, null, 2);
				else this.v = v;
			},
			immediate: true,
		},
	},
	mounted() {},
	methods: {
		oninput(v) {
			this.v = v;
			this.error = "";
			if (typeof v === "string") {
				try {
					if (v == "null") v = null;
					else if (v == "undefined") v = undefined;
					else v = JSON.parse(v);
					this.onInput(v);
				} catch (e) {
					this.error = e.message;
					this.onInput(v);
				}
			} else {
				this.onInput(v);
			}
		},
		onInput(v) {
			this.$emit("input", v);
			this.$emit("update:modelValue", v);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.forms-json-input {
}
</style>
