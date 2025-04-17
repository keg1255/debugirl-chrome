<template>
	<canvas class="i-canvas" @click="onClick"></canvas>
</template>
<script>
import {contain, loadImage, waitUntil} from "@/common/utils";
import {drawWaterMark} from "@/common/hdim";
export default {
	name: "ICanvas",
	components: {},
	props: {
		src: String,
		water: {
			// type: "image",
			// opacity: 100,
			// color: "red",
			// text: "www.bangongziyuan.com",
			// url: "pe/icons/pic_shuiyin@2x.png",
			// space: 0,
			// scale: 30,
			// rotate: 0,
			// position: null, // 位置, 0~8九空格 null平铺
			// font: "", // 字体
		},
	},
	data() {
		return {};
	},
	computed: {},
	watch: {
		src() {
			this.loadImage();
		},
		water: {
			deep: true,
			handler() {
				if (this.image) this.reanderAll();
			},
		},
	},
	mounted() {
		this.loadImage();
		window.addEventListener("resize", this.resize);
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.resize);
	},
	methods: {
		async resize() {
			let image = this.image;
			let parent = this.$el.parentNode;
			if (!parent || !image || !image.width) return;
			if (await waitUntil(() => parent.clientWidth, 5e3)) {
				let size = {width: parent.clientWidth, height: parent.clientHeight};
				let size0 = {width: image.naturalWidth, height: image.naturalHeight};
				this.$emit("realsize", size0);
				contain(size0, size);
				this.$el.width = size0.width;
				this.$el.height = size0.height;
				this.$emit("canvassize", size0);
				return this.reanderAll();
			}
		},
		loadImage() {
			if (!this.src) return;
			return loadImage(this.src).then((image) => {
				this.image = image;
				return this.resize();
			});
		},
		reanderAll() {
			/** @type {HTMLCanvasElement} */
			let canvas = this.$el;
			let image = this.image;
			let ctx = canvas.getContext("2d");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			if (this.water) drawWaterMark(canvas, this.water);
		},
		onClick(e) {
			this.$emit("click", e);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-canvas {
}
</style>
