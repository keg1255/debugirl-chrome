<template>
	<div class="hd-form-array">
		<div v-for="(item, i) in value || []" :key="i" class="array-one" :class="{hide: hides[i]}">
			<FormOne :body="item" :params="getParams(item)" :label-position="labelPosition"></FormOne>
			<div class="actions" :class="{hide: hides[i]}">
				<button class="primary-link" @click="move(i, -1)">上移</button>
				<button class="primary-link" @click="move(i, 1)">下移</button>
				<button class="error-link" @click="remove(i)">删除</button>
				<button class="success-link" @click="add(i)">插入</button>
				<div class="flex-1"></div>
				<button class="primary-link" @click="toggle(i)">{{ hides[i] ? "展开" : "收起" }}</button>
			</div>
		</div>
		<div class="actions">
			<button class="success-link" @click="add()">添加</button>
		</div>
	</div>
</template>
<script lang="ts">
export default {
	name: "HdFormArray",
	components: {
		FormOne: () => import("@/hd/Form.vue"),
	},
	props: {
		value: Array,
		params: {required: true},
		labelPosition: {type: String, default: "left"}, // label 位置: left, top
	},
	emits: ["input"],
	data() {
		return {
			hides: {},
		};
	},
	computed: {},
	mounted() {},
	methods: {
		getParams(body) {
			if (typeof this.params === "function") return this.params(body);
			return this.params;
		},
		move(i, n) {
			let value = (this.value || []).concat();
			let item = value.splice(i, 1)[0];
			value.splice(i + n, 0, item);
			this.$emit("input", value);
		},
		remove(i) {
			let value = (this.value || []).concat();
			value.splice(i, 1);
			this.$emit("input", value);
		},
		add(i?: number) {
			let value = (this.value || []).concat();
			if (i == null) value.push({});
			else value.splice(i + 1, 0, {});
			this.$emit("input", value);
		},
		toggle(i) {
			this.hides[i] = !this.hides[i];
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-form-array {
	flex-direction: column;
	> .array-one {
		margin-top: 12px;
		padding: 6px 0;
		border-bottom: 1px solid #ccc;
		width: 100%;
		overflow: hidden;
		position: relative;
		&.hide {
			height: 80px;
			> .actions {
				padding: 6px 0;
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				backdrop-filter: blur(2px);
			}
		}
		> .hd-form {
			padding: 0;
		}
		> .actions {
			margin-top: -6px;
			display: flex;
			align-items: center;
			line-height: 1;
		}
	}
}
</style>
