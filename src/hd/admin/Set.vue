<template>
	<div class="admin-set">
		<div
			v-for="(item, i) in list"
			:key="i"
			:style="{background: item.color}"
			class="item"
			:class="{color: item.is_color}"
		>
			{{ item.label }}
		</div>
	</div>
</template>
<script>
import {isColor, strHash} from "@/common/utils";
export default {
	name: "Set",
	components: {},
	props: {
		value: String,
		multiple: {},
	},
	data() {
		return {};
	},
	computed: {
		list() {
			return (this.value || "")
				.split("/")
				.filter((x) => x)
				.map((x, i) => {
					let is_color = isColor(x);
					return {
						label: is_color ? "" : x,
						color: is_color ? x : this.getColor(x),
						is_color,
					};
				});
		},
	},
	mounted() {},
	methods: {
		getColor(idx) {
			if (typeof idx === "string") idx = strHash(idx);
			return ["#f50", "#2db7f5", "#87d068", "#108ee9"][idx % 4] || "#108ee9";
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.admin-set {
	display: flex;
	flex-wrap: wrap;
	> div {
		margin: 2px;
		padding: 3px 5px;
		border-radius: 5px;
		white-space: nowrap;
		color: #fff;
		&.color {
			color: #000;
			width: 1em;
			height: 1em;
			border-radius: 50%;
		}
	}
}
</style>
