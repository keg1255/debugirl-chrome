<template>
	<div class="i-hot-input" tabindex="-1" @keydown.stop="onKeydown">{{ value }}</div>
</template>
<script>
import {getHotkey} from "@/common/utils";
export default {
	name: "IHotInput",
	components: {},
	props: {
		value: String,
	},
	data() {
		return {};
	},
	computed: {},
	mounted() {},
	methods: {
		onKeydown(e) {
			let key = getHotkey(e);
			if (/^(Delete|Backspace)$/.test(key)) {
				this.$emit("input", "");
				return;
			}
			if (!/^(Ctrl|Alt|Shift)/.test(key)) return;
			if (
				/\+(Up|Down|Left|Right|Cancel|Pause|ScrollLock|NumLock|CapsLock|Clear|Tab|Enter)$/.test(key)
			)
				return;
			if (key == "Alt+Delete") return;
			this.$emit("input", key);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-hot-input {
	outline: none;
	border: 1px solid #e2e8f0;
	&:focus {
		border-color: @primary;
	}
}
</style>
