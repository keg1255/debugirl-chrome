<template>
	<span :title="tip" class="i-date" :class="cls" @click="onclick">{{ val }}</span>
</template>
<script>
import {format, getDayHour, watchLocal} from "@/common/utils";

export default {
	name: "IDate",
	props: {
		color: {type: Boolean}, // 显示过期颜色
		format: {type: String},
		value: {},
		def: {type: String, default: ""},
		year100: String,
	},
	data: function () {
		return {
			tick: 0,
			local: watchLocal("local.i-date", {
				mode: false,
			}),
		};
	},
	computed: {
		cls: function () {
			var cls = {};
			if (this.color) {
				if (new Date().getTime() > this.value) cls.red = true;
				else cls.green = true;
			}
			return cls;
		},
		tip: function () {
			if (this.value) {
				if (this.local.mode ^ !!this.format) return this.fromNow(this.value);
				return format(this.format || "YYYY-MM-DD hh:mm", this.value);
			}
			return "";
		},
		val: function () {
			if (this.value) {
				if (this.local.mode ^ !!this.format)
					return format(this.format || "YYYY-MM-DD hh:mm:ss", this.value);
				return this.fromNow(this.value);
			}
			return this.def;
		},
	},
	methods: {
		fromNow: function (v) {
			// eslint-disable-next-line no-unused-expressions
			app && app.tick;
			if (!v) return "未设置";
			v = +new Date(v);
			var suffix = "";
			if (this.year100 && (!v || v > 86400e3 * 365 * 100)) return this.year100;
			if (v > 86400e3 * 365) {
				v -= Date.now();
				suffix = v > 0 ? "后" : "前";
			}
			var s = getDayHour(Math.abs(v)) + suffix;
			if (s) return s;
			return "刚刚";
		},
		onclick() {
			this.local.mode = !this.local.mode;
		},
	},
};
</script>
<style lang="less">
@import "../styles/define.less";
.i-date {
	white-space: nowrap;
	&.red {
		color: red;
	}
	&.green {
		color: green;
	}
}
</style>
