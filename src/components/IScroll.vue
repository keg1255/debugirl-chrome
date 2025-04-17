<template>
	<div
		class="i-scroll"
		:class="{mobile, nopadding, moving}"
		@wheel="onWheel"
		@mouseenter="onmouseenter"
	>
		<div
			class="i-scroll__wapper"
			@mousedown.stop="onMouse"
			@touchstart.stop="onMove"
			@scroll="onScroll"
		>
			<slot></slot>
		</div>
		<div
			class="i-scroll__vertical"
			:style="verticalStyle"
			:class="{active: active == 'y'}"
			@mousedown.stop="onMoveY"
			@touchstart.stop="onMoveY"
		></div>
		<div
			class="i-scroll__horizontal"
			:style="horizontalStyle"
			:class="{active: active == 'x'}"
			@mousedown.stop="onMoveX"
			@touchstart.stop="onMoveX"
		></div>
	</div>
</template>
<script>
import {debounce, moveIt, newSpeedCounter} from "@/common/utils";
import app from "~/stores/app";
export default {
	name: "IScroll",
	components: {},
	props: {
		mouse: Boolean, // 鼠标拖动内容滚动
		nopadding: Boolean, // 不使用padding (滚动条可能盖住内容,好处是从div切换为i-scroll不需要额外调整大小)
		mode: {type: String, default: "y"}, // 滚动方向
		reachBottomOffset: {type: Number, default: 0}, // 滚动到底部的偏移量
	},
	emits: ["scroll", "change", "reachBottom"],
	data() {
		return {
			x: 0,
			y: 0,
			size: {
				width: 0,
				height: 0,
			},
			contentSize: {
				width: 0,
				height: 0,
			},
			active: "",
			moving: 0,
		};
	},
	computed: {
		mobile() {
			return app.ua.mobile;
		},
		scaleX() {
			return this.size.width / this.contentSize.width;
		},
		scaleY() {
			return this.size.height / this.contentSize.height;
		},
		horizontalStyle() {
			if (this.scaleX >= 1 || !/x/.test(this.mode)) return "display:none";
			let scale = this.size.width / this.contentSize.width;
			let width = scale * (this.size.width - this.size.paddingX);
			let left;
			if (width > 20) left = this.x * scale;
			else {
				left =
					(this.x * scale * (this.size.width - 20)) /
					(this.size.width - this.size.paddingX - width);
				width = 20;
			}
			return {
				left: left + "px",
				width: width + "px",
			};
		},
		verticalStyle() {
			if (this.scaleY >= 1 || !/y/.test(this.mode)) return "display:none";
			let scale = this.size.height / this.contentSize.height;
			let height = scale * (this.size.height - this.size.paddingY);
			let top;
			if (height > 20) top = this.y * scale;
			else {
				top =
					(this.y * scale * (this.size.height - 20)) /
					(this.size.height - this.size.paddingY - height);
				height = 20;
			}
			return {
				top: top + "px",
				height: height + "px",
			};
		},
		xy() {
			return this.x + "," + this.y;
		},
	},
	watch: {
		xy() {
			this.$emit("scroll", {
				x: this.x,
				y: this.y,
			});
		},
	},
	mounted() {
		this.refresh();
		this.$el.firstChild.addEventListener("resize", this.onresize);
	},
	beforeUnmount() {
		this.$el.firstChild.removeEventListener("resize", this.onresize);
	},
	methods: {
		onresize: debounce(function () {
			this.refresh();
		}),
		onmouseenter() {
			this.setX(this.x);
			this.setY(this.y);
		},
		refresh() {
			let style = window.getComputedStyle(this.$el);
			this.size = {
				width: this.$el.clientWidth,
				height: this.$el.clientHeight,
				paddingX: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
				paddingY: parseFloat(style.paddingTop) + parseFloat(style.paddingBottom),
			};
			let wapper = this.$el.firstChild;
			this.contentSize = {
				width: wapper.scrollWidth,
				height: wapper.scrollHeight,
			};
		},
		checkContent() {
			let wapper = this.$el.firstChild;
			if (
				this.contentSize.width != wapper.scrollWidth ||
				this.contentSize.height != wapper.scrollHeight
			) {
				this.refresh();
			}
		},
		setX(x, behavior) {
			this.checkContent();
			if (x < 0) x = 0;
			let right = this.contentSize.width - this.size.width + this.size.paddingX;
			if (x > right) x = right;
			if (x == this.x) return;
			this.x = x;
			let el = this.$el.firstChild;
			if (behavior == "none");
			else if (behavior)
				el.scroll({
					left: x,
					behavior,
				});
			else el.scrollLeft = x;
			return true;
		},
		setY(y, behavior) {
			this.checkContent();
			if (y < 0) y = 0;
			let bottom = this.contentSize.height - this.size.height + this.size.paddingY;
			if (y > bottom) y = bottom;
			if (y == this.y) return;
			bottom = bottom - this.reachBottomOffset;
			if (this.y < bottom && y >= bottom) {
				this.$emit("reachBottom");
			}
			this.y = y;
			/** @type {HTMLDivElement} */
			let el = this.$el.firstChild;
			if (behavior == "none");
			else if (behavior)
				el.scroll({
					top: y,
					behavior,
				});
			else el.scrollTop = y;
			return true;
		},
		onScroll(e) {
			let el = this.$el.firstChild;
			let xok = this.setX(el.scrollLeft, "none");
			let yok = this.setY(el.scrollTop, "none");
			if (xok || yok) {
				this.$emit("change", {
					x: this.x,
					y: this.y,
				});
			}
		},
		onWheel(e) {
			let x = this.x - e.wheelDelta;
			let y = this.y - e.wheelDelta;
			let xok = this.setX(x);
			let yok = this.setY(y);
			if (xok || yok) {
				e.preventDefault();
				this.$emit("change", {
					x: this.x,
					y: this.y,
				});
			}
		},
		onMoveY(e) {
			if (!/y/.test(this.mode)) return;
			this.active = "y";
			let changed;
			moveIt(e, {
				onchange: (d) => {
					let y = this.y + d.y / this.scaleY;
					if (this.setY(y)) changed = 1;
				},
				onend: () => {
					this.active = "";
					if (changed) {
						this.$emit("change", {
							x: this.x,
							y: this.y,
						});
					}
				},
			});
			e.preventDefault();
		},
		onMoveX(e) {
			if (!/x/.test(this.mode)) return;
			this.active = "x";
			let changed;
			moveIt(e, {
				onchange: (d) => {
					let x = this.x + d.x / this.scaleX;
					if (this.setX(x)) changed = 1;
				},
				onend: () => {
					this.active = "";
					if (changed) {
						this.$emit("change", {
							x: this.x,
							y: this.y,
						});
					}
				},
			});
		},
		onMove(e) {
			setTimeout(this.checkContent, 300);
			if (!this.mouse || this.mobile) return;
			let enableX = /x/.test(this.mode);
			let enableY = /y/.test(this.mode);
			let speedX = newSpeedCounter();
			let speedY = newSpeedCounter();
			let changed;
			moveIt(e, {
				onchange: (d) => {
					let x = this.x - enableX * d.x;
					let y = this.y - enableY * d.y;
					if (this.setX(x) || this.setY(y)) {
						this.moving = 1;
						changed = 1;
					}
					speedX.push(d.x);
					speedY.push(d.y);
				},
				onend: () => {
					let x = speedX.speed();
					let y = speedY.speed();
					if (this.setX(this.x - x, "smooth") || this.setY(this.y - y, "smooth")) changed = 1;
					if (changed) {
						this.$emit("change", {
							x: this.x,
							y: this.y,
						});
					}
					this.moving = 0;
				},
			});
			e.preventDefault();
		},
		onMouse(e) {
			this.onMove(e);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
@size: 4px;
.i-scroll {
	position: relative;
	padding: 0 @size @size 0;
	display: flex;
	> .i-scroll__wapper {
		flex: 1;
		overflow: hidden;
	}
	&.nopadding {
		padding: 0;
	}
	&.mobile {
		padding: 0;
		> .i-scroll__wapper {
			overflow: auto;
		}
		> .i-scroll__vertical,
		> .i-scroll__horizontal {
			display: none;
		}
	}
	&.moving {
		> .i-scroll__wapper {
			pointer-events: none;
		}
		> .i-scroll__horizontal,
		> .i-scroll__vertical {
			background: rgba(0, 0, 0, 0.2);
		}
	}
	&:hover {
		> .i-scroll__horizontal,
		> .i-scroll__vertical {
			background: rgba(0, 0, 0, 0.2);
		}
	}
	> .i-scroll__horizontal,
	> .i-scroll__vertical {
		position: absolute;
		background: transparent;
		border-radius: @size;
		transition: all 0.3s;
		&.active,
		&:hover {
			background: rgba(0, 0, 0, 0.3);
		}
		&.active {
			transition: background-color 0.3s;
		}
	}
	> .i-scroll__vertical {
		right: 0;
		width: @size;
	}
	> .i-scroll__horizontal {
		bottom: 0;
		height: @size;
	}
}
</style>
