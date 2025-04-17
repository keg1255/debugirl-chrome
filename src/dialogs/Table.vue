<template>
	<hd-dialog-center @close="$emit('close')">
		<div class="dialogs-table">
			<h3>{{ title }}</h3>
			<i-table :headers="headers1" :data="data" sort-fn>
				<template #before="{item}">
					<i-img :src="item.before"></i-img>
				</template>
				<template #after="{item}">
					<i-img :src="item.after"></i-img>
				</template>
				<template #color="{item}">
					<i-svg :src="item.color" style="color: red" @click="log(item)"></i-svg>
				</template>
				<template #tool="{index}">
					<button @click="data.splice(index, 1)">删除</button>
				</template>
			</i-table>
			<div class="actions">
				<button v-for="(item, i) in btns" :key="i" @click="$emit('close', i)">{{ item }}</button>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script>
export default {
	name: "Table",
	components: {},
	props: {
		title: String,
		headers: Array,
		data: Array,
		btns: {
			type: Array,
			default() {
				return ["确定", "取消"];
			},
		},
	},
	data() {
		return {};
	},
	computed: {
		headers1() {
			return this.headers.map((item, index) => {
				if (typeof item === "string") {
					return {name: item, key: index};
				}
				return item;
			});
		},
	},
	mounted() {},
	methods: {
		log(item) {
			console.log(item);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-table {
	background-color: #fff;
	padding: 12px 12px 0;
	min-width: 80vw;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	.i-table {
		flex: 1;
		height: 1px;
		.scroll-y;
		.i-svg,
		svg,
		img {
			max-height: 80px;
			max-width: 20vw;
		}
		td {
			overflow: hidden;
		}
	}
	.actions {
	}
}
</style>
