<template>
	<div class="form-input padding">
		<i-checkbox
			v-for="(item, i) in options"
			:key="i"
			:value="val.indexOf(item.value) >= 0"
			@input="changeValue($event, item)"
		>
			{{ item.label }}
		</i-checkbox>
	</div>
</template>
<script>
export default {
	name: "Checkbox",
	components: {},
	props: {
		label: String,
		value: {},
		modelValue: {},
		options: Array,
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
	},
	mounted() {},
	methods: {
		changeValue(flag, item) {
			let value = this.val.concat();
			let idx = value.indexOf(item.value);
			if (flag) {
				if (idx < 0) value.push(item.value);
			} else {
				if (idx >= 0) value.splice(idx, 1);
			}
			this.$emit("input", value);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.forms-checkbox {
}
</style>
