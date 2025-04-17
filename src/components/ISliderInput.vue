<template>
	<div class="i-slider-input">
		<div class="label">{{ label }}</div>
		<div class="min">{{ min }}</div>
		<i-slider
			:value="value"
			:min="min"
			:max="max"
			:step="step"
			@input="$emit('input', $event)"
		></i-slider>
		<div class="max">{{ max }}</div>
	</div>
</template>
<script>
export default {
	name: "ISliderInput",
	components: {},
	props: {
		label: String,
		value: Number,
		min: {
			type: Number,
			default: 0,
		},
		max: {
			type: Number,
			default: 100,
		},
		step: {
			type: Number,
			default: 1,
		},
	},
	data() {
		return {
			v: this.mapValue(this.value),
			list: [],
		};
	},
	computed: {
		inputMode() {
			return !(this.options && this.options.length);
		},
	},
	watch: {
		value(val) {
			this.v = this.mapValue(val);
		},
	},
	mounted() {},
	methods: {
		mapValue(v) {
			if (this.options) {
				for (let i = 0; i < this.options.length; i++) {
					let item = this.options[i];
					if (item.value === v) return item.label;
				}
			}
			return v;
		},
		onOpen() {
			this.list = this.options.concat();
		},
		onInput(e) {
			if (!e.target.value) this.list = this.options.concat();
			else {
				let reg = new RegExp(e.target.value, "i");
				this.list = this.options.filter((x) => reg.test((x && x.label) || x));
			}
		},
		onChange(value) {
			if (!this.inputMode) {
				value = this.list.length == 1 ? this.list[0] : this.value;
				this.v = value;
			}
			this.$emit("input", value);
		},
		onClick(value) {
			clearTimeout(this.h);
			this.$emit("input", value);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-slider-input {
	display: flex;
	align-items: center;
	> .label {
		min-width: 76px;
		text-align: left;
	}
	> .max,
	> .min {
		background: #f9f9fb;
		min-width: 30px;
		height: 30px;
		border-radius: 4px;
		font-size: 12px;
		.flex-center;
	}
}
</style>
