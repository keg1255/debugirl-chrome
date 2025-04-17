<template>
	<a
		class="admin-ip"
		:title="value"
		:href="`https://www.ipshudi.com/${value}.htm`"
		target="_blank"
		>{{ area || value }}</a
	>
</template>
<script>
export default {
	name: "Ip",
	components: {},
	props: {
		value: String,
		area: String,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.admin-ip {
}
</style>
