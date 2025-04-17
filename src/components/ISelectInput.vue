<template>
	<div class="i-select-input">
		<!-- <template v-if="multiple">
			<div v-for="(item, i) in labels" :key="i" class="__item">
				<span>{{ item }}</span>
				<i-svg class="remove" name="close" @click="remove(item)"></i-svg>
			</div>
		</template> -->
		<div class="__inputbox">
			<i-input
				v-model="keyword"
				:title="show_value"
				:placeholder="placeholder"
				@v-input="onInput"
				@v-keydown="onKeydown"
				@focus="onFocus"
				@change="onChange"
			></i-input>
			<i-popup full-width pos="bottom" aim="parent" :open="show">
				<ul>
					<li
						v-for="(item, i) in list1"
						:key="i"
						:class="{
							selected: i + 1 == idx,
							active: isActive(item),
						}"
						@click="onClick(item)"
					>
						{{ (item && item.label) || item }}
					</li>
				</ul>
			</i-popup>
		</div>
	</div>
</template>
<script>
import {debounce, distinct} from "@/common/utils";

export default {
	name: "ISelectInput",
	components: {},
	props: {
		value: {},
		modelValue: {},
		multiple: Boolean, // 多选
		fixedOrder: Boolean, // 固定顺序
		placeholder: String,
		options: {}, // 选项列表 Array | function
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {
			list0: [],
			show: false,
			keyword: "",
			idx: 0,
		};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
		values() {
			return Array.from(
				new Set((this.val == null ? "" : this.val + "").split(",").filter((x) => x))
			);
		},
		labels() {
			let values0 = this.values.concat();
			if (!this.fixedOrder) {
				return values0;
			}
			let list = [];
			this.list0.forEach((x) => {
				x = x && x.label ? x.value : x;
				let idx = values0.indexOf(x);
				if (idx >= 0) {
					list.push(x);
					values0.splice(idx, 1);
				}
			});
			return list.concat(values0);
		},
		show_value() {
			if (this.multiple) return this.labels.join(",");
			return this.getLabel(this.val);
		},
		keyword1() {
			return this.keyword.split(",").pop().trim();
		},
		list1() {
			let list = this.list0;
			try {
				if (this.keyword1 && this.keyword != this.show_value) {
					let reg = new RegExp(this.keyword1, "i");
					list = this.list0.filter((x) => reg.test((x && x.label) || x));
				}
			} catch (error) {}
			if (!list.length) list = this.list0;
			return list;
		},
	},
	watch: {
		options: {
			handler(v) {
				this.list0 = Array.isArray(v) ? v : [];
			},
			immediate: true,
		},
		show_value(v) {
			this.keyword = v == null ? "" : v + "";
		},
	},
	mounted() {
		this.keyword = this.show_value || "";
		document.addEventListener("mousedown", this.onmousedown);
	},
	beforeUnmount() {
		document.removeEventListener("mousedown", this.onmousedown);
	},
	methods: {
		onmousedown(e) {
			let input = this.$el.querySelector("input");
			let __inputbox = this.$el.querySelector(".__inputbox");
			if (input == e.target) this.open();
			else if (__inputbox && __inputbox.contains(e.target));
			else this.setShow(false);
		},
		open() {
			if (typeof this.options === "function") {
				Promise.resolve()
					.then(() => this.options())
					.then((res) => {
						this.list0 = res;
						this.setShow(true);
					});
			} else {
				this.setShow(true);
			}
		},
		doFocus(e) {
			let input = this.$el.querySelector("input");
			if (input) {
				input.selectionStart = input.selectionEnd = input.value.length;
				input.scrollLeft = input.scrollWidth;
			}
		},
		setShow: function (e) {
			if (this.show == e) return;
			this.show = e;
		},
		onFocus(e) {
			if (!e.isTrusted) return;
			if (this.stop_focus > Date.now()) return;
			this.open();
		},
		onBlur() {
			this.setShow(false);
		},
		onInput(e) {
			this.keyword = e.target.value;
			this.idx = 0;
			this.setShow(true);
		},
		getLabel(value) {
			for (let item of this.list0) {
				if (item && item.value == value) return item.label;
			}
			return value;
		},
		onChange: debounce(function (value) {
			if (this.stop_change > Date.now()) return;
			if (this.multiple) {
				let labels = this.keyword.split(",");
				let values = labels.map((x) => {
					for (let item of this.list0) {
						if (item && item.label && item.label == x) {
							return item.value;
						}
					}
					return x;
				});
				this.emitInput(values.join(","));
				return;
			}
			for (let item of this.list0) {
				if (item && item.label && item.label == value) {
					value = item.value;
					break;
				}
			}
			this.emitInput(value);
		}),
		onKeydown(e) {
			switch (e.keyCode) {
				case 13: // enter
					if (this.idx) this.onClick(this.list1[this.idx - 1]);
					else if (this.multiple) {
						this.onChange(this.keyword);
						this.$nextTick(() => this.doFocus());
					} else this.onClick(this.keyword);
					e.preventDefault();
					break;
				case 38: // up
					this.idx = Math.max(0, this.idx - 1);
					e.preventDefault();
					break;
				case 40: // down
					this.idx = Math.min(this.list1.length, this.idx + 1);
					e.preventDefault();
					break;
				case 9: // tab
					setTimeout(() => {
						let input = this.$el.querySelector("input");
						if (document.activeElement != input) this.setShow(false);
					});
					break;
				case 27: // esc
					this.setShow(false);
					break;
			}
		},
		onClick(item) {
			if (this.stop_click > Date.now()) return;
			// this.stop_click = Date.now() + 500;
			this.stop_change = Date.now() + 500;
			let value = item && item.label ? item.value : item;
			if (this.multiple) {
				value = value == null ? "" : value + "";
				if (this.values.includes(value)) {
					this.emitInput(this.values.filter((x) => x != value).join(","));
				} else {
					this.emitInput(this.values.concat([value]).join(","));
				}
				this.keyword = "";
				this.$nextTick(() => this.doFocus());
				return;
			}
			this.stop_focus = Date.now() + 500;
			this.emitInput(value);
			this.keyword = this.getLabel(value);
			if (!this.multiple) this.setShow(false);
		},
		isActive(item) {
			let value = item && item.label ? item.value : item;
			if (this.multiple) {
				return this.values.includes(value == null ? "" : value + "");
			}
			return value == this.value;
		},
		remove(item) {
			this.onClick(item);
		},
		emitInput(value) {
			// console.trace(value);
			if (this.multiple) value = distinct(value.split(",").filter((x) => x)).join(",");
			this.$emit("input", value);
			this.$emit("update:modelValue", value);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-select-input {
	flex: 1;
	background: #f9f9fb;
	height: 40px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	> .__item {
		margin-right: 10px;
		padding: 0 0.8em;
		border-radius: 1em;
		background-color: @primary;
		height: 1.8em;
		line-height: 1.8;
		color: #fff;
		white-space: nowrap;
		position: relative;
		cursor: default;
		&:hover {
			> .remove {
				display: inline-flex;
			}
		}
		> .remove {
			width: 18px;
			height: 18px;
			position: absolute;
			right: -6px;
			top: -6px;
			cursor: pointer;
			border-radius: 50%;
			.magic-bg-btn(red);
			padding: 2px;
			display: none;
		}
	}
	> .__inputbox {
		position: relative;
		display: flex;
		align-items: center;
		height: 100%;
		flex: 1;
		input {
			width: 100%;
			height: 100%;
			padding: 0 10px;
			background: transparent;
		}
		> .i-popup {
			z-index: 1;
			> ul {
				background: #fff;
				box-shadow: 0 0.3rem 0.6rem 0 rgba(199, 199, 199, 0.6);
				border-radius: 1px;
				z-index: 1002;
				max-height: 60vh;
				.scroll-y;
				&.top {
					top: unset;
					bottom: 100%;
				}

				padding: 0;
				margin: 0;
				list-style: none;
			}
			li {
				list-style: none;
				font-size: 14px;
				margin: 0;
				padding: 0 20px;
				min-height: 34px;
				display: flex;
				align-items: center;
				word-break: keep-all;
				cursor: pointer;
				text-align: left;
				overflow: hidden;
				text-overflow: ellipsis;
				&:hover {
					background-color: #f5f7fa;
				}
				&.active {
					color: @primary;
				}
				&.selected {
					background-color: #f0f8ff;
				}
			}
		}
	}
}
</style>
