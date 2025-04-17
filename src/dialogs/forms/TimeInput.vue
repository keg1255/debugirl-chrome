<template>
	<div class="forms-time-input">
		<i-input v-model="time" class="form-input" :class="{error}" @input="oninput"></i-input>
		<button v-for="(item, i) in buttons" :key="i" :class="item.class" @click="set(item)">
			{{ item.name }}
		</button>
	</div>
</template>
<script>
import {datetime} from "@/common/utils";

export default {
	name: "TimeInput",
	components: {},
	props: {
		label: String,
		value: Number,
		buttons: {
			type: Array,
			default() {
				return [
					{
						name: "归零",
						value: 0,
						class: "error",
					},
					{
						name: "今天",
						value: () => datetime().slice(0, 10),
						class: "primary",
					},
					{
						name: "此刻",
						value: () => datetime(),
						class: "success",
					},
				];
			},
		},
	},
	emits: ["input"],
	data() {
		return {
			time: this.value ? this.encode(this.value) : "", // 时间字符串
			error: false,
		};
	},
	computed: {},
	watch: {
		value(v) {
			this.time = v ? this.encode(v) : "";
		},
	},
	mounted() {},
	methods: {
		encode(t) {
			if (t === "") return "";
			if (isNaN(t) && typeof t === "string") {
				if (t.length === 10) t += " 00:00:00";
				t = new Date(t).getTime();
			}
			if (isNaN(t)) return "";
			return datetime(t).replace(" 00:00:00", "");
		},
		decode(t) {
			if (isNaN(t) && typeof t === "string") {
				if (t.length === 10) t += " 00:00:00";
				t = new Date(t).getTime();
			}
			if (isNaN(t)) return 0;
			return +t;
		},
		oninput(s) {
			let v = this.decode(s);
			let tmp = this.encode(v);
			if (s && !/^\d{5,}$/.test(s) && tmp != s) {
				this.error = true;
			} else {
				this.error = false;
				this.$emit("input", v);
			}
		},
		set(item) {
			this.time = this.encode(isNaN(item.value) ? item.value() : item.value);
			this.oninput(this.time);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.forms-time-input {
	button {
		margin-left: 6px;
	}
}
</style>
