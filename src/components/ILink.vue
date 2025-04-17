<template>
	<a class="i-link" :class="{active}" :href="link.href" @click="onclick"><slot></slot></a>
</template>
<script>
export default {
	name: "ILink",
	components: {},
	props: {
		to: {required: true},
		blank: Boolean,
		replace: Boolean,
	},
	emits: ["click"],
	data() {
		return {};
	},
	computed: {
		clickable() {
			return this._.vnode.props.onClick;
		},
		link() {
			if (!this.to) return {};
			if (/^(https?:)?\/\//.test(this.to)) return {href: this.to};
			return this.$router.resolve(this.to);
		},
		active() {
			return this.$route.path == this.link.resolved?.path;
		},
	},
	methods: {
		onclick(e) {
			e.preventDefault();
			if (this.clickable) {
				return this.$emit("click", e);
			}
			if (this.blank) {
				return window.open(this.link.href);
			}
			if (/^(https?:)?\/\//.test(this.to)) {
				// #ifdef ELECTRON
				electron.shell.openExternal(this.to);
				// #endif
				// #ifndef ELECTRON
				location.href = this.to;
				// #endif
				return;
			}
			if (this.replace) {
				return this.$router.replace(this.to);
			}
			this.$router.push(this.to);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-link {
	cursor: pointer;
}
</style>
