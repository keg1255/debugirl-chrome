<template>
	<i-popup class="i-popup-menu" :open="open" @update:open="$emit('update:open', $event)">
		<i-tree-menu :enable-hotkey="!!open" :menus="menus" :vertical="vertical" @select="onClick">
			<template #default="{item, selected}">
				<div class="tool" :class="{selected}" :style="item.style" @click="onClick(item)">
					<img v-if="item.avatar" :src="item.avatar" class="avatar" />
					<i-svg v-if="item.icon" class="icon" :name="item.icon"></i-svg>
					<div v-if="item.title" class="menu-title">{{ item.title }}</div>
					<i-svg v-if="item.triangle" class="triangle" name="triangle"></i-svg>
					<i-tooltip v-if="item.tips">{{ item.tips }}</i-tooltip>
				</div>
			</template>
		</i-tree-menu>
	</i-popup>
</template>
<script>
export default {
	name: "IPopupMenu",
	components: {},
	props: {
		open: {},
		menus: {type: Array, default: () => []},
		closeContent: Boolean, // 点击内容也关闭
		vertical: Boolean, // 竖向菜单
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		onClick(item) {
			item && item.click && item.click();
			this.$emit("update:open", null);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-popup-menu {
	user-select: none; // 菜单中一项

	.tool {
		cursor: pointer;
		background-color: #fff;
		height: 25px;
		display: flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		padding: 0 5.5px;

		&.selected {
			background-color: #f5f5f5;
			color: #000;
		}
		&:hover {
			background-color: @primary;
			color: #fff;
		}
		&.act {
			color: @primary;
		}
		.avatar {
			width: 1em;
			height: 1em;
			border-radius: 50%;
			margin-right: 3px;
		}
		.menu-title {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.icon {
			width: 1em;
			height: 1em;
		}
		.triangle {
			width: 10px;
			height: 1em;
		}
	}

	.level1 {
		.tool {
			padding: 0 12px;
		}
		.icon {
			margin-right: 5px;
		}
	}

	.i-tooltip {
		font-size: 12px;
		padding: 5px;
		pointer-events: none;
	}
}
</style>
