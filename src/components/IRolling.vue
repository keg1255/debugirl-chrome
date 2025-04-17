<template>
	<div class="i-rolling" :style="style">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IRolling",
	components: {},
	props: {
		speed: {type: Number, default: 200}, // 每秒移动多少px
	},
	data() {
		return {
			style: "",
		};
	},
	computed: {},
	mounted() {
		let width = this.$el.scrollWidth / 2;
		this.style = `--i-rolling-duration: ${width / this.speed}s;--i-rolling-width: -${width}px`;
	},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-rolling {
	--i-rolling-duration: 30s;
	--i-rolling-width: -100%;
	white-space: nowrap;
	animation: move var(--i-rolling-duration) infinite linear;
	@keyframes move {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(var(--i-rolling-width));
		}
	}
}
</style>
