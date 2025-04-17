<template>
	<div class="i-time-picker">
		<i-cascade-picker :value="valueList" :groups="groups" @input="onInput"></i-cascade-picker>
	</div>
</template>
<script>
export default {
	name: "ITimePicker",
	components: {},
	props: {
		value: String,
		min: String,
		max: String,
	},
	data() {
		return {};
	},
	computed: {
		valueList() {
			let list = this.value.split(":");
			if (process.client) window.list = list;
			return list;
		},
		minList() {
			return this.min ? this.min.split(":") : [];
		},
		maxList() {
			return this.max ? this.max.split(":") : [];
		},
		groups() {
			var disabled = false;
			let value = "";
			let min = "";
			let max = "";
			return this.valueList.map((x, idx) => {
				min = min ? min + ":" + this.minList[idx] : this.minList[idx];
				max = max ? max + ":" + this.maxList[idx] : this.maxList[idx];
				let list = [];
				if (idx == 0)
					list = Array.from({length: 24}, (v, k) => (k + 100).toFixed(0).slice(-2)).map((x) => {
						return {label: x, value: x, disabled: disabled || x > max || x < min};
					});
				else
					list = Array.from({length: 60}, (v, k) => (k + 100).toFixed(0).slice(-2)).map((x) => {
						let t = value + ":" + x;
						return {label: x, value: x, disabled: disabled || t > max || t < min};
					});
				value = value ? value + ":" + x : x;
				if (value < min || value > max) disabled = true;
				return list;
			});
		},
	},
	mounted() {},
	methods: {
		onInput(e) {
			this.$emit("input", e.join(":"));
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-time-picker {
}
</style>
