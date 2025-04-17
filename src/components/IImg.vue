<template>
	<img
		class="i-img"
		:src="err ? errSrc : src"
		referrerpolicy="no-referrer"
		@load="onLoad"
		@error="onError"
		@click="onClick"
		@mouseenter="onMouseenter"
		@mouseleave="onMouseleave"
	/>
</template>
<script>
export default {
	name: "IImg",
	components: {},
	props: {
		src: String,
		errSrc: {type: String, default: ""},
		hoverPreview: Boolean,
	},
	data() {
		return {
			err: false,
		};
	},
	computed: {},
	watch: {
		src: function (val) {
			this.err = false;
		},
	},
	mounted() {},
	methods: {
		onLoad(e) {
			if (this.err) return;
			let width = this.$el.naturalWidth;
			let height = this.$el.naturalHeight;
			this.err = !(width * height > 1);
			this.$emit(this.err ? "error" : "load", e);
			this.size = `${width}x${height}`;
		},
		onError(e) {
			if (this.err) return;
			this.err = true;
			this.$emit("error", e);
		},
		onClick(e) {
			this.$emit("click", e);
		},
		onMouseenter(e) {
			this.$emit("mouseenter", e);
			if (this.hoverPreview) {
				if (!this.preview) {
					this.preview = this.$el.cloneNode();
					this.preview.setAttribute(
						"style",
						"position:fixed;z-index:9999;max-width:90%;max-height:90%;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 10px rgba(0,0,0,0.5);background:#fff"
					);
					document.body.appendChild(this.preview);
				}
				this.preview.style.display = "block";
			}
		},
		onMouseleave(e) {
			this.$emit("mouseleave", e);
			if (this.preview) this.preview.style.display = "none";
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-img {
}
</style>
