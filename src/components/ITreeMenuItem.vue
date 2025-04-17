<template>
	<div
		v-if="data"
		class="i-tree-menu-item"
		:class="`level${level}`"
		@mouseenter="mouseenter"
		@mouseleave="mouseleave"
	>
		<slot :item="data" :selected="selected"></slot>
		<transition v-if="data.children && data.children.length" name="it-fade">
			<div v-show="isShow" class="i-tree-menu-item__children">
				<ITreeMenuItem
					v-for="(item, i) in data.children"
					:key="i"
					:data="item"
					:index="i"
					:select-path="selectPath"
					:level="level + 1"
				>
					<template #default="props">
						<slot v-bind="props"></slot>
					</template>
				</ITreeMenuItem>
			</div>
		</transition>
	</div>
	<div v-else class="i-tree-menu-divider"></div>
</template>
<script>
export default {
	name: "ITreeMenuItem",
	components: {},
	props: {
		data: Object,
		selectPath: Array,
		index: Number,
		level: {type: Number, default: 0},
	},
	data() {
		return {
			isShow: false,
		};
	},
	computed: {
		selected() {
			return this.selectPath[this.level] === this.index;
		},
	},
	watch: {
		selected(v) {
			this.isShow = v;
		},
		isShow(v) {
			if (this.data.onVisibleChange) this.data.onVisibleChange(v);
		},
	},
	mounted() {},
	methods: {
		mouseenter() {
			this.isShow = true;
		},
		mouseleave() {
			this.isShow = false;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-tree-menu-item {
	position: relative;
	> .i-tree-menu-item__children {
		box-shadow: 0px 0 10px 0px rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		position: absolute;
		background: #fff;
		z-index: 1;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
	}
}
.i-tree-menu-divider {
	width: 1px;
	background: #e5e5e5;
	margin: 0;
}
</style>
