<template>
	<hd-dialog-center @close="$emit('close')">
		<div class="dialogs-copy">
			<b>请使用 Ctrl+C 复制</b>
			<textarea :value="text" @copy="oncopy"></textarea>
		</div>
	</hd-dialog-center>
</template>
<script>
export default {
	name: "Copy",
	components: {},
	props: {
		text: String,
	},
	emits: ["close"],
	data() {
		return {};
	},
	computed: {},
	mounted() {
		this.$el.querySelector("textarea").select();
	},
	methods: {
		oncopy(e) {},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-copy {
	background-color: #fff;
	padding: 12px;
	display: flex;
	flex-direction: column;
	textarea {
		min-width: 50vw;
		min-height: 180px;
		.scroll-y;
	}
}
</style>
