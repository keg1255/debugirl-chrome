<template>
	<div class="i-radios" :class="type + '-style'">
		<i-radio
			v-for="(item, i) in list"
			:key="i"
			:checked="item.value == value"
			@click="$emit('input', item.value)"
		>
			{{ item.label }}
		</i-radio>
	</div>
</template>
<script>
export default {
	name: "IRadios",
	components: {},
	props: {
		value: {},
		options: {type: Array, required: true},
		type: {type: String, default: "radio"}, // label radio
	},
	data() {
		return {};
	},
	computed: {
		list() {
			return (this.options || []).map((item, index) => {
				if (typeof item == "string") {
					return {label: item, value: index};
				}
				return item;
			});
		},
	},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-radios {
	display: flex;
	.space-x(10px);
	&.label-style {
		> .i-radio {
			padding: 6px;
			border-radius: 6px;
			cursor: pointer;
			color: #1c2028;
			line-height: 1;
			> .__radio {
				display: none;
			}
			&:hover {
				background: #5498ff;
				color: #fff;
			}
			&.active {
				background: #1c77ff;
				color: #fff;
			}
		}
	}
	&.radio-style {
	}
}
</style>
