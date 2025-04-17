<template>
	<div
		class="i-image-editor"
		:class="{readonly, movemode, mousedown}"
		@mousedown.prevent="onMousedown"
		@wheel="onWheel"
		@contextmenu.prevent
	>
		<div class="editor-box" :style="boxStyle" @touchstart.prevent="onTouchstart">
			<img :src="src" @load="onload" />
			<canvas ref="canvas" :style="{opacity}"></canvas>
			<slot :point="mouse_point" :mousedown="mousedown" :scale="centerTransform.scale"></slot>
		</div>
		<canvas ref="touchview" :style="touchviewStyle" class="touchview"></canvas>
	</div>
</template>
<script>
import {contain, moveIt, clamp, getPointByEvent, touchIt2, getDistance} from "@/common/utils/index";
export default {
	name: "IImageEditor",
	components: {},
	props: {
		url: String,
		readonly: Boolean,
		movemode: Boolean, // 打开移动模式
		// 画笔历史
		// render:(ctx)=>void 绘制类画笔
		// type==image item.image:HTMLImageElement 绘制图片
		// type==background item.url:string 替换背景图片
		history: {type: Array, default: () => []},
		redolist: {type: Array, default: () => []},
		pen: Object, // 画笔接口, ondown, onmove, onend, render
		cursor: String, // 鼠标样式
		enableHotkey: Boolean, // 启用自身热键,默认由父组件处理
		enableWheel: Boolean, // 启用鼠标滚轮缩放,默认由父组件处理
		minScale: {type: Number, default: 0.25},
		maxScale: {type: Number, default: 5},
		/** 图片位置与缩放 */
		centerTransform: {default: () => ({x: 0, y: 0, scale: 1})},
		opacity: {type: Number}, // canvas透明度
		previewSize: Number, // 预览窗口显示内容大小
	},
	emits: ["update:movemode", "mousemove", "load"],
	data() {
		return {
			originSize: {width: 0, height: 0}, // 图片原始尺寸
			mousedown: false, // 绘制中(鼠标左键按下)
			mouse_point: null, // 鼠标位置
			fitScale: 1, // 适应内容的缩放比例
			touchviewStyle: null, // 触摸预览层样式
		};
	},
	computed: {
		src() {
			for (let i = this.history.length - 1; i >= 0; i--) {
				let item = this.history[i];
				if (item.type == "background") return item.url;
			}
			return this.url;
		},
		boxStyle() {
			let {originSize, centerTransform, cursor, movemode} = this;
			let style = {
				transform: `translate(${centerTransform.x}px, ${centerTransform.y}px) scale(${centerTransform.scale})`,
				cursor: movemode ? null : cursor,
			};
			if (originSize.width) style.width = `${originSize.width}px`;
			if (originSize.height) style.height = `${originSize.height}px`;
			return style;
		},
	},
	watch: {
		history() {
			this.render();
		},
	},
	mounted() {
		let canvas = this.$refs.canvas;
		let touchview = this.$refs.touchview;
		let width = this.$el.clientWidth;
		let height = this.$el.clientHeight;
		touchview.height = touchview.width = Math.min(width, height) * 0.33;
		this.ctx = canvas.getContext("2d");
		this.canvas = canvas;
		document.addEventListener("mouseup", this.onmouseup);
		document.addEventListener("touchend", this.onmouseup);
		document.addEventListener("mousemove", this.onmousemove);
		document.addEventListener("touchmove", this.onmousemove);
		if (this.enableHotkey) {
			document.addEventListener("keypress", this.onkeypress);
			document.addEventListener("keydown", this.onkeydown);
			document.addEventListener("keyup", this.onkeyup);
		}
	},
	beforeUnmount() {
		document.removeEventListener("mouseup", this.onmouseup);
		document.removeEventListener("touchend", this.onmouseup);
		document.removeEventListener("mousemove", this.onmousemove);
		document.removeEventListener("touchmove", this.onmousemove);
		document.removeEventListener("keypress", this.onkeypress);
		document.removeEventListener("keydown", this.onkeydown);
		document.removeEventListener("keyup", this.onkeyup);
	},
	methods: {
		onkeypress(e) {
			if (e.ctrlKey && e.key === "\u001A") {
				this.undo();
			}
			if (e.ctrlKey && e.key === "\u0019") {
				this.redo();
			}
		},
		onkeydown(e) {
			if (e.key === " ") {
				this.$emit("update:movemode", true);
			}
		},
		onkeyup(e) {
			if (e.key === " ") {
				this.$emit("update:movemode", false);
			}
		},
		onmouseup() {
			this.touchstart_point = null;
			this.touchviewStyle = null;
			if (!this.mousedown) return;
			this.mousedown = false;
			this._boxRect = null;
			if (this.readonly || this.movemode) return;
			if (this.pen?.onend?.(this.ctx)) {
				this.render();
			}
		},
		onmousemove(e) {
			let {x, y} = this.getPointByEvent(e);
			this.mouse_point = {x, y};
			this.$emit("mousemove", this.mouse_point);
			if (this.mousedown) {
				x = clamp(x, 0, this.originSize.width);
				y = clamp(y, 0, this.originSize.height);
				if (this.prev && this.prev.x === x && this.prev.y === y) return;

				if (
					(this.touchstart_point && this.pen?.ondown(this.touchstart_point, this.ctx)) ||
					this.pen?.onmove?.({x, y}, this.ctx)
				) {
					this.render();
				}
				this.touchstart_point = null;
				if (e.type == "touchmove") {
					this.renderTouchview(e, {x, y});
				}
			}
		},
		onload(e) {
			this.fitContent(true);
			this.$nextTick(() => {
				this.$emit("load", e);
			});
		},
		/**
		 * @param {boolean} keep 如果图片没有变化,是否保持当前缩放
		 */
		fitContent(keep) {
			let img = this.$el.querySelector("img");
			let width = this.$el.clientWidth;
			let height = this.$el.clientHeight;
			let canvas = this.$refs.canvas;
			let originSize = {
				width: img.naturalWidth,
				height: img.naturalHeight,
			};
			canvas.width = originSize.width;
			canvas.height = originSize.height;

			if (height * width) {
				let imgSize = Object.assign({}, originSize);
				contain(imgSize, {width, height});
				if (
					!keep ||
					this.originSize.width !== originSize.width ||
					this.originSize.height !== originSize.height
				) {
					this.originSize = originSize;
					this.centerTransform.x = (width - imgSize.width) / 2;
					this.centerTransform.y = (height - imgSize.height) / 2;
					this.centerTransform.scale = imgSize.width / originSize.width;
					this.fitScale = this.centerTransform.scale;
				}
			}
			this.$nextTick(() => {
				this.render();
			});
		},
		getPointByEvent(e) {
			let rect = this._boxRect || this.$el.querySelector(".editor-box").getBoundingClientRect();
			let scale = this.centerTransform.scale;
			let point = getPointByEvent(e);
			let x = (point.x - rect.left) / scale;
			let y = (point.y - rect.top) / scale;
			return {x, y};
		},
		// 绘制
		render() {
			/** @type {HTMLCanvasElement} */
			let canvas = this.$refs.canvas;
			let ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let i = Math.max(0, this.history.length - 1);
			// clear 表示之前的记录不用绘制
			while (i > 0 && !this.history[i].clear) i--;
			for (; i < this.history.length; i++) {
				let item = this.history[i];
				if (typeof item.render === "function") item.render(ctx);
				else if (item.type == "image") {
					ctx.drawImage(
						item.image,
						item.x || 0,
						item.y || 0,
						item.width || canvas.width,
						item.height || canvas.height
					);
				}
			}
			this.pen?.render?.(ctx);
		},
		renderTouchview(e, point) {
			let w = this.previewSize;
			if (!w) return;
			let touchview = this.$refs.touchview;
			let box = this.$el.getBoundingClientRect();
			let lefttop = {
				x: box.left + touchview.width / 2,
				y: box.top + touchview.height / 2,
			};
			let p = getPointByEvent(e);
			let style = {display: "block"};
			if (getDistance(p, lefttop) < touchview.width) {
				style.right = "0";
			} else {
				style.left = "0";
			}
			this.touchviewStyle = style;
			let canvas = this.$refs.canvas;
			let image = this.$el.querySelector("img");
			let ctx = touchview.getContext("2d");
			// TODO: 缩放
			ctx.clearRect(0, 0, touchview.width, touchview.height);
			ctx.globalAlpha = 1;
			ctx.drawImage(
				image,
				point.x - w / 2,
				point.y - w / 2,
				w,
				w,
				0,
				0,
				touchview.width,
				touchview.height
			);
			if (this.opacity) ctx.globalAlpha = this.opacity;
			ctx.drawImage(
				canvas,
				point.x - w / 2,
				point.y - w / 2,
				w,
				w,
				0,
				0,
				touchview.width,
				touchview.height
			);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#000";
			ctx.beginPath();
			ctx.moveTo(0, touchview.height / 2);
			ctx.lineTo(touchview.width, touchview.height / 2);
			ctx.moveTo(touchview.width / 2, 0);
			ctx.lineTo(touchview.width / 2, touchview.height);
			ctx.stroke();
		},
		onTouchstart(e) {
			if (e.touches.length == 1) return this.onMousedown(e);
			this.mousedown = false;
			let box = this.$el.querySelector(".editor-box");
			let rect = box.getBoundingClientRect();
			touchIt2(e, {
				transform: {
					x: rect.left,
					y: rect.top,
					scale: this.centerTransform.scale,
				},
				onchange: (d) => {
					this.centerTransform.x += d.x;
					this.centerTransform.y += d.y;
					this.centerTransform.scale *= d.scale;
				},
			});
		},
		onMousedown(e) {
			if ((e.type == "touchstart" || e.buttons == 1) && !this.readonly && !this.movemode) {
				// 绘制
				let box = this.$el.querySelector(".editor-box");
				this._boxRect = box.getBoundingClientRect();
				let {x, y} = this.getPointByEvent(e);
				x = clamp(x, 0, this.originSize.width);
				y = clamp(y, 0, this.originSize.height);
				this.prev = {x, y};
				this.mousedown = true;
				if (e.type == "touchstart") {
					// touch事件先不触发画笔,等待touchmove,可能是双指操作
					this.touchstart_point = {x, y};
				} else if (this.pen?.ondown?.({x, y}, this.ctx)) {
					this.render();
				}
			} else {
				// 移动画布
				// let ok = !this.movemode;
				// if (ok) this.$emit("update:movemode", true);
				moveIt(e, {
					onchange: (d) => {
						this.centerTransform.x += d.x;
						this.centerTransform.y += d.y;
					},
					onend: () => {
						// 修复拖动过程中的残影
						let style = this.$el.style;
						style.overflow = "visible";
						requestAnimationFrame(() => {
							style.overflow = "";
						});
					},
				});
			}
		},
		// 指定中心点缩放(相对于窗口左上角的坐标)
		// 默认相对于编辑器中心点缩放
		setScale(scale, clientX, clientY) {
			scale = clamp(scale, this.minScale * this.fitScale, this.maxScale * this.fitScale);
			let {centerTransform} = this;
			let box = this.$el.querySelector(".editor-box");
			let rect = box.getBoundingClientRect();
			let {x, y} = centerTransform;
			let cr;
			if (!clientX) {
				cr = this.$el.getBoundingClientRect();
				clientX = (cr.left + cr.right) / 2;
			}
			if (!clientY) {
				if (!cr) cr = this.$el.getBoundingClientRect();
				clientY = (cr.top + cr.bottom) / 2;
			}
			let left = clientX - rect.left;
			let top = clientY - rect.top;
			x += left * (1 - scale / centerTransform.scale);
			y += top * (1 - scale / centerTransform.scale);
			this.centerTransform.x = x;
			this.centerTransform.y = y;
			this.centerTransform.scale = scale;
		},
		onWheel(e) {
			if (!this.enableWheel) return;
			e.preventDefault();
			let {centerTransform} = this;
			let {scale} = centerTransform;
			let delta = e.wheelDelta / 120;
			if (delta > 0) scale *= 1.1;
			else scale /= 1.1;
			this.setScale(scale, e.clientX, e.clientY);
		},
		// 放大
		enlargeImage(e) {
			let {scale} = this.centerTransform;
			scale *= 1.1;
			this.setScale(scale);
		},
		// 缩小
		reduceImage(e) {
			let {scale} = this.centerTransform;
			scale /= 1.1;
			this.setScale(scale);
		},
		// 画一笔
		push(item) {
			this.history.push(item);
			this.render();
			this.redolist.splice(0, this.redolist.length);
		},
		// 恢复一笔
		redo() {
			let item = this.redolist.pop();
			if (item) {
				this.history.push(item);
			}
		},
		// 撤销一笔
		undo() {
			let item = this.history.pop();
			if (item) {
				this.redolist.push(item);
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-image-editor {
	background: #f1f2f4;
	overflow: hidden;
	position: relative;
	> .touchview {
		position: absolute;
		background-color: #fff;
		top: 0;
		display: none;
		z-index: 1;
	}
	.editor-box {
		transform-origin: 0 0;
		overflow: hidden;
		display: flex;
		img {
			width: 100%;
			height: 100%;
		}
		canvas {
			position: absolute;
			top: 0;
			left: 0;
		}
		.pen {
			position: absolute;
			left: 0;
			top: 0;
			pointer-events: none;
		}
	}
	&.readonly {
		canvas {
			display: none;
		}
	}
	&.movemode {
		.editor-box {
			cursor: move;
		}
		.pen {
			display: none;
		}
	}
}
</style>
