<template>
	<div class="i-carousel" :class="{small}">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "ICarousel",
	components: {},
	props: {
		name: String,
	},
	data() {
		return {
			small: false,
			idx: 0,
		};
	},
	computed: {},
	watch: {
		idx(val) {
			this.onResize();
		},
	},
	mounted() {
		this.onResize();
		window.addEventListener("resize", this.onResize);
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.onResize);
	},
	methods: {
		onResize() {
			let n = 0;
			for (let i = 0; i < this.$el.childNodes.length; i++) {
				let child = this.$el.childNodes[i];
				if (child.nodeType === 1) {
					n += child.clientWidth;
				}
			}
			this._max = Math.max(n, this._max || 0);
			this.small = this._max > this.$el.clientWidth;
			if (this.small) {
				this.toSlideMode();
			} else {
				let list = this.$el.querySelectorAll(".i-carousel-item");
				for (let i = 0; i < list.length; i++) {
					let item = list[i];
					item.style.opacity = 1;
					item.style.transform = "";
				}
			}
		},
		toSlideMode() {
			let list = this.$el.querySelectorAll(".i-carousel-item");
			let idx = this.idx;
			let halfCount = Math.floor(list.length / 2);
			let leftOffset = this.$el.clientWidth / 2;
			let rightOffset;
			let item = list[idx];
			item.style.transform = `translateX(${leftOffset - item.clientWidth / 2}px)`;
			item.style.opacity = 1;
			item.style.zIndex = 10;
			rightOffset = leftOffset + item.clientWidth / 2;
			leftOffset = leftOffset - item.clientWidth / 2;
			for (let i = 1; i <= halfCount; i++) {
				let leftIdx = (idx - i + list.length) % list.length;
				item = list[leftIdx];
				item.style.transform = `translateX(${leftOffset - item.clientWidth / 2}px) scale(${
					1 - i * 0.1
				})`;
				item.style.opacity = 0.5;
				item.style.zIndex = 10 - i;
				item.onclick = () => {
					this.idx = leftIdx;
				};
				leftOffset = leftOffset - item.clientWidth / 2;
				let rightIdx = (idx + i) % list.length;
				item = list[rightIdx];
				item.style.transform = `translateX(${rightOffset - item.clientWidth / 2}px) scale(${
					1 - i * 0.1
				})`;
				item.style.opacity = 0.5;
				item.style.zIndex = 10 - i;
				item.onclick = () => {
					this.idx = rightIdx;
				};
				rightOffset = rightOffset + item.clientWidth / 2;
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-carousel {
	display: flex;
	justify-content: space-around;
	position: relative;
	&.small {
		> .i-carousel-hide {
			display: none !important;
		}
		> .i-carousel-item {
			position: absolute;
			left: 0;
			top: 0;
			cursor: pointer;
			transition: 0.3s all;
		}
	}
}
</style>
