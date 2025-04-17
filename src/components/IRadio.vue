<template>
	<div class="i-radio" :class="{active: checked}" tabindex="0" @keypress="onKey" @click="onClick">
		<i-svg class="__radio" :name="checked ? 'radio-a' : 'radio'"></i-svg>
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IRadio",
	components: {},
	props: {
		checked: Boolean,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		onKey(e) {
			// enter or space
			if (e.keyCode === 13 || e.keyCode === 32) {
				this.onClick(e);
				e.preventDefault();
			}
		},
		onClick(e) {
			this.$emit("click", e);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-radio {
	display: flex;
	align-items: center;
	cursor: pointer;
	&.active {
		color: @primary;
		> .__radio {
			color: inherit;
		}
	}
	> .__radio {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		margin-right: 6px;
		color: #d8dde3;
	}
}
</style>
