<template>
	<hd-dialog-center @close="$emit('close')">
		<div class="dialogs-pick-item">
			<div v-if="title" class="title">{{ title }}</div>
			<div class="list">
				<div
					v-for="item in list"
					:key="item.id"
					class="item"
					:class="{active: cur == item}"
					@click="$emit('close', item)"
				>
					{{ item.label || item.name }}
				</div>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script>
export default {
	name: "PickItem",
	components: {},
	props: {
		title: String,
		list: {type: Array, required: true},
		cur: {},
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
.dialogs-pick-item {
	background-color: #fff;
	> .title {
		padding: 10px;
		font-size: 20px;
		text-align: center;
		font-weight: bold;
	}
	> .list {
		display: flex;
		flex-wrap: wrap;
		max-width: 800px;
		max-height: 90vh;
		.scroll-y;
		> .item {
			cursor: pointer;
			margin: 10px;
			&:hover {
				color: @primary;
				text-decoration: underline;
			}
			&.active {
				color: @primary;
			}
		}
	}
}
</style>
