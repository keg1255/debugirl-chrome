<template>
	<div ref="root" class="i-resize">
		<slot></slot>
		<div class="i-resize__line top" @mousedown="startResize($event, {x: 0, y: -1})"></div>
		<div class="i-resize__line bottom" @mousedown="startResize($event, {x: 0, y: 1})"></div>
		<div class="i-resize__line left" @mousedown="startResize($event, {x: -1, y: 0})"></div>
		<div class="i-resize__line right" @mousedown="startResize($event, {x: 1, y: 0})"></div>
		<div class="i-resize__point top-left" @mousedown="startResize($event, {x: -1, y: -1})"></div>
		<div class="i-resize__point top-right" @mousedown="startResize($event, {x: 1, y: -1})"></div>
		<div class="i-resize__point bottom-left" @mousedown="startResize($event, {x: -1, y: 1})"></div>
		<div class="i-resize__point bottom-right" @mousedown="startResize($event, {x: 1, y: 1})"></div>
	</div>
</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {moveIt} from "~/common/utils";

const root = ref<HTMLElement>();

// Methods to start resizing
const startResize = (e: MouseEvent, direction: {x: number; y: number}) => {
	let el = root.value.firstElementChild as HTMLElement;
	let r = el.getBoundingClientRect();
	moveIt(e, {
		onchange(delta, e) {
			r.width += delta.x * direction.x;
			r.height += delta.y * direction.y;
			el.style.width = r.width + "px";
			el.style.height = r.height + "px";
			el.style.maxWidth = "unset";
			el.style.maxHeight = "unset";
		},
	});
};

// Lifecycle
onMounted(() => {});
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-resize {
	position: relative;
	max-width: 100vw;
	max-height: 100vh;
	> :first-child {
		max-width: 100%;
		max-height: 100%;
	}
}

.i-resize__line,
.i-resize__point {
	position: absolute;
	user-select: none;
}

.i-resize__line {
	&.top {
		width: 100%;
		height: 2px;
		top: 0;
		left: 0;
		cursor: ns-resize;
	}

	&.bottom {
		width: 100%;
		height: 2px;
		bottom: 0;
		left: 0;
		cursor: ns-resize;
	}

	&.left {
		width: 2px;
		height: 100%;
		top: 0;
		left: 0;
		cursor: ew-resize;
	}

	&.right {
		width: 2px;
		height: 100%;
		top: 0;
		right: 0;
		cursor: ew-resize;
	}
}

.i-resize__point {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	cursor: pointer;
}

.i-resize__point.top-left {
	top: 0;
	left: 0;
	cursor: nwse-resize;
}
.i-resize__point.top-right {
	top: 0;
	right: 0;
	cursor: nesw-resize;
}
.i-resize__point.bottom-left {
	bottom: 0;
	left: 0;
	cursor: nesw-resize;
}
.i-resize__point.bottom-right {
	bottom: 0;
	right: 0;
	cursor: nwse-resize;
}
</style>
