<template>
	<div class="hd-dialog-center" @wheel.self.prevent>
		<i-resize class="hd-dialog-center-content">
			<i-svg
				v-if="clickable"
				class="close-btn"
				name="close"
				:style="iconStyle"
				@click="$emit('close')"
			></i-svg>
			<slot></slot>
		</i-resize>
	</div>
</template>
<script>
export default {
	name: "DialogCenter",
	components: {},
	props: {
		iconStyle: {},
		esc: Boolean,
	},
	emits: ["close"],
	data() {
		return {};
	},
	computed: {
		clickable() {
			return this._.vnode.props.onClose;
		},
	},
	watch: {
		esc(v) {
			if (v) {
				document.addEventListener("keydown", this.onkeypress);
			} else {
				document.removeEventListener("keydown", this.onkeypress);
			}
		},
	},
	mounted() {
		window.t = this;
		document.addEventListener("keydown", this.onkeypress);
	},
	beforeUnmount() {
		document.removeEventListener("keydown", this.onkeypress);
	},
	methods: {
		onkeypress(e) {
			// ESC
			if (e.keyCode == 27) {
				this.$emit("close");
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-dialog-center {
	.fixed-full;
	.flex-center;
	background: rgba(0, 0, 0, 0.4);
	.close-btn {
		position: absolute;
		top: 10px;
		right: 10px;
		z-index: 1;
		-webkit-app-region: no-drag;
		&:hover {
			color: #fa5e5e;
		}
		&:active {
			color: #ec1e1e;
		}
	}
	.hd-dialog-center-content {
		border-radius: 10px;
		display: flex;
		position: relative;
	}
	.actions {
		padding: 6px 12px;
		display: flex;
		justify-content: flex-end;
		border-top: 1px solid #e2e8f0;
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
