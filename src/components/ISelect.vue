<template>
	<div v-click-outside="close" class="i-select">
		<div class="label" @click="show = true">
			<span>{{ val.label }}</span> <i-svg name="right" :rotate="90"></i-svg>
		</div>
		<ul v-show="show">
			<li v-for="(item, i) in options" :key="i" :title="item.title" @click="oninput(item)">
				<slot v-if="$slots.default" :item="item" :index="index"></slot>
				<template v-else>{{ item.label }}</template>
			</li>
		</ul>
	</div>
</template>
<script>
export default {
	name: "ISelect",
	components: {},
	props: {
		value: {},
		modelValue: {},
		options: {
			type: Array,
			default: function () {
				return [];
			},
		},
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {
			show: false,
		};
	},
	computed: {
		val() {
			let value = this.value == null ? this.modelValue : this.value;
			for (let val of this.options) {
				if (val.value == value) {
					return val;
				}
			}
			return this.options[0];
		},
	},
	mounted() {},
	methods: {
		oninput(item) {
			this.$emit("input", item.value);
			this.$emit("update:modelValue", item.value);
			this.close();
		},
		close() {
			this.show = false;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-select {
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	position: relative;
	background-color: #fff;
	> .label {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		> .i-svg:last-child {
			margin-left: 8px;
			width: 1em;
			height: 1em;
		}
	}
	> ul {
		.depth(2);
		position: absolute;
		background-color: #fff;
		z-index: 10;
		top: 100%;
		left: 0;
		max-height: 50vh;
		.scroll-y;
		> li {
			.magic-bg-link(@primary);
			white-space: nowrap;
			padding: 6px 12px;
		}
	}
	&.top {
		> ul {
			border-top: none;
			top: auto;
			bottom: 100%;
		}
	}
}
</style>
