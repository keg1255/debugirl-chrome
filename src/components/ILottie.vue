<template>
	<div
		class="i-lottie"
		v-bind="$attrs"
		@mouseenter="hover = true"
		@mouseleave="hover = false"
	></div>
</template>
<script>
import {dirname, loadjson} from "@/common/utils";

export default {
	name: "ILottie",
	components: {},
	props: {
		data: {type: [Object, String], required: true},
		// 悬停正序，移出倒序播放 :direction="({hover}) => (hover ? 1 : -1)"
		// 悬停播放，移出暂停 :direction="({hover}) => (hover ? 1 : 0)"
		direction: [Function, Number], // 0: 暂停 1: 播放 -1: 反向播放
		noloop: Boolean, // 不循环
	},
	data() {
		return {
			hover: false,
		};
	},
	computed: {
		dir() {
			if (this.direction == null) return 1;
			if (typeof this.direction === "function") return this.direction(this);
			return this.direction;
		},
	},
	watch: {
		dir() {
			this.setDirection();
		},
	},
	async mounted() {
		let data = this.data;
		if (typeof data === "string") {
			let baseURL = dirname(data);
			data = await loadjson(data);
			data.assets.forEach((asset) => {
				if (asset.u && asset.u[0] != "/") asset.u = baseURL + "/" + asset.u;
			});
		}
		const lottie = await import("lottie-web");
		const loop = !this.noloop;
		this.animation = lottie.loadAnimation({
			container: this.$el,
			renderer: "svg",
			loop: loop,
			autoplay: loop,
			animationData: data,
		});
		this.setDirection();
	},
	beforeUnmount() {
		if (!this.animation) return;
		this.animation.destroy();
	},
	methods: {
		setDirection() {
			if (!this.animation) return;
			if (this.dir === 0) {
				this.animation.pause();
			} else if (this.dir === 1) {
				this.animation.setDirection(1);
				this.animation.play();
			} else if (this.dir === -1) {
				this.animation.setDirection(-1);
				this.animation.play();
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-lottie {
}
</style>
