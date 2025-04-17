<template>
	<div class="i-mouse-tip" :style="style">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IMouseTip",
	components: {},
	props: {
		position: String, // top-left top-right bottom-left bottom-right
		offset: {
			type: Array,
			default: () => [14, 3],
		},
	},
	data() {
		return {
			style: {},
		};
	},
	computed: {},
	mounted() {
		document.addEventListener("mousemove", this.onmove);
	},
	beforeDestroy() {
		document.removeEventListener("mousemove", this.onmove);
	},
	methods: {
		onmove(e) {
			const {clientX, clientY} = e;
			const [offsetX, offsetY] = this.offset;
			let pos = this.position;
			if (!pos) {
				pos = clientX > window.innerWidth / 2 ? "left" : "right";
				pos += clientY > window.innerHeight / 2 ? "-top" : "-bottom";
			}
			let [x, y] = pos.split("-");
			let style = {};
			if (x === "left") {
				style.right = window.innerWidth - clientX + offsetX + "px";
			} else {
				style.left = clientX + offsetX + "px";
			}
			if (y === "top") {
				style.bottom = window.innerHeight - clientY + offsetY + "px";
			} else {
				style.top = clientY + offsetY + "px";
			}
			this.style = style;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-mouse-tip {
	position: fixed;
	font-size: 16px;
	font-weight: 400;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.6);
	padding: 13px 12px;
	line-height: 1;
	border-radius: 12px;
	z-index: 1000;
}
</style>
