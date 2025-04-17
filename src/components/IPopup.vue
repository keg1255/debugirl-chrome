<template>
	<transition name="it-fade">
		<div v-show="open" class="i-popup" @contextmenu.prevent>
			<slot></slot>
		</div>
	</transition>
</template>
<script>
import {debounce, isParent, pushIndex} from "@/common/utils";
// 常常用作右键菜单和弹出菜单
export default {
	name: "IPopup",
	components: {},
	props: {
		open: {}, // boolean|点击事件对象
		pos: String, // bottom|top|left_bottom|left_top
		center: Boolean,
		closeContent: Boolean, // 点击内容也关闭
		aim: {}, // 目标元素, 默认显示在open点击事件位置, 传字符串"parent": 相对于父元素显示, 传dom元素: 相对于该元素显示
		fullWidth: Boolean,
	},
	emits: ["update:open"],
	data() {
		return {
			rect: {},
			parentWidth: 0,
		};
	},
	computed: {},
	watch: {
		open(v) {
			this.set(v);
			if (v) {
				this.zIndex = pushIndex(this.$el);
				this.$nextTick(() => {
					this.parentWidth = this.$el.parentNode.clientWidth;
				});
			}
		},
	},
	mounted() {
		document.addEventListener("keydown", this.onkeydown, true);
		document.addEventListener("mousedown", this.onmousedown, true);
		document.addEventListener("mousewheel", this.onmousewheel);
	},
	beforeUnmount() {
		clearTimeout(this.timer);
		document.removeEventListener("keydown", this.onkeydown, true);
		document.removeEventListener("mousedown", this.onmousedown, true);
		document.removeEventListener("mousewheel", this.onmousewheel);
	},
	methods: {
		onkeydown(e) {
			if (e.key === "Escape") this.close();
		},
		onmousedown(e) {
			if (!this.open) return;
			if (this.closeContent || !isParent(e.target, this.$el)) {
				this.close_at = Date.now();
				this.close();
			}
		},
		onmousewheel(e) {
			if (this.reset) this.reset();
		},
		close() {
			if (this.open) this.$emit("update:open", false);
		},
		getStyle(fixRect) {
			var rect = this.rect;
			var style = "z-index:" + this.zIndex + ";";
			if (!this.open) style += "display:none;";
			if (this.fullWidth) {
				style += `min-width:${this.parentWidth}px;`;
			}
			for (var k in rect) {
				var v = rect[k] - fixRect[k];
				if (v) style += `${k}:${v}px;`;
			}
			return style;
		},
		_reset(r) {
			if (r) this.rect = r;
			r = this.rect;
			let el = this.$el;
			let rect = el.getBoundingClientRect();
			const padding = 10;
			if (!isNaN(r.top)) {
				if (r.top < padding) r.top = padding;
				if (r.top + rect.height - window.innerHeight > padding) {
					r.top = window.innerHeight - rect.height;
				}
			}
			if (!isNaN(r.left)) {
				if (r.left < padding) r.left = padding;
				if (r.left + rect.width - window.innerWidth > padding) {
					r.left = window.innerWidth - rect.width;
				}
			}
			if (!isNaN(r.bottom)) {
				if (r.bottom < padding) r.bottom = padding;
				if (r.bottom + rect.height - window.innerHeight > padding) {
					r.bottom = window.innerHeight - rect.height;
				}
			}
			if (!isNaN(r.right)) {
				if (r.right < padding) r.right = padding;
				if (r.right + rect.width - window.innerWidth > padding) {
					r.right = window.innerWidth - rect.width;
				}
			}
			el.setAttribute("style", "left:0;top:0;bottom:0;right:0;transform:none;");
			// 修复fixed父元素transform导致的定位问题
			rect = el.getBoundingClientRect();
			let fixRect = {
				top: rect.top,
				left: rect.left,
				bottom: window.innerHeight - rect.bottom,
				right: window.innerWidth - rect.right,
			};
			el.setAttribute("style", this.getStyle(fixRect));
			rect = el.getBoundingClientRect();
			if (rect.width * rect.height < 1 && this.open) {
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					this._reset(r);
				}, 300);
			}
		},
		_horizontal(rect) {
			if (this.center) {
				this.rect.left = rect.left + (rect.width - this.$el.clientWidth) / 2;
			} else if (rect.left > window.innerWidth / 2) {
				this.rect.right = window.innerWidth - rect.right;
			} else {
				this.rect.left = rect.left;
			}
			this._reset();
		},
		/**
		 * @param {Element} el
		 */
		pos_bottom(el) {
			var rect = el.getBoundingClientRect();
			this.rect = {top: rect.top + rect.height};
			this._horizontal(rect);
		},
		/**
		 * @param {Element} el
		 */
		pos_top(el) {
			var rect = el.getBoundingClientRect();
			this.rect = {bottom: window.innerHeight - rect.top};
			this._horizontal(rect);
		},
		/**
		 * @param {Element} el
		 */
		pos_left_bottom(el) {
			var rect = el.getBoundingClientRect();
			this.rect = {top: rect.top, right: window.innerWidth - rect.left};
			this._reset();
		},
		/**
		 * @param {Element} el
		 */
		pos_left_top(el) {
			var rect = el.getBoundingClientRect();
			this.rect = {bottom: window.innerHeight - rect.bottom, right: window.innerWidth - rect.left};
			this._reset();
		},
		set(e) {
			if (!e) return;
			this.$nextTick(() => {
				var target = this.aim == "parent" ? this.$el.parentNode : this.aim;
				if (!target && typeof e === "object") target = e;
				this.reset = null;
				if (target) {
					var x = e.clientX || e.x || 0;
					var y = e.clientY || e.y || 0;
					if (typeof target.getBoundingClientRect === "function") {
						let pos = this.pos;
						if (!pos) pos = window.event?.clientY > window.innerHeight / 2 ? "top" : "bottom";
						this["pos_" + pos.replace(/-/g, "_")](target);
						this.reset = debounce(() => this["pos_" + pos.replace(/-/g, "_")](target), 300);
						return;
					}
					var w = this.$el.clientWidth;
					if (this.center) x -= w / 2;
					this._reset({left: x, top: y});
				}
			});
		},
	},
};
</script>
<style lang="less">
@import "../styles/define.less";
.i-popup {
	position: fixed;
	background: #fff;
	box-shadow: 0 0.3rem 0.6rem 0 rgba(199, 199, 199, 0.6);
	border-radius: 1px;
	> ul {
		padding: 0;
		margin: 0;
		list-style: none;
	}
	> ul > li,
	> li {
		list-style: none;
		font-size: 12px;
		padding: 0 1em;
		word-break: keep-all;
		cursor: pointer;
		text-align: center;
		border-bottom: 1px solid @divider;
	}
}
</style>
