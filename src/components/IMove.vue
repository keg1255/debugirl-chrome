<template>
	<div class="i-move" :style="moveStyle" @mousedown.self="mousedown">
		<slot></slot>
	</div>
</template>
<script>
import {moveIt} from "@/common/utils";
export default {
	name: "IMove",
	components: {},
	props: {
		name: String,
		pos: {type: Object, default: () => ({x: 0, y: 0})},
	},
	data() {
		return {};
	},
	computed: {
		moveStyle() {
			let {pos} = this;
			return {
				transform: `translate(${pos.x}px, ${pos.y}px)`,
			};
		},
	},
	mounted() {},
	methods: {
		mousedown(e) {
			moveIt(e, {
				onchange: (delta) => {
					this.pos.x += delta.x;
					this.pos.y += delta.y;
				},
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-move {
	position: absolute;
	left: 12px;
	top: 12px;
	padding: 12px;
	background: #fff;
	.depth;
}
</style>
