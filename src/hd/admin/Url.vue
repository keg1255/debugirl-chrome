<template>
	<span v-if="!value"></span>
	<a v-else class="hd-url" :href="url" target="_blank" @click.stop>
		<i-img v-if="isImage1" :src="url" :alt="name" hover-preview @error="onError" />
		<template v-else>{{ name }}</template>
	</a>
</template>
<script>
export default {
	name: "Url",
	components: {},
	props: {
		value: String,
	},
	data() {
		return {
			isImage1: false,
		};
	},
	computed: {
		url() {
			return /^(https?:)?\/\//.test(this.value) ? this.value : "http://" + this.value;
		},
		name() {
			if (!this.url) return "-";
			let ss = this.url.split("?")[0].split("/");
			while (ss.length) {
				let s = ss.pop();
				if (s) return s.slice(-10);
			}
			return "-";
		},
		isImage() {
			return (
				/\W(jpe?g|png|gif|svg|webp|bmp)(\W|$)/i.test(this.url) || /\/[^\.]+(\?|$)/.test(this.url)
			);
		},
	},
	watch: {
		isImage: {
			immediate: true,
			handler(val) {
				this.isImage1 = val;
			},
		},
	},
	mounted() {},
	methods: {
		onError() {
			this.isImage1 = false;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-url {
	img {
		max-width: 40px;
		max-height: 40px;
	}
}
</style>
