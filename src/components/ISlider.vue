<template>
	<div class="i-slider" :class="{vertical}" @click="click" @mousemove="mousemove">
		<div class="i-slider__line" :style="lineStyle" :class="{active}">
			<div
				class="controller"
				:class="{active}"
				:style="circleStyle"
				@mousedown="mousedown"
				@touchstart="mousedown"
				@mouseenter="mouseenter"
				@mouseleave="mouseleave"
			>
				<div v-if="showtip" v-show="hover" class="showtip">{{ value }}</div>
				<slot :value="value"></slot>
			</div>
		</div>
	</div>
</template>
<script>
import {sliderMixin} from "./mixins";
export default {
	name: "ISlider",
	components: {},
	mixins: [sliderMixin],
	props: {
		vertical: Boolean, // 竖直
		showtip: Boolean, // 显示提示
	},
	data() {
		return {};
	},
	computed: {
		lineStyle() {
			return {
				background: `${this.bg} linear-gradient(${this.color},${this.color}) no-repeat`,
				backgroundPosition: this.vertical ? `0% 100%` : `0% 0%`,
				backgroundSize: this.vertical ? `100% ${this.percent}%` : `${this.percent}% 100%`,
			};
		},
		circleStyle() {
			return {
				background: this.percent ? this.color : "#dbdbdb",
				borderColor: this.percent ? this.color : this.bg,
				[this.vertical ? "bottom" : "left"]: this.percent + "%",
			};
		},
	},
	mounted() {},
	methods: {
		getLine() {
			return this.$el.firstChild;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
@line: 2px; // 线宽度
@circle: 10px; // controller 直径
@circle-border: 1px; // 圆边宽
@circle-size: @circle+ @circle-border*2;
@half: (@line - @circle - @circle-border)/2;
.i-slider {
	user-select: none;
	flex: 1;
	padding-top: 0;
	padding-bottom: 0;
	padding-left: (@circle-size * 0.5);
	padding-right: (@circle-size * 0.5);
	height: @circle-size;
	max-height: @circle-size;
	cursor: pointer;
	.tooltip {
		position: absolute;
		bottom: 120%;
		left: 50%;
		transform: translateX(-50%);
		padding: 4px 6px;
		border-radius: 4px;
		background: #000;
		color: #fff;
		font-size: 12px;
		line-height: 1;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.3s;
	}
	&:hover {
		.tooltip {
			opacity: 1;
		}
	}
	> .i-slider__line {
		height: @line;
		border-radius: @line;
		position: relative;
		transform: translateY((@circle-size - @line) * 0.5);
		transition: background-size 0.3s;
		&.active {
			transition: none;
		}
		> .controller {
			position: absolute;
			width: @circle;
			height: @circle;
			border: @circle-border solid #ccc;
			border-radius: @circle;
			top: @line - (@circle-size * 0.5);
			transform: translateX(@half);
			transition: all 0.3s;
			&.active {
				transform: translateX(@half) scale(1.3);
				transition:
					transform,
					background-color,
					border-color 0.5s;
			}
			> .showtip {
				position: absolute;
				bottom: 100%;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}
	&.vertical {
		padding-left: 0;
		padding-right: 0;
		padding-top: (@circle-size * 0.5);
		padding-bottom: (@circle-size * 0.5);
		width: unset;
		height: unset;
		max-height: unset;
		text-align: center;
		box-sizing: border-box;
		> .i-slider__line {
			height: 100%;
			width: @line;
			transform: none;
			display: inline-block;
			> .controller {
				top: unset;
				left: @line - (@circle-size * 0.5);
				transform: translateY(-(@half));
				&.active {
					transform: translateY(-(@half)) scale(1.3);
				}
			}
		}
	}
}
</style>
