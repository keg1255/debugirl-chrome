<template>
	<textarea
		v-if="type == 'textarea'"
		:value="tmp"
		:placeholder="placeholder"
		:type="type"
		:disabled="disabled"
		class="i-input"
		:class="{error}"
		:maxlength="maxlength"
		:rows="1"
		:autofocus="autofocus"
		@input="onInput"
		@change="onChange"
		@keypress="onKeypress"
		@focus="onFocus"
		@click="$emit('click', $event)"
		@blur="$emit('blur', tmp)"
		@paste="onPaste"
	></textarea>
	<input
		v-else
		:value="tmp"
		:placeholder="placeholder"
		:type="type"
		:disabled="disabled"
		class="i-input"
		:class="{error}"
		:maxlength="maxlength"
		:min="min"
		:max="max"
		:autofocus="autofocus"
		@input="onInput"
		@change="onChange"
		@keypress="onKeypress"
		@focus="onFocus"
		@click="$emit('click', $event)"
		@blur="$emit('blur', tmp)"
		@paste="onPaste"
	/>
</template>
<script>
import {readFile} from "@/common/utils";

export default {
	name: "IInput",
	components: {},
	props: {
		min: Number,
		max: Number,
		value: {},
		modelValue: {},
		type: String,
		disabled: Boolean,
		placeholder: String,
		maxlength: [Number, String],
		fn: {}, // 已废弃，请使用mask替代
		mask: {}, // 仅允许输入特定格式, # 数字 S 字母 N 数字+字母 A 大写字母 a 小写字母 X 大写字母+数字 x 小写字母+数字
		unmaskedValue: Boolean, // 不返回mask中的固定字符，如### ### ###中的空格
		reg: [String, RegExp], // 正则校验
		autoHeight: Boolean, // textarea自动高度
		enter: Boolean, // 回车键触发提交
		autofocus: Boolean, // 自动聚焦
	},
	emits: ["input", "change", "submit", "focus", "blur", "click", "paste", "update:modelValue"],
	data() {
		return {
			tmp: this.value || this.modelValue,
			error: false,
		};
	},
	computed: {},
	watch: {
		value(val) {
			val = val || "";
			this.setValue(val + "");
		},
		autoHeight(val) {
			this.setHeight();
		},
		modelValue(val) {
			val = val || "";
			this.setValue(val + "");
		},
	},
	mounted() {
		// if (this.autofocus) this.$nextTick(() => this.$el.focus());
		if (this.autoHeight) this.setHeight();
	},
	methods: {
		doMask(mask, v) {
			this.unmask = v;
			v = v + "";
			if (typeof mask === "string") {
				if (mask == "num") return v.replace(/\D/g, "");
				if (mask == "word") return v.replace(/\W/g, "");
				if (mask == "email") return v.replace(/[^\w@%\.-]/g, "");
				if (mask == "int") mask = [/-?/, /\d+/];
				else if (mask == "float") mask = [/-?/, /\d*/, /\./, /\d+/];
				else {
					let words = mask.split("");
					let list = [];
					for (let i = 0; i < words.length; i++) {
						let x = words[i];
						let y = ((x) => {
							if (x == "0") {
								let n = 1;
								while (words[i + n] == "0") n++;
								i += n - 1;
								return [/\d+/, (x) => x.replace(/^0+/, "").padStart(n, "0").slice(0, n)];
							}
							if (x == "#") return /\d/;
							if (x == "S") return /[a-zA-Z]/;
							if (x == "N") return /\w/;
							if (x == "A") return [/[a-zA-Z]/, (x) => x.toUpperCase()];
							if (x == "a") return [/[a-zA-Z]/, (x) => x.toLowerCase()];
							if (x == "X") return [/\w/, (x) => x.toUpperCase()];
							if (x == "x") return [/\w/, (x) => x.toLowerCase()];
							return x;
						})(x);
						list.push(y);
					}
					mask = list;
				}
			}
			if (Array.isArray(mask)) {
				let masked = "";
				let unmask = "";
				for (let i = 0; v && i < mask.length; i++) {
					let item = mask[i];
					if (typeof item === "string") {
						masked += item;
					} else {
						/** @type {RegExp} */
						let reg;
						let fn = (x) => x;
						if (Array.isArray(item)) {
							reg = item[0];
							fn = item[1];
						} else {
							reg = item;
						}
						let m = reg.exec(v);
						if (!m) break;
						let s = m[1] == null ? m[0] : m[1];
						let tmp = fn.apply(null, m);
						masked += tmp;
						unmask += tmp;
						v = v.slice(m.index + s.length);
					}
				}
				this.unmask = unmask;
				return masked;
			}
			if (typeof mask === "function") return mask(v);
			if (mask instanceof RegExp) return v.replace(this.fn, "");
			return v;
		},
		emitValue(type) {
			let v = this.unmaskedValue ? this.unmask : this.tmp;
			if (this.type == "number") {
				if (!v) return;
				if (v < this.min) v = this.min;
				else if (v > this.max) {
					v = this.max;
					this.tmp = v;
				}
				v = +v;
			}
			if (type == "input") this.$emit("update:modelValue", v);
			this.$emit(type, v);
		},
		setHeight() {
			let el = this.$el;
			if (this.autoHeight) {
				let s = window.getComputedStyle(el);
				let b = parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth);
				el.style.height = "auto";
				el.style.height = el.scrollHeight + b + "px";
			} else {
				el.style.height = "";
			}
		},
		onFocus(e) {
			this.setHeight();
			this.$emit("focus", e);
		},
		setValue(value, force) {
			const el = this.$el;
			if (!force && el.value == value) return;
			let v = this.doMask(this.mask || this.fn, value);
			// if (this.maxlength) v = v.slice(0, this.maxlength);
			if (
				document.activeElement == el &&
				el.value != v &&
				this.type != "date" &&
				this.type != "number"
			) {
				let start = el.selectionStart;
				let d = v.length - el.value.length;
				if (d < 0 || v.slice(0, start) == el.value.slice(0, start)) d = 0;
				el.value = v;
				el.setSelectionRange(start + d, start + d);
			}
			if (this.type == "textarea" && this.autoHeight) {
				this.setHeight();
			}
			this.tmp = v;
			this.error =
				v && this.reg && !(typeof this.reg === "string" ? new RegExp(this.reg) : this.reg).test(v);
			if (force || this.unmask != this.value) this.emitValue("input");
		},
		onInput(e) {
			this.setValue(e.target.value, true);
		},
		onChange() {
			this.emitValue("change");
		},
		onKeypress(e) {
			if (e.keyCode === 13) {
				if (this.enter) {
					if (!(e.shiftKey || e.altKey || e.ctrlKey)) {
						e.preventDefault();
						this.emitValue("submit");
					}
				} else {
					this.emitValue("submit");
				}
			}
		},
		onPaste(e) {
			if (this.type == "url") {
				let files = e.clipboardData.files;
				if (files.length == 1 && files[0].type.indexOf("image") == 0) {
					readFile(files[0], "DataURL").then((x) => {
						this.setValue(x);
					});
					return;
				}
			}
			this.$emit("paste", e);
		},
		focus() {
			this.$el.focus();
			this.$el.selectionStart = this.$el.selectionEnd = this.$el.value.length;
		},
		blur() {
			this.$el.blur();
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-input {
	resize: none;
	&.error {
		border-color: @error !important;
	}
}
</style>
