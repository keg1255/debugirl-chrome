import {getPointByEvent, moveIt} from "@/common/utils";

/** @type {VueMixin} */
export const sliderMixin = {
	props: {
		min: {type: Number, default: 0},
		max: {type: Number, default: 100},
		step: {type: Number, default: 1},
		color: {type: String, default: "#0D9BFF"},
		bg: {type: String, default: "#DBDBDB"},
		value: Number,
		modelValue: Number,
	},
	emits: ["input", "update:modelValue", "change", "click", "preview"],
	data() {
		return {
			active: false,
			hover: false,
		};
	},
	computed: {
		val() {
			return this.value == null ? this.modelValue : this.value;
		},
		num() {
			return (this.max - this.min) / this.step;
		},
		percent() {
			return ((this.val - this.min) / (this.max - this.min)) * 100 || 0;
		},
		fix() {
			return (this.step.toString().split(".")[1] || "").length;
		},
	},
	methods: {
		click(e, isMoving) {
			this.$emit("click", e);
			let value = this.getValue(e);
			if (this.val != value) {
				this.$emit("input", value);
				this.$emit("update:modelValue", value);
			}
			if (!isMoving) this.$emit("change", value);
		},
		getValue(e) {
			let point = getPointByEvent(e);
			let line = this.getLine ? this.getLine() : this.$el;
			var rect = line.getBoundingClientRect();
			var percent = this.vertical
				? 1 - (point.y - rect.y) / rect.height
				: (point.x - rect.x) / rect.width;
			var value;
			if (percent > 1) value = this.max;
			else if (percent < 0) value = this.min;
			else value = this.min + Math.round(percent * this.num) * this.step;
			value = +value.toFixed(this.fix);
			return value;
		},
		mousemove(e) {
			if (this.active) return;
			this.$emit("preview", this.getValue(e), e);
		},
		mousedown(e) {
			e.preventDefault();
			this.active = true;
			this.hover = true;
			moveIt(e, {
				onchange: (d, e) => {
					this.click(e, true);
				},
				onend: (d, e) => {
					this.active = false;
					this.hover = false;
					this.click(e);
				},
			});
		},
		mouseenter() {
			this.hover = true;
		},
		mouseleave() {
			this.hover = false;
		},
	},
};
