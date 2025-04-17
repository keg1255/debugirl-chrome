<template>
	<hd-dialog-center>
		<div class="dialogs-message" :class="{normal: !icon}">
			<div v-if="icon" class="icon">
				<i-img v-if="/\.(png|jpe?g|webp)$/.test(icon)" :style="sizeStyle" :src="icon"></i-img>
				<i-svg v-else :style="sizeStyle" :name="icon" img></i-svg>
			</div>
			<div v-if="title" class="title">{{ title }}</div>
			<div v-if="msg" class="content">{{ msg }}</div>
			<div v-if="value != null" class="input">
				<input v-model="v" type="text" />
			</div>
			<div class="btns" :class="{single: btns.length < 2}">
				<button
					v-for="(item, i) in btns"
					:key="i"
					:class="
						(btns.length > 1 && i < 1 ? 'failure' : 'success') + (i == idx ? ' selected' : '')
					"
					@click="close(v == null ? i : i ? v : null)"
				>
					{{ item }}
				</button>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import {inputSelect} from "@/common/utils";

const props = defineProps({
	icon: String,
	name: String,
	msg: String,
	title: String,
	timeout: Number, // 超时秒数
	value: String,
	idx: {
		default: 1,
		type: Number,
	},
	btns: {
		type: Array,
		default: () => ["取消", "确定"],
	},
	size: Number,
});

const emit = defineEmits(["close"]);

const v = ref(props.value);
const t = ref(0);

const restTime = computed(() => {
	if (!props.timeout) return "";
	return `(${props.timeout - t.value}s)`;
});

const sizeStyle = computed(() => {
	let size = props.size;
	if (!size) return;
	return {
		width: size + "px",
		height: size + "px",
	};
});

onMounted(() => {
	if (props.timeout) {
		let h = setInterval(() => {
			t.value++;
			if (t.value >= props.timeout) {
				clearInterval(h);
				emit("close");
			}
		}, 1e3);
	}
	var input = document.querySelector("input");
	if (input) {
		inputSelect(input, /^[^]+(?=\.\w+$)/);
		input.focus();
	}
});

const close = (v) => {
	emit("close", v);
};
</script>
<style lang="less">
@import "~@/styles/define.less";

.dialogs-message {
	padding: 12px 42px 65px 42px;
	border-radius: 20px;
	width: 432px;
	background-color: #d9d9d9;
	background-size: 100% 100%;
	font-family: Microsoft YaHei;
	.icon {
		text-align: center;
		> .i-img,
		> .i-svg {
			width: 164px;
			height: 164px;
		}
		+ .title {
			margin-top: 0;
		}
	}
	&.normal {
		background: #ffffff;
		border-radius: 10px;
		padding: 21px;
		> .title {
			font-size: 17px;
			color: #0e1b2e;
			font-weight: bold;
			line-height: 1;
			margin: 0;
			margin-bottom: 21px;
		}
		> .content {
			font-size: 15px;
			font-weight: 400;
			color: #0e1b2e;
			line-height: 1.7;
			margin-bottom: 21px;
		}
		> .btns {
			flex-direction: row;
			> button {
				width: 1px;
				flex: 1;
				border-radius: 4px;
				border: none;
				line-height: 1;
				background: #edf0f4;
				font-size: 15px;
				font-weight: 400;
				color: #000000;
				box-shadow: none;
				&:hover {
					color: #1c77ff;
				}
				&:active {
					color: #0053cf;
				}
				&.selected {
					background: #1c77ff;
					color: #fff;
					&:hover {
						background: #5498ff;
					}
					&:active {
						background: #0063f6;
					}
				}
				+ button {
					margin-left: 21px;
				}
			}
		}
	}
	.title {
		font-size: 28px;
		font-weight: 600;
		margin-bottom: 8px;
		margin-top: 65px;
		text-align: center;
	}
	.content {
		font-size: 15px;
		color: #55587d;
		margin-bottom: 27px;
		white-space: pre-wrap;
		max-height: 60vh;
		text-align: left;
		user-select: text;
		.scroll-y;
	}
	input {
		width: 100%;
		border-bottom: 1px solid #e2e8f0;
		padding: 6px 0;
		margin-bottom: 27px;
	}
	.btns {
		display: flex;
		justify-content: space-between;
		flex-direction: row-reverse;
		> button {
			max-width: 155px;
			height: 51px;
			border-radius: 8px;
			font-size: 16px;
			line-height: 1;
			border: 1px solid #bfd1e0;
			color: @primary;
			.background-color3(#eef6fe, #eaf1fd, #e4edfc);
		}
		> .selected {
			.primary-btn;
		}
		&.single {
			justify-content: center;
			> button {
				width: 288px;
			}
		}
	}

	@media screen and (max-width: @mobile-width) {
		padding: 30px;
		width: 276px;
		.icon {
			> .i-img,
			> .i-svg {
				width: 120px;
				height: 120px;
			}
		}
		.title {
			font-size: 18px;
			margin-top: 13px;
			margin-bottom: 5px;
		}
		.content {
			font-size: 12px;
			margin-bottom: 26px;
		}
		.btns {
			flex-direction: column-reverse;
			> button {
				width: 215px;
				height: 44px;
				line-height: 44px;
				border-radius: 10px;
				font-size: 16px;
				&:nth-child(2) {
					margin-bottom: 15px;
				}
			}
			&.single {
				justify-content: center;
				> button {
					width: 215px;
				}
			}
		}
	}
}
</style>
