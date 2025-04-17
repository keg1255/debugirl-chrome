<template>
	<div v-if="isURL" class="admin-json tac" @click="emitClick">
		<hd-admin-url :value="str"></hd-admin-url>
		<div>{{ Array.isArray(v) ? `${v.length}张` : "" }}</div>
	</div>
	<div v-else-if="!v"></div>
	<JsonViewer
		v-else
		v-click.stop="emitClick"
		v-contextmenu.prevent="toggleFullscreen"
		class="admin-json"
		:class="{fullscreen}"
		:expand-depth="expandDepth"
		:value="v"
		copyable
	></JsonViewer>
</template>
<script>
import {defineAsyncComponent} from "vue";
import {tryJSON} from "~/common/utils";

export default {
	name: "Json",
	components: {
		JsonViewer: defineAsyncComponent(() => import("vue-json-viewer")),
	},
	props: {
		value: {},
		modelValue: {},
		expandDepth: {type: Number, default: 2},
	},
	emits: ["click"],
	data() {
		return {
			fullscreen: false,
		};
	},
	computed: {
		v() {
			let value = this.value == null ? this.modelValue : this.value;
			return tryJSON(value);
		},
		str() {
			let v = this.v;
			if (Array.isArray(v)) return v[0];
			if (typeof v === "string") return v;
			return "";
		},
		isURL() {
			return /^https?:\/\//.test(this.str);
		},
	},
	mounted() {},
	methods: {
		toggleFullscreen() {
			this.fullscreen = !this.fullscreen;
		},
		emitClick(e) {
			this.$emit("click", e);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.admin-json {
	font-size: 12px !important;
	word-break: break-all;
	max-height: 120px;
	text-align: left;
	.scroll-y;
	&.fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		max-height: unset;
	}
	&.tac {
		text-align: center;
	}
	.jv-code {
		padding: 5px !important;
	}
	.jv-tooltip.right {
		right: 0 !important;
	}
}
</style>
