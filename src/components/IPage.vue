<template>
	<div class="i-page">
		<template v-for="(item, i) in nums" :key="i">
			<a
				:class="{
					active: val == item.value,
					disabled: item.disabled,
					[item.slotName]: item.slotName,
				}"
				:href="item.href"
				@click.prevent="onClick(item)"
			>
				<template v-if="item.slotName">
					<slot v-if="$slots[item.slotName]" :name="item.slotName"></slot>
					<i-svg
						v-else
						:src="({hover}) => (hover ? item.iconHover : item.iconName)"
						:rotate="item.rotate"
					></i-svg>
				</template>
				<span v-else>{{ item.label }}</span>
			</a>
		</template>
		<span
			v-if="jumpEnable"
			v-show="max > count - 2"
			class="i-page__jump"
			:title="`${pageSize}/${max}`"
		>
			跳转到<input value="" class="jumpPg" @change="jumpTo" @keypress.enter="jumpTo" />页
		</span>
	</div>
</template>
<script>
import {svg2dataurl} from "@/common/utils";
const ICON_SIZE = {width: 32, height: 32, w: 30, h: 30};
export default {
	name: "IPage",
	props: {
		total: {type: Number, required: true}, // 总共多少条数据
		value: {type: Number}, // 当前页码
		modelValue: {type: Number}, // 当前页码
		pageSize: {type: Number, default: 10}, // 每页多少条数据
		count: {type: Number, default: 7}, // 最多显示多少个数字(包含…)
		jumpEnable: Boolean, // 是否显示跳转页码
		makeHelf: [Function, Boolean], // 生成helf的函数, 如: (page) => ({query: {page}})
		nextIcon: {
			type: String,
			default: svg2dataurl(
				`<path d="M14.4604 20.4592L13.5411 19.54L17.0815 15.9996L13.5411 12.4592L14.4604 11.54L18.92 15.9996L14.4604 20.4592Z" fill="currentColor"/>`,
				ICON_SIZE
			),
		},
		moreIcon: {
			type: String,
			default: svg2dataurl(
				`<path d="M11 17C10.4478 17 10 16.5523 10 16C10 15.4477 10.4478 15 11 15C11.5522 15 12 15.4477 12 16C12 16.5523 11.5522 17 11 17Z" fill="currentColor"/>
<path d="M15 16C15 16.5523 15.4478 17 16 17C16.5522 17 17 16.5523 17 16C17 15.4477 16.5522 15 16 15C15.4478 15 15 15.4477 15 16Z" fill="currentColor"/>
<path d="M20 16C20 16.5523 20.4478 17 21 17C21.5522 17 22 16.5523 22 16C22 15.4477 21.5522 15 21 15C20.4478 15 20 15.4477 20 16Z" fill="currentColor"/>`,
				ICON_SIZE
			),
		},
		moreHover: {
			type: String,
			default: svg2dataurl(
				`<path d="m11.90722,20.4592l-0.9193,-0.9192l3.5404,-3.5404l-3.5404,-3.5404l0.9193,-0.9192l4.4596,4.4596l-4.4596,4.4596z" fill="currentColor"/>
<path d="m17.01358,20.4592l-0.9193,-0.9192l3.5404,-3.5404l-3.5404,-3.5404l0.9193,-0.9192l4.4596,4.4596l-4.4596,4.4596z" fill="currentColor"/>`,
				ICON_SIZE
			),
		},
	},
	emits: ["input", "update:modelValue"],
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
		min() {
			return 1;
		},
		max() {
			// 最大页码
			return Math.floor((this.total - 1) / this.pageSize) + 1;
		},
		nums() {
			var children = [];
			var page = this.val;
			children.push(page);
			var b = page - 1;
			var e = page + 1;
			var n = Math.min(this.count - 2, this.max);
			var m = 10000;
			while (children.length < n && m--) {
				if (b > this.min) children.unshift(b--);
				if (children.length >= n) break;
				if (e < this.max) children.push(e++);
			}
			if (!m) console.log("error");
			if (b == this.min) children.unshift(b);
			else if (b > this.min) {
				children.unshift({rotate: 180, value: Math.max(Math.floor((this.min + b) / 2), this.min)});
				children.unshift(this.min);
			}
			if (e == this.max) children.push(e);
			else if (e < this.max) {
				children.push({value: Math.min(Math.floor((this.max + e) / 2), this.max)});
				children.push(this.max);
			}
			// 上一页
			children.unshift({
				iconName: this.nextIcon,
				rotate: 180,
				value: page - 1,
				disabled: page <= this.min,
				slotName: "prev",
			});
			// 下一页
			children.push({
				iconName: this.nextIcon,
				value: page + 1,
				disabled: page >= this.max,
				slotName: "next",
			});
			children = children.map((item) => {
				if (typeof item === "number") item = {value: item, label: item};
				else if (!item.iconName) {
					item.iconName = this.moreIcon;
					item.iconHover = this.moreHover;
					item.slotName = "more";
				}
				if (typeof this.makeHelf == "function")
					item.href = this.$router.resolve(this.makeHelf(item.value)).href;
				else item.href = this.$router.resolve({query: {page: item.value}}).href;
				return item;
			});
			return children;
		},
	},
	methods: {
		onClick(item) {
			let page = item.value;
			if (typeof this.makeHelf == "function")
				return this.$router.replace(this.makeHelf(item.value));
			if (this.makeHelf) return this.$router.replace({query: {page: item.value}});
			if (page < this.min || page > this.max) return;
			this.$emit("input", page);
			this.$emit("update:modelValue", page);
		},
		jumpTo(e) {
			var jumpPg = e.target.value.trim();
			if (!jumpPg) return;
			setTimeout(function () {
				e.target.value = "";
			}, 500);
			if (!/^[0-9]+$/.test(jumpPg)) return this.$toast.error("您输入的页码格式有错误");
			jumpPg = parseInt(jumpPg);
			if (jumpPg < this.min || jumpPg > this.max) return this.$toast.error("您输入的页码超出范围");
			if (jumpPg == this.val) return this.$toast.error("当前页码：" + (jumpPg + 1));
			this.onClick({value: jumpPg});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-page {
	text-align: center;
	font-size: 14px;
	user-select: none;
	.flex-center;

	> .i-svg,
	> a {
		cursor: pointer;
		line-height: 1;
		margin: 0 4px;
		min-width: 30px;
		height: 30px;
		white-space: nowrap;
		border-radius: 2px;
		background: #f4f4f5;
		.flex-center;
		&:hover {
			color: @primary;
		}
		&.active {
			background: @primary;
			color: #fff;
		}
		&.disabled {
			color: unset;
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
	input.jumpPg {
		width: 3rem;
		outline: none;
		border: none;
		border-bottom: 1px solid #555;
		text-align: center;
	}
	.i-page__jump {
		margin-left: 4px;
	}
}
</style>
