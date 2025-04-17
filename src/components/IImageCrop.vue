<template>
	<div class="i-image-crop" :class="{isManual}">
		<div v-show="show" class="crop-box">
			<img
				:key="imgKey"
				:src="url"
				:style="imgStyle"
				crossorigin="Anonymous"
				@load="load"
				@error="onError"
			/>
			<div
				v-show="show_rect"
				class="point tl"
				:style="{left: rect.x1 + 'px', top: rect.y1 + 'px'}"
				@mousedown.stop="start($event, 'x1', 'y1')"
				@touchstart.stop="start($event, 'x1', 'y1')"
			></div>
			<div
				v-show="show_rect"
				class="point tr"
				:style="{left: rect.x2 + 'px', top: rect.y1 + 'px'}"
				@mousedown.stop="start($event, 'x2', 'y1')"
				@touchstart.stop="start($event, 'x2', 'y1')"
			></div>
			<div
				v-show="show_rect"
				class="point bl"
				:style="{left: rect.x1 + 'px', top: rect.y2 + 'px'}"
				@mousedown.stop="start($event, 'x1', 'y2')"
				@touchstart.stop="start($event, 'x1', 'y2')"
			></div>
			<div
				v-show="show_rect"
				class="point br"
				:style="{left: rect.x2 + 'px', top: rect.y2 + 'px'}"
				@mousedown.stop="start($event, 'x2', 'y2')"
				@touchstart.stop="start($event, 'x2', 'y2')"
			></div>
			<div
				v-show="show_rect"
				class="point tc"
				:style="{left: centerX + 'px', top: rect.y1 + 'px'}"
				@mousedown.stop="start($event, 0, 'y1')"
				@touchstart.stop="start($event, 0, 'y1')"
			></div>
			<div
				v-show="show_rect"
				class="point rc"
				:style="{left: rect.x2 + 'px', top: centerY + 'px'}"
				@mousedown.stop="start($event, 'x2', 0)"
				@touchstart.stop="start($event, 'x2', 0)"
			></div>
			<div
				v-show="show_rect"
				class="point bc"
				:style="{left: centerX + 'px', top: rect.y2 + 'px'}"
				@mousedown.stop="start($event, 0, 'y2')"
				@touchstart.stop="start($event, 0, 'y2')"
			></div>
			<div
				v-show="show_rect"
				class="point lc"
				:style="{left: rect.x1 + 'px', top: centerY + 'px'}"
				@mousedown.stop="start($event, 'x1', 0)"
				@touchstart.stop="start($event, 'x1', 0)"
			></div>
			<div
				v-show="show_rect"
				class="rect"
				:style="rectStyle"
				@touchstart="start($event)"
				@mousedown="start($event)"
			>
				<div v-if="gird" class="horizontal" style="top: 33.33%"></div>
				<div v-if="gird" class="horizontal" style="top: 66.67%"></div>
				<div v-if="gird" class="vertical" style="left: 33.33%"></div>
				<div v-if="gird" class="vertical" style="left: 66.67%"></div>
				<slot :rect="rect" :scale="scale"></slot>
			</div>
			<canvas
				v-show="!disabled"
				ref="canvas"
				@mousedown="renewStart"
				@touchstart="renewStart"
			></canvas>
		</div>
	</div>
</template>
<script>
import {contain, crop, flipX, flipY, limitSize, loadImage} from "@/common/utils";
import {onBeforeUnmount} from "vue";
export default {
	name: "IImageCrop",
	components: {},
	props: {
		ratio: {type: Number}, // 裁剪比例, width/height
		url: {type: String}, // 图片地址
		rotate: {type: Number, default: 0}, // 旋转角度
		flipX: Boolean, // 水平翻转
		flipY: Boolean, // 垂直翻转
		limit: Boolean, // 限制裁剪不能超过图片大小
		disabled: Boolean, // 禁止操作
		fill: {type: String, default: "rgba(119, 119, 119, 0.467)"}, // 蒙层颜色
		value: {}, // 指定裁剪区域
		isManual: Boolean, // 允许框选区域
		clipPath: String, // 形状裁剪
		gird: Boolean, // 是否显示网格
	},
	emits: ["input", "update:modelValue", "change", "getImg"],
	data() {
		return {
			rect: {},
			pos: {},
			show: false,
			scale: 1,
			imgKey: 0,
		};
	},
	computed: {
		ratio1() {
			if (this.ratio < 0) return this.pos.width / this.pos.height || 0;
			return this.ratio;
		},
		show_rect() {
			return !this.disabled && this.rect.x2 && this.rect.y2;
		},
		rectStyle() {
			const rect = this.rect;
			return {
				left: rect.x1 + "px",
				top: rect.y1 + "px",
				width: rect.x2 - rect.x1 + "px",
				height: rect.y2 - rect.y1 + "px",
			};
		},
		centerX() {
			return (this.rect.x2 + this.rect.x1) / 2;
		},
		centerY() {
			return (this.rect.y2 + this.rect.y1) / 2;
		},
		imgStyle() {
			let {pos, flipX, flipY, rotate} = this;
			let {x, y, width, height} = pos;
			if (rotate % 180) {
				x += width / 2;
				y += height / 2;
				[width, height] = [height, width];
				x -= width / 2;
				y -= height / 2;
			}
			return {
				left: x + "px",
				top: y + "px",
				width: width ? width + "px" : "auto",
				height: height ? height + "px" : "auto",
				transform: `rotate(${rotate}deg)${flipY ? "rotateX(180deg)" : ""}${
					flipX ? "rotateY(180deg)" : ""
				}`,
			};
		},
	},
	watch: {
		value() {
			this.rect = Object.assign({}, this.rect, this.value);
			this.renderAll();
		},
		rotate() {
			if (this.disabled) this.$nextTick(() => this.resize());
			else
				this.$nextTick(() => {
					this.load();
					this.moveit(0, 0);
				});
		},
		url() {
			this.rect.x1 = null;
			this.img = this.$el.querySelector("img");
			var img = this.img;
			if (!img) return;
			this.pos = {x: 0, y: 0};
			img.removeAttribute("width");
			img.removeAttribute("height");
		},
		ratio1() {
			this.rect.x1 = null;
			this.reload();
		},
		clipPath() {
			this.loadClipPath();
		},
	},
	mounted() {
		var canvas = this.$refs.canvas;
		this.box = this.$el.querySelector(".crop-box");
		this.img = this.$el.querySelector("img");
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		var move = (e) => this.move(e);
		var end = (e) => this.end(e);
		var down = (e) => {
			var n = e.shiftKey ? 10 : 1;
			switch (e.keyCode) {
				case 37:
					this.moveit(-n, 0);
					break;
				case 38:
					this.moveit(0, -n);
					break;
				case 39:
					this.moveit(n, 0);
					break;
				case 40:
					this.moveit(0, n);
					break;
			}
		};
		document.addEventListener("mousemove", move);
		document.addEventListener("mouseup", end);
		document.addEventListener("touchmove", move, {passive: false});
		document.addEventListener("touchend", end);
		document.addEventListener("keydown", down);
		window.addEventListener("resize", this.reload);
		onBeforeUnmount(() => {
			document.removeEventListener("mousemove", move);
			document.removeEventListener("mouseup", end);
			document.removeEventListener("touchmove", move, {passive: false});
			document.removeEventListener("touchend", end);
			document.removeEventListener("keydown", down);
			window.removeEventListener("resize", this.reload);
		});
		this.loadClipPath();
	},
	methods: {
		onInput(value) {
			this.$emit("input", value);
			this.$emit("update:modelValue", value);
		},
		async loadClipPath() {
			if (this.clipPath) {
				let clipImage = await loadImage(this.clipPath);
				this.clipImage = clipImage;
			} else {
				this.clipImage = null;
			}
			this.renderAll();
		},
		renewStart(e) {
			if (!this.isManual) return true;
			if (e.touches && e.touches[0]) e = e.touches[0];
			const startX = e.clientX;
			const startY = e.clientY;
			const canvasRect = this.canvas.getBoundingClientRect();
			const {left: offsetLeft, top: offsetTop} = canvasRect;
			const startOffsetX = startX - offsetLeft;
			const startOffsetY = startY - offsetTop;
			this.renewing = {startX, startY, startOffsetX, startOffsetY};
		},
		renewClient(e) {
			const currentX = e.clientX;
			const currentY = e.clientY;
			const {startX, startY, startOffsetX, startOffsetY} = this.renewing;
			let x1 = startOffsetX;
			let y1 = startOffsetY;
			let dx = currentX - startX;
			let dy = currentY - startY;
			let x2, y2;
			if (this.ratio1) {
				let d = (Math.abs(dx) + Math.abs(dy)) / 2;
				x2 = x1 + (dx < 0 ? -1 : 1) * Math.abs(d);
				y2 = y1 + (dy < 0 ? -1 : 1) * Math.abs(d / this.ratio1);
				if (x2 < 0) {
					x2 = 0;
					y2 = y1 + (dy < 0 ? -1 : 1) * Math.abs(x1 / this.ratio1);
				}
				if (y2 < 0) {
					y2 = 0;
					x2 = x1 + (dx < 0 ? -1 : 1) * Math.abs(y1 * this.ratio1);
				}
				if (x2 > this.canvas.width) {
					x2 = this.canvas.width;
					y2 = y1 + (dy < 0 ? -1 : 1) * Math.abs((this.canvas.width - x1) / this.ratio1);
				}
				if (y2 > this.canvas.height) {
					y2 = this.canvas.height;
					x2 = x1 + (dx < 0 ? -1 : 1) * Math.abs((this.canvas.height - y1) * this.ratio1);
				}
			} else {
				x2 = x1 + dx;
				y2 = y1 + dy;
				if (x2 < 0) x2 = 0;
				if (y2 < 0) y2 = 0;
				if (x2 > this.canvas.width) x2 = this.canvas.width;
				if (y2 > this.canvas.height) y2 = this.canvas.height;
			}
			if (x1 > x2) {
				[x1, x2] = [x2, x1];
			}
			if (y1 > y2) {
				[y1, y2] = [y2, y1];
			}

			this.rect = {x1, x2, y1, y2};
			this.renderAll();
			this.onInput(Object.assign({scale: this.scale}, this.rect));
		},
		reload() {
			// const {width, height} = this.canvas;
			// const rectW = this.rect.x2 - this.rect.x1;
			// const rectY = this.rect.y2 - this.rect.y1;
			this.imgKey = window.innerWidth;
			this.load();
			this.renderAll();
		},
		start(e, kx, ky) {
			if (e.touches && e.touches[0]) e = e.touches[0];
			var x = e.clientX;
			var y = e.clientY;
			var bx = this.rect[kx || "x1"];
			var by = this.rect[ky || "y1"];
			this.moving = {x, y, bx, by, kx, ky};
		},
		move(e) {
			e.preventDefault();
			if (e.touches && e.touches[0]) e = e.touches[0];
			if (this.renewing) return this.renewClient(e);
			if (!this.moving) return;
			var {x, y, bx, by, kx, ky} = this.moving;
			var dx = e.clientX - x - (this.rect[kx || "x1"] - bx) || 0;
			var dy = e.clientY - y - (this.rect[ky || "y1"] - by) || 0;
			this.moveit(dx, dy, kx, ky);
			this.onInput(Object.assign({scale: this.scale}, this.rect));
		},
		end() {
			this.renewing = null;
			if (!this.moving) return;
			this.moving = null;
			this.$emit("change", Object.assign({scale: this.scale}, this.rect));
		},
		limitArea(dx, dy, kx, ky) {
			var rect = Object.assign({}, this.rect);
			let reload = () => {
				if (kx) rect[kx] = this.rect[kx] + dx;
				if (ky) rect[ky] = this.rect[ky] + dy;
			};
			reload();
			if (rect.x1 < 0) {
				dx = -this.rect.x1;
				if (this.ratio1) {
					dy = ((dx * dy < 0 ? -1 : 1) * dx) / this.ratio1;
				}
				reload();
			}
			if (rect.y1 < 0) {
				dy = -this.rect.y1;
				if (this.ratio1) {
					dx = (dx * dy < 0 ? -1 : 1) * dy * this.ratio1;
				}
				reload();
			}
			if (rect.x2 > this.size0.width) {
				dx = this.size0.width - this.rect.x2;
				if (this.ratio1) {
					dy = ((dx * dy < 0 ? -1 : 1) * dx) / this.ratio1;
				}
				reload();
			}
			if (rect.y2 > this.size0.height) {
				dy = this.size0.height - this.rect.y2;
				if (this.ratio1) {
					dx = (dx * dy < 0 ? -1 : 1) * dy * this.ratio1;
				}
				reload();
			}
			const gap = 5;
			if (rect.x2 - rect.x1 < gap) {
				if (kx == "x1") {
					dx = this.rect.x2 - this.rect.x1 - gap;
				} else {
					dx = this.rect.x1 - this.rect.x2 + gap;
				}
				if (this.ratio1) {
					dy = dx / this.ratio1;
				}
				reload();
			}
			if (rect.y2 - rect.y1 < gap) {
				if (ky == "y1") {
					dy = this.rect.y2 - this.rect.y1 - gap;
				} else {
					dy = this.rect.y1 - this.rect.y2 + gap;
				}
				if (this.ratio1) {
					dx = dy * this.ratio1;
				}
				reload();
			}
			return rect;
		},
		moveit(dx, dy, kx, ky) {
			if (kx || ky) {
				if (this.ratio1) {
					if (!kx) kx = "x" + ky[1];
					if (!ky) ky = "y" + kx[1];
					if (kx[1] == ky[1]) {
						dy = (dx + dy) / 2;
						dx = this.ratio1 * dy;
					} else {
						dy = (dy - dx) / 2;
						dx = this.ratio1 * -dy;
					}
				}
				this.rect = this.limitArea(dx, dy, kx, ky);
			} else {
				let rect = Object.assign({}, this.rect);
				if (rect.x1 + dx < 0) {
					dx = -rect.x1;
				}
				if (rect.y1 + dy < 0) {
					dy = -rect.y1;
				}
				if (rect.x2 + dx > this.size0.width) {
					dx = this.size0.width - rect.x2;
				}
				if (rect.y2 + dy > this.size0.height) {
					dy = this.size0.height - rect.y2;
				}
				rect.x1 += dx;
				rect.y1 += dy;
				rect.x2 += dx;
				rect.y2 += dy;
				this.rect = rect;
			}
			this.size = {
				width: this.rect.x2 - this.rect.x1,
				height: this.rect.y2 - this.rect.y1,
			};
			this.renderAll();
		},
		onError(e) {
			console.error(e);
		},
		load() {
			const img = this.img;
			let {naturalWidth, naturalHeight} = img;
			if (this.rotate % 180) {
				[naturalWidth, naturalHeight] = [naturalHeight, naturalWidth];
			}
			let size = {width: naturalWidth, height: naturalHeight};
			let el = this.$el;
			const max = {width: el.clientWidth, height: el.clientHeight};
			contain(size, max);
			this.size0 = size;
			let oldScale = this.scale;
			this.scale = size.width / naturalWidth;
			const width = Math.floor(size.width);
			const height = Math.floor(size.height);
			this.canvas.width = size.width;
			this.canvas.height = size.height;
			this.box.style.left = (el.clientWidth - width) / 2 + "px";
			this.box.style.top = (el.clientHeight - height) / 2 + "px";
			this.box.style.width = size.width + "px";
			this.box.style.height = size.height + "px";

			this.pos = {
				x: (this.canvas.width - width) / 2,
				y: (this.canvas.height - height) / 2,
				width,
				height,
			};
			this.image = img;
			this.initRect(this.scale / oldScale);
			this.size = {
				width: this.rect.x2 - this.rect.x1,
				height: this.rect.y2 - this.rect.y1,
			};
			this.show = true;
			this.renderAll();
			this.onInput(Object.assign({scale: this.scale}, this.rect));
			this.$emit("change", Object.assign({scale: this.scale}, this.rect));
			this.$emit("getImg", this.rect);
		},
		initRect(scale) {
			if (this.rect.x1 == null) {
				if (this.isManual) return;
				if (this.ratio1) {
					if (this.canvas.width >= this.canvas.height * this.ratio1)
						this.rect = {
							x1: 0,
							y1: 0,
							x2: this.canvas.height * this.ratio1,
							y2: this.canvas.height,
						};
					else
						this.rect = {x1: 0, y1: 0, x2: this.canvas.width, y2: this.canvas.width / this.ratio1};
				} else {
					this.rect = {x1: 0, y1: 0, x2: this.canvas.width, y2: this.canvas.height};
				}
			} else {
				this.rect.x1 *= scale;
				this.rect.y1 *= scale;
				this.rect.x2 *= scale;
				this.rect.y2 *= scale;
			}
			this.renderAll();
			this.onInput(Object.assign({scale: this.scale}, this.rect));
		},
		initRectByRatio(width, height, needScale) {
			const canW = this.canvas.width;
			const canH = this.canvas.height;
			if (needScale) {
				width = width * this.scale;
				height = height * this.scale;
			}
			if (canW >= width && canH >= height) {
				let x1, x2, y1, y2;
				x1 = Math.random() * (canW - width);
				x2 = x1 + width;
				y1 = Math.random() * (canH - height);
				y2 = y1 + height;
				this.rect = {x1, x2, y1, y2};
				this.renderAll();
				this.onInput(Object.assign({scale: this.scale}, this.rect));
			} else {
				const current = {width, height};
				limitSize(current, this.canvas);
				this.initRectByRatio(current.width, current.height);
			}
		},
		resize() {
			var img = this.img;
			var box = this.box;
			var rect = img.getBoundingClientRect();
			var rect0 = box.getBoundingClientRect();
			var x = rect.x - rect0.x;
			var y = rect.y - rect0.y;
			this.rect.x1 = x;
			this.rect.y1 = y;
			this.rect.x2 = x + rect.width;
			this.rect.y2 = y + rect.height;
			this.renderAll();
			this.onInput(Object.assign({scale: this.scale}, this.rect));
			this.$emit("change", Object.assign({scale: this.scale}, this.rect));
		},
		rotateImage(img, deg) {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			var w = img.naturalWidth || img.width;
			var h = img.naturalHeight || img.height;
			deg = (deg / 180) * Math.PI;
			let width = Math.abs(w * Math.cos(deg)) + Math.abs(h * Math.sin(deg));
			let height = Math.abs(h * Math.cos(deg)) + Math.abs(w * Math.sin(deg));
			canvas.width = width;
			canvas.height = height;
			ctx.translate(width / 2, height / 2);
			ctx.rotate(deg);
			ctx.drawImage(img, -w / 2, -h / 2, w, h);
			return {image: canvas};
		},
		getCrop() {
			var {x1, y1, x2, y2} = this.rect;
			var image = this.image;
			if (this.flipX) image = flipX(image);
			if (this.flipY) image = flipY(image);
			var rotate = ((this.rotate % 360) + 360) % 360;
			x1 = (x1 - this.pos.x) / this.scale;
			y1 = (y1 - this.pos.y) / this.scale;
			x2 = (x2 - this.pos.x) / this.scale;
			y2 = (y2 - this.pos.y) / this.scale;
			if (rotate) {
				var {image} = this.rotateImage(image, rotate);
			}
			var rect = {
				x: x1,
				y: y1,
				width: x2 - x1,
				height: y2 - y1,
			};
			return {rect, image};
		},
		crop(color) {
			var {rect, image} = this.getCrop();
			return crop(image, rect, color, this.clipImage);
		},
		renderAll() {
			/** @type {CanvasRenderingContext2D} */
			var ctx = this.ctx;
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			ctx.fillStyle = this.fill;
			ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			let {x1, y1, x2, y2} = this.rect;
			if (this.clipImage) {
				ctx.save();
				ctx.globalCompositeOperation = "destination-out";
				ctx.drawImage(this.clipImage, x1, y1, x2 - x1, y2 - y1);
				ctx.restore();
			} else {
				ctx.clearRect(x1, y1, x2 - x1, y2 - y1);
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
@bw: 4px;
@w: 5px;
.i-image-crop {
	width: 100%;
	height: 100%;
	user-select: none;
	box-sizing: border-box;
	&.isManual {
		> .crop-box {
			cursor: crosshair;
		}
	}
	> .crop-box {
		position: relative;
		// border: 1px solid #c0c0c0;
		height: 100%;
		> img {
			position: absolute;
			width: auto;
			max-width: unset;
		}
		> canvas {
			position: absolute;
			top: 0;
			left: 0;
		}
		.size {
			position: absolute;
			font-size: 12px;
			text-align: center;
			transform: translateY(-24px);
		}
		> .point {
			position: absolute;
			width: @w;
			height: @w;
			z-index: 1;
			&.tl {
				cursor: nw-resize;
				border: 0 solid #0072ff;
				border-width: @bw 0 0 @bw;
				transform: translate(-@bw, -@bw);
			}
			&.tr {
				cursor: ne-resize;
				border: 0 solid #0072ff;
				border-width: @bw @bw 0 0;
				transform: translate(-@w+ @bw, -@bw);
			}
			&.bl {
				cursor: sw-resize;
				border: 0 solid #0072ff;
				border-width: 0 0 @bw @bw;
				transform: translate(-@bw, -@w+ @bw);
			}
			&.br {
				cursor: se-resize;
				border: 0 solid #0072ff;
				border-width: 0 @bw @bw 0;
				transform: translate(-@w+ @bw, -@w+ @bw);
			}
			&.tc {
				cursor: n-resize;
				border-bottom: @bw solid #0072ff;
				transform: translate(-@w / 2, -@w);
			}
			&.rc {
				cursor: e-resize;
				border-left: @bw solid #0072ff;
				transform: translate(0, -@w / 2);
			}
			&.bc {
				cursor: s-resize;
				border-top: @bw solid #0072ff;
				transform: translate(-@w / 2, 0);
			}
			&.lc {
				cursor: w-resize;
				border-right: @bw solid #0072ff;
				transform: translate(-@w, -@w / 2);
			}
		}
		> .rect {
			position: absolute;
			border: 2px solid #0072ff;
			z-index: 10;
			cursor: move;
			> .horizontal,
			> .vertical {
				position: absolute;
			}
			> .horizontal {
				left: 0;
				right: 0;
				border-bottom: 2px dashed #666666;
			}
			> .vertical {
				top: 0;
				bottom: 0;
				border-right: 2px dashed #666666;
			}
		}
	}
}
</style>
