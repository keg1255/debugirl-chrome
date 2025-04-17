<template>
	<div class="i-cascade-picker">
		<i-scroll
			v-for="(list, i) in groups"
			:key="i"
			class="i-cascade-picker__groups"
			@change="onScroll(i, $event)"
		>
			<div class="i-cascade-picker__top" :style="{height: paddingY + 'px'}"></div>
			<div
				v-for="(item, j) in list"
				:key="j"
				class="i-cascade-picker__item"
				:class="{active: item.value == value[i], disabled: item.disabled}"
				:style="{height: size + 'px'}"
				@click="onSelect(i, j)"
			>
				{{ item.label }}
			</div>
			<div class="i-cascade-picker__bottom" :style="{height: paddingY + 'px'}"></div>
		</i-scroll>
		<div class="i-cascade-picker__box" :style="{top: paddingY + 'px', height: size + 'px'}"></div>
	</div>
</template>
<script>
export default {
	name: "ICascadePicker",
	components: {},
	props: {
		groups: {type: Array, default: () => []},
		value: {type: Array, default: () => []},
		size: {type: Number, default: 32},
	},
	data() {
		return {
			height: 0,
		};
	},
	computed: {
		paddingY() {
			return (this.height - this.size) / 2;
		},
		offsetList() {
			return this.value
				.map((value, idx) => {
					let list = this.groups[idx];
					let j = list.findIndex((item) => item.value == value);
					return j * this.size;
				})
				.join(",");
		},
	},
	watch: {
		offsetList: function () {
			this.fitScroll();
		},
		groups: function () {
			this.refresh();
		},
	},
	async mounted() {
		this.height = this.$el.clientHeight;
		this.$el.addEventListener("resize", this.onresize);
		this.refresh();
	},
	beforeUnmount() {
		this.$el.removeEventListener("resize", this.onresize);
	},
	methods: {
		onresize() {
			this.height = this.$el.clientHeight;
			this.$nextTick(() => {
				this.fitScroll();
			});
		},
		findIndex(i, j) {
			let list = this.groups[i];
			if (j < 0 || list[j].disabled) {
				if (j < 0) {
					// 如果当前值不存在，则设置为第一个可用选项
					return Math.min(
						0,
						list.findIndex((x) => !x.disabled)
					);
				}
				// 如果当前值存在，但是被禁用了，则设置为最近的一个可用选项
				let n = Math.max(list.length - j, j);
				for (let k = 1; k < n; k++) {
					if (list[j + k] && !list[j + k].disabled) {
						return j + k;
					}
					if (list[j - k] && !list[j - k].disabled) {
						return j - k;
					}
				}
			}
			return -1;
		},
		refresh() {
			let changed = false;
			let valueList = this.value;
			for (let idx = 0; idx < this.groups.length; idx++) {
				let list = this.groups[idx];
				if (!list || !list.length) break;
				let i = list.findIndex((x) => valueList[idx] == x.value);
				i = this.findIndex(idx, i);
				if (i >= 0) {
					valueList.splice(idx, 1, list[i].value);
					changed = true;
				}
			}
			if (changed) {
				this.$emit("input", valueList);
			}
		},
		fitScroll() {
			return this.offsetList.split(",").forEach((x, i) => {
				let scroll = this.$children[i];
				if (scroll && !isNaN(x)) scroll.setY(+x, "smooth");
			});
		},
		doInput(idx, item) {
			let value = item.value;
			if (this.value[idx] == value) return;
			this.value.splice(idx, 1, value);
			this.$emit("input", this.value);
			return true;
		},
		onSelect(i, j) {
			let t = this.findIndex(i, j);
			if (t >= 0) j = t;
			if (this.doInput(i, this.groups[i][j]) || t >= 0) {
				let scroll = this.$children[i];
				scroll.setY(j * this.size, "smooth");
			}
		},
		onScroll(i, e) {
			let j = Math.round(e.y / this.size);
			let t = this.findIndex(i, j);
			if (t >= 0) j = t;
			if (this.doInput(i, this.groups[i][j]) || t >= 0) {
				let scroll = this.$children[i];
				scroll.setY(j * this.size, "smooth");
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-cascade-picker {
	max-height: 180px;
	display: flex;
	user-select: none;
	position: relative;
	.i-cascade-picker__groups {
		text-align: center;
		flex: 1;
	}
	.i-cascade-picker__item {
		.flex-center;
		cursor: pointer;
		&:hover {
			background-color: rgba(0, 0, 0, 0.03);
		}
		&.active {
			font-weight: bold;
		}
		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
	.i-cascade-picker__box {
		position: absolute;
		left: 0;
		right: 0;
		border: 1px solid #e4e7ed;
		border-left: 0;
		border-right: 0;
		pointer-events: none;
	}
}
</style>
