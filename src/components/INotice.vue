<template>
	<div v-if="show" class="i-notice">
		<div><slot></slot></div>
		<i-svg name="close" @click="onClose"></i-svg>
	</div>
</template>
<script>
import {md5Sync} from "@/common/utils";

export default {
	name: "INotice",
	components: {},
	props: {
		name: String,
	},
	data() {
		return {
			show: true,
		};
	},
	computed: {},
	mounted() {
		if (this.name) {
			this.key = "i-notice." + this.name;
			this.md5 = md5Sync(this.$el.innerText);
			this.show = localStorage.getItem(this.key) != this.md5;
		}
	},
	methods: {
		onClose() {
			this.show = false;
			if (this.name) {
				localStorage.setItem(this.key, this.md5);
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-notice {
	display: flex;
	background-color: #fff9ea;
	padding: 10px 15px;
	color: #ff9a43;
	> div:first-child {
		flex: 1;
		word-break: break-all;
	}
	> .i-svg {
		margin-left: 15px;
	}
}
</style>
