<template>
	<div class="hd-form" :class="{scrollable, [`lable-${labelPosition}`]: true}">
		<div v-for="(item, i) in paramList" :key="i" class="form-item" :class="'form-item-' + item.key">
			<div class="label" :style="labelStyle" :title="item.title || item.rem || item.key">
				{{ item.label }}
			</div>
			<component
				:is="item.is"
				v-if="item.is"
				class="form-input"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></component>
			<hd-color-picker-box
				v-else-if="item.type == 'color'"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></hd-color-picker-box>
			<i-toggle
				v-else-if="item.type == 'toggle'"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></i-toggle>
			<i-code
				v-else-if="item.type == 'code'"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></i-code>
			<hd-form-array
				v-else-if="item.type == 'array'"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></hd-form-array>
			<i-radios
				v-else-if="
					item.type ? item.type == 'radio' : Array.isArray(item.options) && item.options.length <= 3
				"
				class="form-input"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></i-radios>
			<i-select-input
				v-else-if="item.type ? item.type == 'select' : Array.isArray(item.options)"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></i-select-input>
			<i-input
				v-else
				class="form-input"
				v-bind="item"
				:value="get(item)"
				@input="set(item, $event)"
			></i-input>
		</div>
	</div>
</template>
<script lang="ts">
import {defineAsyncComponent} from "vue";

const dialog_forms = import.meta.glob("../dialogs/forms/*.vue", {import: "default"});
export default {
	name: "HdForm",
	components: {},
	props: {
		params: {type: [Object, Array], required: true},
		body: {type: Object, required: true},
		labelPosition: {type: String, default: "left"}, // label 位置: left, top
		autoFocus: Boolean,
	},
	data() {
		return {
			scrollable: false,
			labelStyle: "",
		};
	},
	computed: {
		paramList() {
			let list = [];
			if (Array.isArray(this.params)) list = this.params;
			else {
				for (let key in this.params) {
					let item = {...this.params[key]};
					item.rem = item.rem || "";
					if (item.is == null) {
						item.rem = item.rem.replace(/is:(\w+)/, function (m, p1) {
							item.is = p1;
							return "";
						});
					}
					item.rem = item.rem.trim();
					if (item.is == "i-url") {
						item.is = "UploadInput";
					} else if (item.is == "i-date") {
						item.is = "TimeInput";
					} else if (item.is == "i-token") {
						item.is = "TokenInput";
					} else if (item.is == "i-set") {
						item.is = "SetInput";
					} else if (item.is == "i-json" || item.type == "json") {
						item.is = "JsonInput";
					} else if (item.is == "i-toggle") {
						item.type = "toggle";
					} else if (item.is == "i-array") {
						item.is = "ArrayInput";
					}
					if (/^i-/.test(item.is)) delete item.is;
					if (item.is == null) {
						if (["create_id", "uid"].indexOf(key) > -1) {
							item.is = "UserInput";
						} else if (key.endsWith("_at")) {
							item.is = "TimeInput";
						} else if (/avatar/i.test(key)) {
							item.is = "UploadInput";
						}
					}
					if (Array.isArray(item.opts)) {
						item.options = item.opts.map((label, value) => ({label, value}));
						delete item.type;
						delete item.opts;
					}
					if (item.type == "str" && ((item.len && item.len[1]) || 128) >= 128) {
						item.type = "textarea";
					}
					if (item.def != null) {
						item.default = item.def;
						delete item.def;
					}
					item.label = item.label || item.lbl || key;
					item.placeholder = item.placeholder || item.label;
					item.key = key;
					if (item.isprops) {
						item = Object.assign(item, item.isprops);
						delete item.isprops;
					}
					delete item.lbl;
					delete item.rem;
					delete item.opts;
					delete item.enum;
					list.push(item);
				}
			}
			list.forEach((item) => {
				if (typeof item.is === "string")
					item.is = defineAsyncComponent(dialog_forms[`../dialogs/forms/${item.is}.vue`]);
			});
			return list;
		},
	},
	created() {
		this.setBody();
	},
	mounted() {
		this.onresize();
		new ResizeObserver(this.onresize).observe(this.$el);
		if (this.labelPosition == "left")
			setTimeout(() => {
				if (!this.$el.clientWidth) return;
				let labels = this.$el.querySelectorAll(".label");
				let max = 0;
				for (let label of labels) {
					max = Math.max(max, label.getBoundingClientRect().width);
				}
				max += 12;
				this.labelStyle = `width: ${max}px;min-width: ${max}px;`;
			});
		if (this.autoFocus) {
			setTimeout(() => {
				this.doAutoFocus();
			});
		}
	},
	methods: {
		doAutoFocus() {
			let param = this.paramList.find((x) => x.autofocus);
			console.log(param);
			if (!param) {
				param = this.paramList.find((x) => !this.body[x.key]);
			}
			if (!param) return;
			let k = param.key;
			let el = this.$el.querySelector(`.form-item-${k} input,.form-item-${k} textarea`);
			if (el) {
				el.focus();
			}
		},
		onresize() {
			let el = this.$el;
			if (!el) return;
			this.scrollable = el.getBoundingClientRect().height > window.innerHeight - 96;
		},
		setBody() {
			let body = this.body;
			for (let item of this.paramList) {
				if (body[item.key] != null) continue;
				let v = [item.value, item.default].filter((x) => x != null)[0];
				if (v != null) this.set(item, v);
			}
		},
		get(item) {
			return item.encode ? item.encode(this.body[item.key]) : this.body[item.key];
		},
		set(item, value) {
			this.body[item.key] = item.decode ? item.decode(value) : value;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-form {
	padding: 12px 20px;
	// max-height: calc(100vh - 96px);
	&.scrollable {
		.scroll-y;
	}
	> .form-item {
		width: 100%;
		margin-bottom: 12px;
		&:last-child {
			margin-bottom: 0;
		}
		> .label {
			height: 20px;
			font-size: 14px;
			font-family: Microsoft YaHei-Regular, Microsoft YaHei;
			font-weight: 400;
			color: #0e1b2e;
			line-height: 20px;
		}
	}
	&.lable-top {
		> .form-item {
			min-height: 70px;
			> .label {
				margin-bottom: 10px;
			}
			> textarea.i-input {
				height: 94px;
				padding: 10px;
			}
		}
	}
	&.lable-left {
		> .form-item {
			display: flex;
			align-items: center;
			> .label {
				text-align: left;
				.ellipsis;
			}
			> textarea.i-input {
				height: 106px;
				padding: 10px;
			}
		}
		.form-item-code {
			> .label {
				align-self: flex-start;
			}
		}
	}
	textarea,
	input {
		max-height: 400px;
		background: #f9f9fb;
		padding: 0 10px;
		border: 1px solid #e2e8f0;
	}
	.form-input {
		flex: 1;
		width: 100%;
		max-width: 80vw;
		min-height: 40px;
		border-radius: 4px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		&.padding {
			padding: 10px;
		}
		&:focus {
			border-color: @primary;
		}
		&.error {
			border-color: @error;
		}
	}
	.form-item-code {
		min-height: 500px;
		flex: 1;
		.i-code {
			border: 1px solid #e2e8f0;
		}
	}
}
</style>
