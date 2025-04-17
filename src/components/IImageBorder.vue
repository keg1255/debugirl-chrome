<template>
	<i-image-center
		class="i-image-border"
		:src="src"
		@load="onload"
		@canvas="oncanvas"
	></i-image-center>
</template>
<script>
import {limitSize, loadImage} from "@/common/utils";
import {calcImageBorder} from "./lib/image-border";
export default {
	name: "IImageBorder",
	components: {},
	props: {
		src: String, // 背景图片URL
		border: String, // 相框图片URL
		scale: {type: Number, default: 1}, // 边框缩放比例
	},
	data() {
		return {
			// bgImage: null, // 背景图片
			// borderImage: null, // 相框svg图片
			// borders: [], // 边框矩形, 8个, 通过calcImageBorder获得
		};
	},
	computed: {},
	watch: {
		border() {
			this.loadBorder();
		},
		scale() {
			this.render();
		},
	},
	mounted() {
		this.loadBorder();
	},
	methods: {
		oncanvas(e) {
			this.canvas = e;
		},
		onload(e) {
			this.bgImage = e.target;
			this.renderInit();
		},
		async loadBorder() {
			if (!this.border) return;
			let img = await loadImage(this.border);
			this.borders = calcImageBorder(img);
			this.borderImage = img;
			this.renderInit();
		},
		renderInit() {
			let {bgImage, borderImage} = this;
			if (bgImage && borderImage) {
				let sw = bgImage.naturalWidth / borderImage.naturalWidth;
				let sh = bgImage.naturalHeight / borderImage.naturalHeight;
				let scale = Math.max(sw, sh);
				this.bgScale = scale;
				let width = borderImage.naturalWidth * scale;
				let height = borderImage.naturalHeight * scale;
				let size = {width, height};
				limitSize(size, {width: 5000, height: 5000});
				this.borderScale = size.width / borderImage.naturalWidth;
				// svg转canvas, 直接画svg位置不对
				let canvas = document.createElement("canvas");
				canvas.width = size.width;
				canvas.height = size.height;
				let ctx = canvas.getContext("2d");
				ctx.drawImage(borderImage, 0, 0, canvas.width, canvas.height);
				console.log(canvas.width, canvas.height);
				this.borderCanvas = canvas;
				this.render();
			}
		},
		async render() {
			let border = this.borderCanvas;
			let canvas = this.canvas;
			if (!canvas || !border) return;
			/** @type {CanvasRenderingContext2D} */
			let ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let scale = this.bgScale * this.scale;
			ctx.strokeStyle = "red";
			for (let i = 0; i < this.borders.length; i++) {
				let item = this.borders[i];
				let src = item.getRect(border, this.borderScale);
				let dst = item.getRect(canvas, scale);
				// ctx.clearRect(0, 0, canvas.width, canvas.height);
				if (item.type == 1) {
					// 循环
					if (item.name == "top" || item.name == "bottom") {
						let n = Math.ceil(dst.width / src.width / this.scale);
						let w = dst.width / n;
						for (let j = 0; j < n; j++) {
							ctx.drawImage(
								border,
								src.x,
								src.y,
								src.width,
								src.height,
								dst.x + j * w,
								dst.y,
								w,
								dst.height
							);
							// ctx.strokeRect(dst.x + j * w, dst.y, 1, dst.height);
						}
					} else {
						let n = Math.ceil(dst.height / src.height / this.scale);
						console.log(n);
						let h = dst.height / n;
						for (let j = 0; j < n; j++) {
							ctx.drawImage(
								border,
								src.x,
								src.y,
								src.width,
								src.height,
								dst.x,
								dst.y + j * h,
								dst.width,
								h
							);
							// ctx.strokeRect(dst.x, dst.y + j * h, dst.width, 1);
						}
					}
				} else if (item.type == 2) {
					// 逆向循环
					if (item.name == "top" || item.name == "bottom") {
						let n = Math.ceil(dst.width / src.width / this.scale);
						if ((n & 1) == 0) n--;
						let w = dst.width / n;
						for (let j = 0; j < n; j++) {
							// 左右翻转
							if (j & 1) {
								ctx.save();
								ctx.translate(dst.x + (j + 1) * w, dst.y);
								ctx.scale(-1, 1);
								ctx.drawImage(border, src.x, src.y, src.width, src.height, 0, 0, w, dst.height);
								ctx.restore();
							} else {
								ctx.drawImage(
									border,
									src.x,
									src.y,
									src.width,
									src.height,
									dst.x + j * w,
									dst.y,
									w,
									dst.height
								);
							}
							// ctx.strokeRect(dst.x + j * w, dst.y, 1, dst.height);
						}
					} else {
						let n = Math.ceil(dst.height / src.height / this.scale);
						if ((n & 1) == 0) n--;
						let h = dst.height / n;
						for (let j = 0; j < n; j++) {
							// 上下翻转
							if (j & 1) {
								ctx.save();
								ctx.translate(dst.x, dst.y + (j + 1) * h);
								ctx.scale(1, -1);
								ctx.drawImage(border, src.x, src.y, src.width, src.height, 0, 0, dst.width, h);
								ctx.restore();
							} else {
								ctx.drawImage(
									border,
									src.x,
									src.y,
									src.width,
									src.height,
									dst.x,
									dst.y + j * h,
									dst.width,
									h
								);
							}
							// ctx.strokeRect(dst.x, dst.y + j * h, dst.width, 1);
						}
					}
				} else {
					ctx.drawImage(
						border,
						src.x,
						src.y,
						src.width,
						src.height,
						dst.x,
						dst.y,
						dst.width,
						dst.height
					);
				}
				// if (i >= 4) ctx.strokeRect(dst.x, dst.y, dst.width, dst.height);
			}
			// console.log(w, h);
			// ctx.drawImage(border, 0, 0, w, h);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-image-border {
}
</style>
