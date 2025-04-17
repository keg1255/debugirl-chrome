<template>
	<transition name="it-fade">
		<div v-show="open" class="i-modal" :class="{'v-menu__content--active': open}">
			<div class="i-modal-mask" @click="persistent || $emit('update:open', false)"></div>
			<div class="i-modal-wrapper" :style="{background, padding}">
				<slot></slot>
			</div>
		</div>
	</transition>
</template>
<script>
import {pushIndex} from "@/common/utils";
export default {
	props: {
		open: {},
		autofocus: Boolean,
		padding: String,
		background: String,
		persistent: Boolean,
	},
	watch: {
		open() {
			this.onOpen();
		},
	},
	mounted() {
		this.onOpen();
	},
	methods: {
		onOpen() {
			if (this.open) {
				this.$nextTick(() => {
					pushIndex(this.$el);
					if (this.autofocus) {
						var input = this.$el.querySelector("input");
						input && input.focus();
					}
				});
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-modal.v-menu__content--active {
	pointer-events: auto;
}
.i-modal {
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	position: absolute;
	z-index: 200;
	overflow: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.6);
}
.i-modal-mask {
	background-color: transparent;
	z-index: 10;
	opacity: 0;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 0;
}
.i-modal-wrapper {
	position: relative;
	z-index: 100;
	width: auto;
	display: flex;
	flex-direction: column;
	overflow: auto;
	max-width: 100%;
	max-height: 100%;
}
</style>
