<template>
	<img
		v-if="img"
		class="i-svg"
		:class="{loading}"
		:name="name1"
		:src="`data:image/svg+xml;charset=utf8,` + html.replace(/%/g, '%25').replace(/#/g, '%23')"
		:style="style"
		@mouseenter="hover = true"
		@mouseleave="hover = false"
		@click="disabled || $emit('click', $event)"
	/>
	<div
		v-else
		class="i-svg"
		:class="{loading}"
		:name="name1"
		:style="style"
		@click="disabled || $emit('click', $event)"
		@mouseenter="hover = true"
		@mouseleave="hover = false"
		v-html="html"
	></div>
</template>
<script>
const svgs = import.meta.glob("../assets/svgs/*.svg", {import: "default", eager: true});
export default {
	name: "ISvg",
	components: {},
	props: {
		name: String, // svg文件名， assets/svgs目录下面，不包含后缀
		src: {}, // svg文件内容，可以用相对路径
		currentColor: Boolean, // 跟随字体颜色
		color: String, // 指定图标颜色（比hover优先级低）
		size: [Number, String], // 图标大小，默认单位px
		rotate: Number, // 旋转角度
		flip: Boolean, // 是否翻转
		disabled: Boolean, // 是否禁用,不触发click事件
		img: Boolean, // 是否使用img标签，默认使用div标签
		loading: Boolean, // 是否加载中旋转
	},
	emits: ["click"],
	data() {
		return {
			svg1: "",
			hover: false,
		};
	},
	computed: {
		clickable() {
			return this._.vnode.props.onClick;
		},
		name1() {
			let name = this.name;
			return name && (name.length < 16 ? name : null);
		},
		style() {
			const style = {};
			if (this.size)
				style.width = style.height = /\d$/.test(this.size) ? this.size + "px" : this.size;
			if (this.rotate) style.transform = `rotate(${this.rotate}deg)`;
			if (this.flip)
				style.transform = style.transform ? style.transform + ` scale(-1,1)` : `scale(-1,1)`;
			if (this.disabled) {
				style.opacity = 0.3;
				style.cursor = "not-allowed";
			} else if (this.clickable) style.cursor = "pointer";
			return style;
		},
		src1() {
			return typeof this.src === "function" ? this.src({hover: this.hover}) : this.src;
		},
		svg0() {
			let name = this.name;
			if (name) return svgs[`../assets/svgs/${name}.svg`];
			return this.src1 || "";
		},
		svg() {
			if (/^(http|\/)/.test(this.src1)) return this.svg1;
			if (!/^data:/.test(this.svg0)) return this.svg0;
			let idx = this.svg0.indexOf(",");
			return decodeURIComponent(this.svg0.slice(idx + 1));
		},
		svgSize() {
			let size = getSvgSize(this.svg);
			if (this.size) return size;
			return {width: this.size, height: (size.height / size.width) * this.size};
		},
		html() {
			let src = this.svg;
			if (this.color) src = this.changeColor(src, this.color);
			else if (this.currentColor) src = this.changeColor(src, "currentColor");
			return src;
		},
	},
	watch: {
		src1() {
			this.load();
		},
	},
	mounted() {
		this.load();
	},
	methods: {
		load() {
			let v = this.src1;
			if (!/^(http|\/)/.test(v)) return;
			fetch(v)
				.then((res) => res.text())
				.then((res) => (this.svg1 = res));
		},
		changeColor(svg, color) {
			return svg.replace(/<([^<>]+)>/g, (_, x) => {
				if (x[0] == "/" || x.startsWith("svg")) return _;
				return _.replace(/fill='(.*?)'/g, `fill='${color}'`).replace(
					/stroke='(.*?)'/g,
					`stroke='${color}'`
				);
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-svg {
	display: inline-flex;
	vertical-align: middle;
	line-height: 1;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
	> svg {
		max-width: 100%;
		max-height: 100%;
		pointer-events: none;
	}
	&.loading {
		.loading;
	}
}
</style>
