<template>
	<hd-dialog-center>
		<div class="form-box" :class="mode">
			<div v-if="title" class="form-title">{{ title }}</div>
			<i-markdown v-if="desc" :value="desc"></i-markdown>
			<hd-form
				:body="body"
				:params="params"
				:label-position="labelPosition"
				:style="css"
				auto-focus
			></hd-form>
			<div class="actions" :class="{reverse: reverseButton}">
				<button class="success" @click="doSubmit">{{ buttons[0] }}</button>
				<button v-if="buttons[1]" class="failure" @click="$emit('close')">
					{{ buttons[1] }}
				</button>
				<button v-if="copyable" class="success" @click="copy">复制</button>
				<button v-if="copyable" class="success" @click="paste">粘贴</button>
				<button
					v-for="(item, i) in actions"
					:key="i"
					:class="item.class"
					:style="item.style"
					@click="item.handler(body)"
				>
					{{ item.name }}
				</button>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script>
import {copy, paste} from "@/common/utils";
export default {
	name: "DialogForm",
	components: {},
	props: {
		title: String,
		desc: String,
		params: {type: [Object, Array], required: true},
		submit: {type: Function, required: true},
		labelPosition: {type: String, default: "left"}, // label 位置: left, top
		copyable: Boolean, // 复制表单json内容
		default: Object,
		mode: String, // 模式: fullscreen
		css: {},
		buttons: {
			type: Array,
			default() {
				return ["确定", "取消"];
			},
		},
		actions: {
			type: Array,
			default() {
				return [];
			},
		},
		reverseButton: Boolean,
	},
	emits: ["close"],
	data() {
		return {
			body: {...this.default},
			scrollable: false,
		};
	},
	computed: {},
	mounted() {},
	methods: {
		doSubmit() {
			let body = Object.assign({}, this.body);
			return Promise.resolve()
				.then(() => this.submit(body))
				.then(
					(x) => this.$emit("close", x),
					(e) => {
						if (typeof e === "string") e && this.$toast.error(e);
						else console.error(e);
					}
				);
		},
		copy() {
			copy(JSON.stringify(this.body, null, 2));
			this.$toast.success("复制成功");
		},
		async paste() {
			let text = await paste();
			// eslint-disable-next-line no-eval
			let body = eval(`(${text})`);
			for (let k in body) {
				this.body[k] = body[k];
			}
			console.log(JSON.stringify(this.body, null, 2));
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.form-box {
	.depth;
	background-color: #fff;
	max-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	border-radius: 8px;
	min-width: 386px;
	&.fullscreen {
		width: 100vw;
		height: 100vh;
		max-width: 1200px;
		border-radius: 0;
	}
	> .hd-form {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	> .form-title {
		text-align: center;
		padding: 12px;
		font-size: 16px;
		font-weight: bold;
		color: #0e1b2e;
	}
	> .i-markdown {
		padding: 0 12px 12px;
	}
	.actions {
		padding: 6px 12px;
		display: flex;
		flex-direction: row-reverse;
		justify-content: flex-start;
		width: 100%;
		&.reverse {
			flex-direction: row;
			justify-content: flex-end;
		}
		button {
			.background3(#fff, #f5f5f5);
			height: 32px;
			padding: 0 12px;
		}
		.success {
			.color3(@primary);
		}
		.failure {
			.color3(@info);
		}
	}
}
</style>
