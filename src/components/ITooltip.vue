<template>
	<transition name="it-fade">
		<div
			v-show="open"
			v-click-outside="close"
			class="i-tooltip"
			:class="'i-tooltip-' + dir"
			:style="style"
		>
			<div class="i-tooltip-triangle" :style="triangleStyle"></div>
			<slot></slot>
		</div>
	</transition>
</template>
<script>
export default {
	name: "ITooltip",
	components: {},
	props: {
		direction: String, // top bottom left right
		color: String,
		padding: {type: Number, default: 6}, // 与父元素距离
		offset: {type: Number, default: 10}, // 与窗口边距
		delay: {type: Number, default: 100}, // 延迟关闭
		size: {type: Number, default: 10}, // 小三角尺寸
		nohover: Boolean, // 不监听hover
		aim: {}, // 目标元素
	},
	data() {
		return {
			open: false,
			dir: "bottom",
			style: {},
			triangleStyle: {},
		};
	},
	computed: {},
	watch: {
		open(val) {
			if (!val) return;
			const parent = this.aim || this.$el.parentNode;
			let prect = parent.getBoundingClientRect();
			console.log(prect);
			if (this.direction) {
				this.dir = this.direction;
			} else {
				let rest = {
					top: prect.top,
					left: prect.left,
					right: window.innerWidth - prect.right,
					bottom: window.innerHeight - prect.bottom,
				};
				let score = {
					top: rest.top / window.innerHeight,
					bottom: rest.bottom / window.innerHeight,
					left: (rest.left / window.innerWidth) * 0.95,
					right: (rest.right / window.innerWidth) * 0.95,
				};
				let dir = "top";
				for (let k in score) {
					if (score[k] > score[dir]) {
						dir = k;
					}
				}
				this.dir = dir;
			}
			this.style = {
				left: 0,
				top: 0,
				transform: "none",
			};
			this.$nextTick(() => {
				this.reset(prect);
			});
		},
		aim(v) {
			this.listen();
			if (this.nohover) this.open = !!v;
		},
	},
	mounted() {
		this.listen();
	},
	beforeDestroy() {
		if (this.unlisten) this.unlisten();
	},
	methods: {
		close() {
			this.open = false;
		},
		listen() {
			if (this.unlisten) this.unlisten();
			if (this.nohover) return;
			let el = this.aim || this.$el.parentNode;
			if (!el || !el.addEventListener) return;
			el.addEventListener("mouseenter", this.onenter);
			el.addEventListener("mouseleave", this.onleave);
			this.unlisten = () => {
				el.removeEventListener("mouseenter", this.onenter);
				el.removeEventListener("mouseleave", this.onleave);
				this.unlisten = null;
			};
		},
		onenter() {
			clearTimeout(this.handle);
			this.open = true;
		},
		onleave() {
			clearTimeout(this.handle);
			this.handle = setTimeout(() => {
				this.open = false;
			}, this.delay);
		},
		reset(prect) {
			const el = this.$el;
			const WINDOW_OFFSET = this.offset;
			const PARENT_OFFSET = this.padding;
			let rect = el.getBoundingClientRect();
			let style = {
				"--size": this.size,
			};
			let triangleStyle = {};
			// 默认三角形居中、tooptip居中
			let left = prect.left + (prect.right - prect.left) / 2 - rect.width / 2;
			let right = left + rect.width;
			let top = prect.top + (prect.bottom - prect.top) / 2 - rect.height / 2;
			let bottom = top + rect.height;
			let middleX = left + prect.width / 2;
			let middleY = top + prect.height / 2;
			switch (this.dir) {
				case "top":
				case "bottom":
					// 调整三角形位置
					if (left < WINDOW_OFFSET) {
						triangleStyle.left = -left + WINDOW_OFFSET;
					} else if (right + WINDOW_OFFSET > window.innerWidth) {
						triangleStyle.left = -(right - window.innerWidth) - WINDOW_OFFSET;
					}
					if (triangleStyle.left) {
						style.left = -rect.left + middleX + triangleStyle.left - prect.width / 2;
						triangleStyle.left = -triangleStyle.left + el.clientWidth / 2;
					} else {
						style.left = -rect.left + left;
					}
					if (this.dir == "top" && window.innerHeight - prect.top + PARENT_OFFSET - rect.height < 0)
						this.dir = "bottom";
					else if (
						this.dir == "bottom" &&
						prect.bottom + PARENT_OFFSET + rect.height > window.innerHeight
					)
						this.dir = "top";
					if (this.dir == "top")
						style.bottom = -rect.top + window.innerHeight - prect.top + PARENT_OFFSET;
					else style.top = -rect.top + prect.bottom + PARENT_OFFSET;
					break;
				case "left":
				case "right":
					// 调整三角形位置
					if (top < WINDOW_OFFSET) {
						triangleStyle.top = -top + WINDOW_OFFSET;
					} else if (bottom + WINDOW_OFFSET > window.innerHeight) {
						triangleStyle.top = -(bottom - window.innerHeight) - WINDOW_OFFSET;
					}
					if (triangleStyle.top) {
						style.top = -rect.top + middleY + triangleStyle.top - prect.height / 2;
						triangleStyle.top = -triangleStyle.top + el.clientHeight / 2;
					} else {
						style.top = -rect.top + top;
					}
					if (this.dir == "left" && window.innerWidth - prect.left + PARENT_OFFSET - rect.width < 0)
						this.dir = "right";
					else if (
						this.dir == "right" &&
						prect.right + PARENT_OFFSET + rect.width > window.innerWidth
					)
						this.dir = "left";
					if (this.dir == "left")
						style.right = -rect.left + window.innerWidth - prect.left + PARENT_OFFSET;
					else style.left = -rect.left + prect.right + PARENT_OFFSET;
					break;
			}
			for (let k in triangleStyle) {
				triangleStyle[k] += "px";
			}
			for (let k in style) {
				style[k] += "px";
			}
			if (this.color) {
				style.backgroundColor = this.color;
				triangleStyle.background = `linear-gradient(225deg, ${this.color} 50%, transparent 50%)`;
			}
			this.triangleStyle = triangleStyle;
			this.style = style;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";

.i-tooltip {
	position: fixed;
	z-index: 100;
	background: @primary;
	filter: drop-shadow(0px 9px 12px rgba(7, 126, 255, 0.14));
	padding: 7px 12px;
	white-space: nowrap;
	font-size: 14px;
	color: #fff;
	border-radius: 3px;

	--size: 10px;
	--nhalfsize: calc(var(--size) / -2 + 0.5px);
	.i-tooltip-triangle {
		position: absolute;
		background: linear-gradient(225deg, @primary 50%, transparent 50%);
		width: var(--size);
		height: var(--size);
		z-index: -1;
	}
	&.i-tooltip-left {
		.i-tooltip-triangle {
			right: var(--nhalfsize);
			top: 50%;
			transform: translateY(var(--nhalfsize)) rotate(45deg);
			border-bottom: none !important;
			border-left: none !important;
		}
	}
	&.i-tooltip-right {
		.i-tooltip-triangle {
			left: var(--nhalfsize);
			top: 50%;
			transform: translateY(var(--nhalfsize)) rotate(225deg);
			border-bottom: none !important;
			border-right: none !important;
		}
	}
	&.i-tooltip-top {
		.i-tooltip-triangle {
			left: 50%;
			bottom: var(--nhalfsize);
			transform: translateX(var(--nhalfsize)) rotate(135deg);
			border-top: none !important;
			border-left: none !important;
		}
	}
	&.i-tooltip-bottom {
		.i-tooltip-triangle {
			left: 50%;
			top: var(--nhalfsize);
			transform: translateX(var(--nhalfsize)) rotate(315deg);
			border-left: none !important;
			border-bottom: none !important;
		}
	}
}
</style>
