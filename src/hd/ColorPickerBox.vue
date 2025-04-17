<template>
	<div class="hd-color-picker-box">
		<div class="color-box" @click="color_picker = $event">
			<span class="label">{{ label }}</span>
			<div class="color-preview">
				<hd-color-preview class="color" :value="val" />
				<i-svg name="right" :rotate="90"></i-svg>
			</div>
		</div>
		<client-only>
			<i-popup v-model:open="color_picker" aim="parent">
				<i-color :value="val || ''" @input="onInput"></i-color>
			</i-popup>
		</client-only>
	</div>
</template>
<script>
export default {
	name: "ColorPickerBox",
	components: {},
	props: {
		label: String,
		value: String,
		modelValue: String,
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {
			color_picker: false,
		};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
	},
	mounted() {},
	methods: {
		onInput(value) {
			let val;
			if (value.rgba.a < 1)
				val = `rgba(${value.rgba.r},${value.rgba.g},${value.rgba.b},${value.rgba.a})`;
			else val = value.hex;
			this.$emit("input", val);
			this.$emit("update:modelValue", val);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-color-picker-box {
	.color-box {
		display: flex;
		width: 100%;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
		.label {
			font-size: 14px;
			color: #757e8a;
			margin-right: 10px;
		}
		.color-preview {
			cursor: pointer;
			padding: 6px 10px;
			background-color: #f1f2f4;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.color {
				width: 132px;
				height: 20px;
				background-color: #000;
			}
			.i-svg {
				margin-left: 8px;
				width: 1em;
				height: 1em;
			}
		}
	}
}
</style>
