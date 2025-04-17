<template>
	<canvas></canvas>
</template>
<script>
import {loadImage, svg2dataurl} from "@/common/utils";
import {QRCode} from "./QRCode";
import RendererBase from "./renderers/RendererBase";
import {draw} from "./renderers/helper";

export default {
	name: "IQr",
	components: {},
	props: {
		typeNumber: {type: Number, default: -1}, // 二维码version(大小)
		correctLevel: {type: Number, default: 2}, // 纠错等级
		text: {type: String, default: ""}, // 二维码内容
		type: {type: Number, default: 0}, // 信息点样式 [矩形,圆形,随机]
		size: {type: Number, default: 1}, // 信息点缩放 0~1
		opacity: {type: Number, default: 1}, // 信息点不透明度 0~1
		posType: {type: Number, default: 0}, // 定位点样式 [矩形,圆形,行星,圆角矩形]
		posOpacity: {type: Number, default: 1}, // 定位点不透明度 0~1
		otherColor: {type: String, default: "#000"}, // 信息点颜色, 默认黑色
		posColor: {type: String, default: "#000"}, // 定位点颜色, 默认黑色
		icon: {type: String, default: ""}, // 图标
		iconScale: {type: Number, default: 0.8}, // 图标大小 0~1
		iconRadius: {type: Number, default: 0}, // 图标圆角 0~50
		iconBackgroundColor: {type: String, default: ""}, // 图标背景颜色
		padding: {type: Number, default: 0}, // 二维码内边距
		border: {type: Number, default: 0}, // 二维码边框宽度
		borderColor: {type: String, default: "#000"}, // 二维码边框颜色
		borderRadius: {type: Number, default: 0}, // 二维码边框圆角 0~50
		gradient: {type: String, default: ""}, // 二维码渐变色, 例如: 1/yellow/blue 1向下 2右下 3右上 4圆形
		backgroundColor: {type: String, default: ""}, // 二维码背景颜色
		background: {type: Object}, // 二维码背景图片及二维码在图片中的位置 {url: '', x0: 0, y0: 0, x1: 0, y1: 0}
	},
	data() {
		return {
			url: "",
		};
	},
	computed: {
		qrHash() {
			return this.text + "/" + this.typeNumber + "/" + this.correctLevel;
		},
		renderHash() {
			return [
				this.type,
				this.size,
				this.opacity,
				this.otherColor,
				this.posType,
				this.posOpacity,
				this.posColor,
			].join("/");
		},
		drawHash() {
			return [
				this.icon,
				this.iconScale,
				this.iconRadius,
				this.iconBackgroundColor,
				this.padding,
				this.border,
				this.borderColor,
				this.borderRadius,
				this.gradient,
				this.background,
			].join();
		},
		iconPMS() {
			return this.icon ? loadImage(this.icon) : null;
		},
		backgroundPMS() {
			return this.background && this.background.url ? loadImage(this.background.url) : null;
		},
	},
	watch: {
		async qrHash() {
			if (this.pms) await this.pms;
			this.pms = this.newQr();
		},
		async renderHash() {
			if (this.pms) await this.pms;
			this.pms = this.updateQr();
		},
		async drawHash() {
			if (this.pms) await this.pms;
			this.pms = this.draw();
		},
	},
	mounted() {
		this.pms = this.newQr();
	},
	methods: {
		newQr() {
			let qr = new QRCode(this.typeNumber, this.correctLevel);
			qr.addData(this.text);
			qr.make();
			this.qr = qr;
			return this.updateQr();
		},
		async updateQr() {
			let render = new RendererBase(this);
			let svg = render.render(this.qr);
			this.qrImg = await loadImage(svg2dataurl(svg));
			await this.draw();
		},
		async draw() {
			let qrcanvas = await draw(this);
			let canvas = this.$el;
			let ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			if (this.backgroundPMS) {
				let background = this.background;
				let img = await this.backgroundPMS;
				let size = Math.min(background.x1 - background.x0, background.y1 - background.y0);
				let x = (background.x1 + background.x0 - size) / 2;
				let y = (background.y1 + background.y0 - size) / 2;
				let scale = canvas.width / img.naturalWidth;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				ctx.drawImage(qrcanvas, x * scale, y * scale, size * scale, size * scale);
			} else {
				ctx.drawImage(qrcanvas, 0, 0, canvas.width, canvas.height);
			}
		},
		toDataURL() {
			return this.$el.toDataURL();
		},
		wait() {
			if (!this.pms) throw "not mounted";
			return this.pms;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-qr {
}
</style>
