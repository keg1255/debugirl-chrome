<template>
	<div class="i-image-center">
		<div
			class="i-image-center__box"
			:style="boxStyle"
			@mousedown="$emit('mousedown', $event)"
			@wheel="$emit('wheel', $event)"
			@contextmenu.prevent
		>
			<img :src="src" @load="onload" />
			<canvas ref="canvas"></canvas>
			<slot></slot>
		</div>
	</div>
</template>
<script>
import {contain} from "@/common/utils";
export default {
	// 图片
	name: "IImageCenter",
	components: {},
	props: {
		src: String, // 背景图片
	},
	data() {
		return {
			originSize: {width: 0, height: 0},
			centerTransform: {x: 0, y: 0, scale: 1},
		};
	},
	computed: {
		boxStyle() {
			let {originSize, centerTransform} = this;
			return {
				width: `${originSize.width}px`,
				height: `${originSize.height}px`,
				transform: `translate(${centerTransform.x}px, ${centerTransform.y}px) scale(${centerTransform.scale})`,
			};
		},
	},
	mounted() {
		this.$emit("canvas", this.$refs.canvas);
	},
	methods: {
		onload(e) {
			let img = e.target;
			let width = this.$el.clientWidth;
			let height = this.$el.clientHeight;
			let canvas = this.$refs.canvas;
			let originSize = {
				width: img.naturalWidth,
				height: img.naturalHeight,
			};
			canvas.width = originSize.width;
			canvas.height = originSize.height;

			let imgSize = Object.assign({}, originSize);
			contain(imgSize, {width, height});
			if (
				this.originSize.width !== originSize.width ||
				this.originSize.height !== originSize.height
			) {
				this.originSize = originSize;
				this.centerTransform = {
					x: (width - imgSize.width) / 2,
					y: (height - imgSize.height) / 2,
					scale: imgSize.width / originSize.width,
				};
				this.$emit("scale", this.centerTransform);
			}
			this.$emit("load", e);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-image-center {
	.i-image-center__box {
		transform-origin: 0 0;
		overflow: hidden;
		img {
			width: 100%;
			height: 100%;
		}
		canvas {
			position: absolute;
			top: 0;
			left: 0;
		}
	}
}
</style>
