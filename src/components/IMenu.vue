<template>
	<div v-click-outside="close" class="i-menu" @click="open">
		<slot v-if="$slots.button" name="button"></slot>
		<div v-else-if="title" class="i-menu__button">
			<span>{{ title }}</span>
		</div>
		<div v-show="opened" :class="'__content __' + pos">
			<slot></slot>
		</div>
	</div>
</template>
<script>
import {isParent} from "@/common/utils";
export default {
	name: "IMenu",
	components: {},
	props: {
		keep: Boolean, // 点击菜单项后是否保持打开
		title: {
			type: String,
			default: "菜单",
		},
		pos: {
			// top bottom
			type: String,
			default: "bottom",
		},
	},
	emits: ["open", "close"],
	data() {
		return {
			opened: false,
		};
	},
	computed: {},
	watch: {
		opened(v) {
			if (v) this.$emit("open");
			else this.$emit("close");
		},
	},
	mounted() {
		this._menu = this.$el.lastElementChild;
		document.addEventListener("mousedown", this.onmousedown);
	},
	beforeUnmount() {
		document.removeEventListener("mousedown", this.onmousedown);
	},
	methods: {
		onmousedown(e) {
			if (isParent(e.target, this.$el)) return;
			this.opened = false;
		},
		open(e) {
			if (!this.keep && isParent(e.target, this._menu)) this.opened = false;
			else this.opened = true;
		},
		close(e) {
			this.opened = false;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-menu {
	position: relative;
	.i-menu__button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		cursor: pointer;
		.magic-link(@primary);
		color: @primary;
	}
	> .__content {
		position: absolute;
		background: #fff;
		border-radius: 4px;
		z-index: 100;
		> .link {
			height: 32px;
			text-align: center;
			line-height: 32px;
			color: #2b2f35;
			font-size: 12px;
			white-space: nowrap;
			cursor: pointer;
			padding: 0 12px;
			&:hover {
				background: #f3f5f8;
			}
		}
	}

	> .__top {
		bottom: 100%;
		box-shadow: 0 4px 20px 0 rgba(14, 27, 47, 0.102), 0 0 10px 0 rgba(14, 27, 47, 0.102);
		margin-bottom: 2px;
		left: 50%;
		transform: translateX(-50%);
	}

	> .__bottom {
		top: 100%;
		box-shadow: 0 -4px 20px 0 rgba(14, 27, 47, 0.102), 0 0 10px 0 rgba(14, 27, 47, 0.102);
		margin-top: 2px;
		left: 50%;
		transform: translateX(-50%);
	}
}
</style>
