<template>
	<div class="i-markdown" v-html="html"></div>
</template>
<script>
import {loadjs} from "@/common/utils";

export default {
	name: "IMarkdown",
	components: {},
	props: {
		value: String,
	},
	data() {
		return {
			html: "",
		};
	},
	computed: {},
	watch: {
		value() {
			this.parse();
		},
	},
	mounted() {
		this.parse();
	},
	methods: {
		async parse() {
			// import {parse} from "marked";
			let {parse} = await loadjs("marked.min.js");
			try {
				this.html = parse(this.value);
			} catch (e) {
				console.error(e);
				this.html = this.value;
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-markdown {
	user-select: text;
}
</style>
