<template>
	<div class="i-search-input">
		<i-svg class="search-icon" :name="searchIcon"></i-svg>
		<i-input :value="v" :placeholder="placeholder" @input="onInput" @submit="submit()"></i-input>
		<i-svg v-show="v" :src="clearIcon" @click="clear"></i-svg>
	</div>
</template>
<script>
import {svg2dataurl} from "@/common/utils";
export default {
	name: "ISearchInput",
	components: {},
	props: {
		value: String,
		modelValue: String,
		placeholder: String,
		searchIcon: {
			type: String,
			default: svg2dataurl(
				`<path d="M675.328 635.107556l141.824 141.824a28.444444 28.444444 0 1 1-40.220444 40.220444l-141.824-141.824a284.444444 284.444444 0 1 1 40.220444-40.220444zM455.111111 682.666667a227.555556 227.555556 0 1 0 0-455.111111 227.555556 227.555556 0 0 0 0 455.111111z" fill="currentColor"></path>`,
				{width: 1024, height: 1024}
			),
		},
		clearIcon: {
			type: String,
			default: svg2dataurl(
				`<path d="M810.005333 274.005333l-237.994667 237.994667 237.994667 237.994667-60.010667 60.010667-237.994667-237.994667-237.994667 237.994667-60.010667-60.010667 237.994667-237.994667-237.994667-237.994667 60.010667-60.010667 237.994667 237.994667 237.994667-237.994667z" fill="currentColor"></path>`,
				{width: 1024, height: 1024}
			),
		},
		onlyclear: Boolean,
	},
	emits: ["input", "update:modelValue", "submit"],
	data() {
		let val = this.value == null ? this.modelValue : this.value;
		return {
			v: val,
		};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
	},
	watch: {
		val(val) {
			console.log(val);
			this.v = val || "";
		},
	},
	mounted() {},
	methods: {
		onInput(v) {
			this.v = v;
			this.$emit("input", v);
			this.$emit("update:modelValue", v);
		},
		submit(v) {
			if (v != null) this.v = v;
			this.$emit("submit", this.v);
			if (v != null) this.$nextTick(() => this.$el.querySelector("input").focus());
		},
		clear() {
			if (this.onlyclear) this.onInput("");
			else this.submit("");
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-search-input {
	height: 28px;
	padding: 0 6px;
	display: inline-flex;
	align-items: center;
	background: #fff;
	.search-icon {
		margin-right: 6px;
	}
	.i-svg {
		width: 16px;
		height: 16px;
		min-width: 16px;
		min-height: 16px;
	}
	.i-input {
		flex: 1;
	}
}
</style>
