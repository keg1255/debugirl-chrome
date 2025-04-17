<template>
	<div class="hd-foreign-list" @click.stop="reload">
		<div v-if="!list.length" class="empty">-</div>
		<div v-for="(item, i) in list" :key="i" class="foreign-item">
			<img class="avatar" :src="item.avatar" alt="" referrerpolicy="no-referrer" />
			<br />
			<span class="nickname">{{ item.name }}</span>
		</div>
	</div>
</template>
<script>
export default {
	name: "ForeignList",
	components: {},
	props: {
		tr: {type: Object, required: true},
		value: [String, Number],
	},
	data() {
		return {
			list: [],
		};
	},
	computed: {},
	watch: {
		value() {
			this.refresh();
		},
	},
	mounted() {
		this.refresh();
	},
	methods: {
		reload() {
			if (!this.tr) return;
			this.tr.cache.delete(this.value);
			this.refresh();
		},
		refresh() {
			if (!this.tr) return;
			this.tr.run(this.value).then((x) => {
				this.list = x;
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-foreign-list {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	cursor: pointer;
	> .foreign-item {
		margin: 4px;
		> .avatar {
			width: 40px;
			height: 40px;
			border-radius: 50%;
		}
		> .nickname {
			white-space: nowrap;
		}
	}
}
</style>
