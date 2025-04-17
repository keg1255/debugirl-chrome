<template>
	<span class="i-span" :title="value" @click.stop="copy(value)">{{
		(value && value.length > 15) || isNaN(value) || !value
			? limit
				? limitString(value, limit)
				: value
			: +(+value).toFixed(2)
	}}</span>
</template>
<script>
import {copy, limit} from "@/common/utils";
export default {
	name: "ISpan",
	components: {},
	props: {
		value: {},
		limit: Number,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		copy(s) {
			if (copy(s)) {
				this.$toast.success("已复制");
			} else {
				this.$toast.error("复制失败");
			}
		},
		limitString(v, n) {
			return limit(v, n);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-span {
	cursor: pointer;
}
</style>
