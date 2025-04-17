<template>
	<!-- 选中弹出文本菜单 -->
	<div class="i-select-menu" :style="menus_style || 'display:none'">
		<slot></slot>
	</div>
</template>
<script>
import {debounce} from "@/common/utils";
export default {
	name: "ISelectMenu",
	components: {},
	props: {
		name: String,
	},
	data() {
		return {
			menus_style: "",
		};
	},
	computed: {},
	mounted() {
		document.addEventListener("mousedown", this.onmousedown);
		document.addEventListener("touchstart", this.onmousedown);
		document.addEventListener("mouseup", this.onselectionchange);
		document.addEventListener("touchend", this.onselectionchange);
		document.addEventListener("keyup", this.onselectionchange);
	},
	beforeDestroy() {
		document.removeEventListener("mousedown", this.onmousedown);
		document.removeEventListener("touchstart", this.onmousedown);
		document.removeEventListener("mouseup", this.onselectionchange);
		document.removeEventListener("touchend", this.onselectionchange);
		document.removeEventListener("keyup", this.onselectionchange);
	},
	methods: {
		onmousedown(e) {
			if (this.$el.contains(e.target)) return;
			this.menus_style = "";
		},
		onselectionchange: debounce(function (e) {
			if (e.keyCode == 17 || e.keyCode == 16 || e.keyCode == 18) return;
			let selection = window.getSelection();
			let range = selection.rangeCount ? selection.getRangeAt(0) : null;
			let el = this.$el;
			let parent = el.parentElement;
			if (
				!range ||
				this.$el.contains(e.target) ||
				range.collapsed ||
				!parent.contains(range.startContainer) ||
				!parent.contains(range.endContainer)
			) {
				this.menus_style = "";
				return;
			}
			el.style.display = "flex";
			let rect = range.getBoundingClientRect();
			let top = rect.top + rect.height + 10;
			if (top > 0.8 * window.innerHeight) top = rect.top - el.offsetHeight - 10;
			if (top < 0.2 * window.innerHeight) top = rect.top + rect.height / 2 - el.offsetHeight / 2;
			let left = rect.left + (rect.width - el.offsetWidth) / 2;
			if (left < 0) left = 0;
			if (top < 0) top = 0;
			if (left + el.offsetWidth > window.innerWidth) left = window.innerWidth - el.offsetWidth;
			if (top + el.offsetHeight > window.innerHeight) top = window.innerHeight - el.offsetHeight;
			this.menus_style = `top: ${top}px; left: ${left}px; display: flex;`;
		}, 0),
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-select-menu {
	position: fixed;
	top: 0;
	left: 0;
	user-select: none;
}
</style>
