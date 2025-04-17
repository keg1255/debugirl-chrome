<template>
	<div class="i-text-avatar" :class="cls">
		{{ v }}
	</div>
</template>
<script>
export default {
	name: "ITextAvatar",
	components: {},
	props: {
		value: String,
	},
	data() {
		return {};
	},
	computed: {
		v() {
			return this.value[0].toUpperCase();
		},
		cls() {
			let i = this.v.charCodeAt(0) % 7;
			return `theme-${i}`;
		},
	},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-text-avatar {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 58px;
	height: 58px;
	font-size: 28px;
	line-height: 1;
	&.theme-0 {
		background-color: #f5a623;
		color: #fff;
	}
	&.theme-1 {
		background-color: #f8e71c;
		color: #fff;
	}
	&.theme-2 {
		background-color: #7ed321;
		color: #fff;
	}
	&.theme-3 {
		background-color: #50e3c2;
		color: #fff;
	}
	&.theme-4 {
		background-color: #4a90e2;
		color: #fff;
	}
	&.theme-5 {
		background-color: #bd10e0;
		color: #fff;
	}
	&.theme-6 {
		background-color: #9013fe;
		color: #fff;
	}
}
</style>
