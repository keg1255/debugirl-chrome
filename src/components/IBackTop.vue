<template>
	<transition name="it-fade">
		<i-svg
			v-show="$app.scrollY > $app.innerHeight"
			class="i-back-top"
			:name="name"
			@click="onClick"
		></i-svg>
	</transition>
</template>
<script>
import {svg2dataurl} from "@/common/utils";
export default {
	name: "IBackTop",
	components: {},
	props: {
		name: {
			type: String,
			default: svg2dataurl(
				`<path fill="currentColor" d="M511.104 287.872 959.36 734.976 512.32 489.344 64.64 736.128Z"/>`,
				{width: 1024, height: 1024}
			),
		},
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		onClick() {
			window.scrollTo({top: 0, behavior: "smooth"});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-back-top {
	width: 40px;
	height: 40px;
	color: grey;
	.depth;
}
</style>
