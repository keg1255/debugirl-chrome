<template>
	<div class="i-split-box" :class="{vertical}">
		<slot></slot>
		<div
			v-for="(item, i) in lines"
			:key="i"
			:style="lineStyle(item)"
			class="i-split-box__line split-ignore"
			:class="{moving}"
			@mousedown="onmousedown($event, i)"
		>
			<i-svg v-if="icon" :name="icon"></i-svg>
		</div>
		<div
			v-if="rate > 0"
			style="right: 0"
			class="i-split-box__line split-ignore"
			:class="{moving}"
			@mousedown="onmousewhole($event)"
		></div>
	</div>
</template>
<script>
import {debounce, moveIt} from "@/common/utils";

export default {
	name: "ISplitBox",
	components: {},
	props: {
		rate: {type: Number, default: 0}, // 整体拉伸比例
		vertical: Boolean, // 竖向
		icon: String, // 拖动图标
		body: {
			type: Object,
			default: () => ({
				width: 0,
				list: [],
			}),
		},
		sizes: {type: Array, default: () => []}, // {width:number;height:number}[]
	},
	data() {
		return {
			moving: false,
		};
	},
	computed: {
		lines() {
			let {list} = this.body;
			let lines = [];
			let prev = 0;
			for (let i = 0; i < list.length - 1; i++) {
				lines.push(list[i] + prev);
				prev += list[i];
			}
			return lines;
		},
	},
	watch: {
		"body.width"(v) {
			if (this.$el && v) this.$el.style.width = v + "px";
		},
		sizes: function () {
			this.body.list = [];
			this.onresize();
		},
	},
	mounted() {
		if (this.$el && this.body.width)
			this.$el.style.width = Math.min(this.body.width, window.innerWidth) + "px";
		this.onresize();
		this.robs = new ResizeObserver(this.onresize);
		this.robs.observe(this.$el);
	},
	beforeUnmount() {
		this.robs.disconnect();
	},
	methods: {
		getChildren() {
			let el = this.$el;
			let list = [];
			for (let i = 0; i < el.children.length; i++) {
				let child = el.children[i];
				if (child.className.indexOf("split-ignore") >= 0) continue;
				if (child.clientWidth < 1) continue;
				list.push(child);
			}
			return list;
		},
		onresize0() {
			let el = this.$el;
			let children = this.getChildren();
			// 孩子宽度不等于盒子宽度时重新计算盒子宽度
			let total = 0;
			for (let i = 0; i < children.length; i++) {
				let n = children[i];
				total += parseFloat(n.style.maxWidth);
			}
			let size = {
				width: el.clientWidth,
				height: el.clientHeight,
			};
			if (Math.abs(total - size.width) >= 1) {
				for (let i = 0; i < children.length; i++) {
					let n = children[i];
					n.style.maxWidth = n.style.minWidth = "";
					if (this.sizes[i]) n.style.minWidth = this.sizes[i] + "px";
				}
			}

			let list = [];
			while (list.length < children.length) {
				let child = children[list.length];
				list.push(child.offsetWidth / size.width);
			}
			this.body.list = list;
			this.lines.forEach((n, i) => {
				let left = el.children[i];
				left.style.maxWidth = left.style.minWidth = n * size.width + "px";
			});
		},
		onresize: debounce(function () {
			return this.onresize0();
		}, 0),
		lineStyle(n) {
			return `left:${n * 100}%;`;
		},
		onmousedown(e, i) {
			let el = this.$el;
			let left = el.children[i];
			let leftw = left.clientWidth;
			let right = el.children[i + 1];
			let rightw = right.clientWidth;
			let final_leftw = leftw;
			let final_rightw = rightw;
			this.moving = true;
			let target = e.currentTarget;
			let dx = 0;
			moveIt(e, {
				onchange: (delta) => {
					leftw += delta.x;
					rightw -= delta.x;
					dx += delta.x;
					if (leftw < this.sizes[i] || rightw < this.sizes[i + 1]) return;
					final_leftw = leftw;
					final_rightw = rightw;
					left.style.maxWidth = left.style.minWidth = leftw + "px";
					right.style.maxWidth = right.style.minWidth = rightw + "px";
					target.style.transform = `translateX(${dx}px)`;
				},
				onend: () => {
					let size = {
						width: el.clientWidth,
						height: el.clientHeight,
					};
					target.style.transform = ``;
					this.moving = false;
					if (this.sizes[i]) leftw = Math.max(leftw, this.sizes[i]);
					if (this.sizes[i + 1]) rightw = Math.max(rightw, this.sizes[i + 1]);
					let list = this.body.list.concat();
					list[i] = final_leftw / size.width;
					list[i + 1] = final_rightw / size.width;
					this.body.list = list;
				},
			});
		},
		onmousewhole(e) {
			let width = this.$el.clientWidth;
			this.moving = true;
			let maxWidth = window.innerWidth;
			moveIt(e, {
				onchange: (delta) => {
					width += delta.x * this.rate;
					width = Math.min(maxWidth, width);
					this.$el.style.width = width + "px";
				},
				onend: () => {
					this.moving = false;
					this.body.width = width;
				},
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-split-box {
	padding: 0 !important;
	&.vertical {
		flex-direction: column;
	}

	display: flex;
	position: relative;
	> * {
		flex: 1;
	}
	> .i-split-box__line {
		user-select: none;
		position: absolute;
		cursor: e-resize;
		width: 2px;
		top: 0;
		bottom: 0;
		transform: translateX(-50%) translateX(2px);
		&:hover {
			background-color: rgba(65, 118, 233, 0.2);
		}
		&.moving {
			pointer-events: none;
		}
		> .i-svg {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: 25px;
			height: 25px;
		}
	}
}
</style>
