<template>
	<div class="i-simple-table" @dragover="dragover" @drop.prevent="$emit('drop', $event)">
		<slot name="header"></slot>
		<table border="0">
			<thead>
				<tr>
					<th v-for="(item, i) in keys" :key="i" :style="{'min-width': sizes[i] + 'px'}">
						{{ item }}
					</th>
				</tr>
			</thead>
			<tbody>
				<slot :list="list"></slot>
			</tbody>
		</table>
		<slot name="footer"></slot>
		<i-modal :open="loading" padding="1em">
			<i-icon name="loading" size="2em" loading></i-icon>
		</i-modal>
	</div>
</template>
<script>
export default {
	name: "ISimpleTable",
	components: {},
	props: {
		keys: {type: Array, required: true},
		sizes: {
			type: Array,
			default() {
				return [];
			},
		},
		data: {type: Array, required: true},
		loading: Boolean,
		dropable: Boolean,
	},
	data() {
		return {};
	},
	computed: {
		list() {
			return this.data;
		},
	},
	mounted() {},
	methods: {
		dragover(e) {
			if (this.dropable) e.preventDefault();
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";

.i-simple-table {
	position: relative;
	> table {
		width: 100%;
		border-spacing: 0;
		> thead > tr {
			> th {
				position: sticky;
				top: 0;
				background-color: #fff;
				z-index: 1;
			}
		}
		td {
			border: 0;
			.ellipsis;
		}
	}
}
</style>
