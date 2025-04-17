<template>
	<div class="i-tree-menu" :class="{vertical}">
		<i-tree-menu-item
			v-for="(item, i) in menus"
			:key="i"
			:index="i"
			:data="item"
			:select-path="selectPath"
		>
			<template #default="props">
				<slot v-bind="props"></slot>
			</template>
		</i-tree-menu-item>
	</div>
</template>
<script>
import {getHotkey} from "@/common/utils";
export default {
	name: "ITreeMenu",
	components: {},
	props: {
		menus: Array,
		enableHotkey: Boolean, // 启用快捷键
		vertical: Boolean, // 垂直菜单
	},
	data() {
		return {
			path: [],
			idx: -1,
		};
	},
	computed: {
		selectPath() {
			return this.path.concat(this.idx);
		},
		children() {
			let children = this.menus;
			for (let idx of this.path) {
				let item = children[idx];
				if (!item) return [];
				children = item.children;
				if (!children) return [];
			}
			return children;
		},
		cur() {
			return this.children[this.idx];
		},
	},
	watch: {
		enableHotkey() {
			this.path = [];
			this.idx = -1;
			if (this.enableHotkey) document.addEventListener("keydown", this.onkeydown);
			else document.removeEventListener("keydown", this.onkeydown);
		},
	},
	mounted() {
		this.keymap = {
			Left: () => {
				if (!this.cur) {
					// 没有选中任何菜单, 先选中最后一个
					this.idx = this.children.length - 1;
					return;
				}
				if (!this.vertical && !this.path.length) {
					// 非垂直 顶层菜单
					if (this.idx > 0) this.idx--;
					return;
				}
				if (this.path.length) this.idx = this.path.pop();
			},
			Right: () => {
				if (!this.cur) {
					// 没有选中任何菜单, 先选中第一个
					this.idx = 0;
					return;
				}
				if (!this.path.length) {
					// 顶层菜单
					if (!this.vertical) {
						if (this.idx < this.children.length - 1) this.idx++;
					} else if (this.cur.children) {
						this.path.push(this.idx);
						this.idx = 0;
					}
					return;
				}
				if (!this.cur.children) return;
				this.path.push(this.idx);
				this.idx = 0;
			},
			Up: () => {
				if (!this.cur) {
					// 没有选中任何菜单, 先选中最后一个
					this.idx = this.children.length - 1;
					return;
				}
				if (!this.vertical && this.path.length == 1 && this.idx == 0) {
					// 返回顶层菜单
					this.idx = this.path.pop();
					return;
				}
				if (this.idx > 0) this.idx--;
			},
			Down: () => {
				if (!this.cur) {
					// 没有选中任何菜单, 先选中第一个
					this.idx = 0;
					return;
				}
				if (!this.path.length) {
					// 顶层菜单
					if (this.vertical) {
						if (this.idx < this.children.length - 1) this.idx++;
					} else if (this.cur.children) {
						this.path.push(this.idx);
						this.idx = 0;
					}
					return;
				}
				if (this.idx < this.children.length - 1) this.idx++;
			},
			Enter: () => {
				this.$emit("select", this.cur);
			},
		};
		if (this.enableHotkey) document.addEventListener("keydown", this.onkeydown);
	},
	beforeDestroy() {
		if (this.enableHotkey) document.removeEventListener("keydown", this.onkeydown);
	},
	methods: {
		onkeydown(e) {
			let hotkey = getHotkey(e);
			let fn = this.keymap[hotkey];
			if (fn) {
				e.preventDefault();
				fn(e);
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-tree-menu {
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	&.vertical {
		flex-direction: column;
	}
	&:not(.vertical) .level0 > .i-tree-menu-item__children {
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
	}
}
</style>
