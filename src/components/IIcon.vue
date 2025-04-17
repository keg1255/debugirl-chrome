<template>
	<i class="iconfont" :class="cls" :style="style" @click="disabled || $emit('click', $event)"></i>
</template>
<script>
export default {
	props: {
		value: String,
		name: String,
		size: [Number, String],
		rotate: Number,
		loading: Boolean,
		color: String,
		disabled: Boolean,
	},
	emits: ["click"],
	computed: {
		clickable() {
			return this._.vnode.props.onClick;
		},
		style() {
			const style = {};
			if (this.size) style.fontSize = /\d$/.test(this.size) ? this.size + "px" : this.size;
			if (this.rotate) style.transform = `rotate(${this.rotate}deg)`;
			if (this.color) style.color = this.color;
			if (this.clickable) style.cursor = "pointer";
			return style;
		},
		cls() {
			const cls = {};
			cls["icon-" + (this.name || this.value)] = true;
			if (this.loading) cls.loading = true;
			if (this.clickable) cls.cursor = true;
			if (this.disabled) cls.disabled = true;
			return cls;
		},
	},
};
</script>
<style lang="less">
@import "../styles/define.less";
i.iconfont {
	transition: transform 0.5s;
	font-size: inherit;
	display: inline-block;
	&.cursor {
		cursor: pointer;
	}
	&.loading {
		.loading;
	}
}
</style>
