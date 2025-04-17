<template>
	<div class="i-tree">
		<i-branch :data="data"></i-branch>
	</div>
</template>
<script>
import {makeDFS, svg2dataurl} from "@/common/utils";
import IBranch from "./IBranch";
export default {
	name: "ITree",
	components: {
		IBranch,
	},
	provide() {
		return {
			"i-tree-root": this,
			"i-tree-value": this.value_,
			"i-tree-input": this.input,
			"i-tree-loadicon": this.loadicon,
			"i-tree-tricon": this.tricon,
		};
	},
	props: {
		value: {type: Array}, // 选中目标的ID
		data: {type: Array, required: true}, // 节点树数据
		childKey: {type: String, default: "children"}, // 孩子在data中的key
		childCnt: {type: String, default: "child_cnt"}, // 孩子的数量
		childId: {type: String, default: "id"}, // 节点的唯一标识
		multiple: {type: Boolean}, // 是否允许选中多个
		draggable: {type: [Boolean, Function]}, // 是否允许拖动
		droppable: {type: [Number, Function]}, // drop方式: 0x1-可以拖动到上方 0x2-可以拖动到本身 0x4-可以拖动到下方, droppable(node): number
		droppopen: {type: Number}, // drop over时展开子节点延时
		contentToggle: {type: Boolean}, // 点击内容触发展开/隐藏子节点
		getChildren: {type: Function}, // 传入父节点,获取子节点, 动态加载时需要
		getParent: {
			type: Function,
			default(id) {
				let vm = this.nMap[id];
				if (!vm) return 0;
				return vm.$parent?.$parent?.data?.[this.childKey] || 0;
			},
		}, // 传入子节点id,获取父节点id, reveal时需要
		autoOpen: {type: Boolean}, // 是否自动展开所有节点
		loadicon: {
			// 加载中图标
			type: String,
			default: svg2dataurl(
				`<path d="M626.34496 121.8304c0 53.15072-43.07968 96.2304-96.2304 96.2304-53.1456 0-96.2304-43.07968-96.2304-96.2304C433.88928 68.67968 476.96896 25.6 530.11456 25.6c53.1456 0 96.2304 43.0848 96.2304 96.2304zM530.11456 833.9968c-46.50496 0-84.1984 37.69856-84.1984 84.1984s37.69856 84.1984 84.1984 84.1984 84.1984-37.69856 84.1984-84.1984-37.69344-84.1984-84.1984-84.1984z m398.18752-253.83936c-33.21856 0-60.14464-26.92096-60.14464-60.14464 0-33.21856 26.92608-60.14464 60.14464-60.14464 33.22368 0 60.14464 26.92608 60.14464 60.14464-0.00512 33.21856-26.9312 60.14464-60.14464 60.14464zM228.15744 520.0128c0-53.1456-43.07968-96.2304-96.2304-96.2304-53.1456 0-96.2304 43.07968-96.2304 96.2304 0 53.1456 43.07968 96.2304 96.2304 96.2304 53.15072 0 96.2304-43.0848 96.2304-96.2304z m88.448-349.59872c37.5808 37.5808 37.5808 98.5088 0 136.08448-37.5808 37.5808-98.5088 37.5808-136.0896 0s-37.5808-98.5088 0-136.0896 98.5088-37.5808 136.0896 0.00512z m444.03712 580.12672c-28.1856 28.1856-28.1856 73.8816-0.00512 102.0672 28.1856 28.1856 73.8816 28.1856 102.0672 0 28.1856-28.1856 28.1856-73.8816 0-102.0672-28.18048-28.19072-73.87648-28.19072-102.06208 0z m85.05856-478.06464c-18.7904 18.7904-49.25952 18.7904-68.03968 0-18.79552-18.79552-18.79552-49.25952 0-68.0448a48.09728 48.09728 0 0 1 68.03968 0c18.7904 18.7904 18.7904 49.25952 0 68.0448zM316.60544 733.52704c-37.5808-37.5808-98.5088-37.5808-136.0896 0s-37.5808 98.5088 0 136.08448c37.5808 37.5808 98.5088 37.5808 136.08448 0 37.5808-37.57568 37.5808-98.50368 0.00512-136.08448z" fill="#272536"></path>`,
				{width: 1024, height: 1024}
			),
		},
		tricon: {
			// 展开图标
			type: String,
			default: svg2dataurl(
				`<path d="M209.205104 703.69902c-9.572398 0-12.391722-6.018064-6.263914-13.371542L500.701725 332.935742c6.127809-7.354502 16.15355-7.354502 22.281359 0l297.760535 357.391736c6.127809 7.354502 3.308484 13.371542-6.263914 13.371542L209.205104 703.69902z"></path>`,
				{width: 1024, height: 1024}
			),
		},
	},
	emits: ["input", "drag", "drop", "click", "toggle", "change"],
	data() {
		return {
			value_: this.value ? [] : null,
		};
	},
	computed: {
		root() {
			return this;
		},
		pmap() {
			const dfs = makeDFS(this.childKey);
			let map = {};
			dfs(this.data, (item, parent) => {
				map[item[this.childId]] = parent;
			});
			return map;
		},
	},
	watch: {
		value() {
			if (this.value_ === this.value) return;
			this.value_.length = 0;
			this.value_.push.apply(this.value_, this.value);
		},
	},
	created() {
		this.nMap = {}; // id -> branch vm
		this.scrollTop = 0; // 滚动目标
	},
	mounted() {
		window.tree = this;
	},
	methods: {
		drag(data) {
			// 拖动开始
			this.i_drag = data;
			this.$emit("drag", data);
		},
		drop(type, parent, data, i) {
			// 拖动结束
			if (type == "bottom") {
				i++;
			}
			this.$emit("drop", {from: this.i_drag, to: data, parent, type, i});
		},
		dropMode(data) {
			if (!this.droppable) return false;
			if (typeof this.droppable === "function") return this.droppable(data, this.i_drag);
			return this.droppable;
		},
		add(id, nodes) {
			if (nodes instanceof Array) {
				const data = this.nMap[id];
				if (data) {
					data[this.root.childKey] = nodes;
					return true;
				}
			}
			return false;
		},
		toggleChecked(id) {
			const vm = this.nMap[id];
			if (vm) vm.toggleChecked();
		},
		toggle(id) {
			const vm = this.nMap[id];
			if (vm) vm.toggle(true);
		},
		open(id) {
			const vm = this.nMap[id];
			if (vm) {
				if (!vm.open) vm.toggle(true);
			}
		},
		close(id) {
			const vm = this.nMap[id];
			if (vm) {
				if (vm.open) vm.toggle(true);
			}
		},
		openAll(id) {
			for (const k in this.nMap) {
				const vm = this.nMap[k];
				if (!vm.open) vm.toggle(true);
			}
		},
		closeAll(id) {
			for (const k in this.nMap) {
				const vm = this.nMap[k];
				if (vm.open) vm.toggle(true);
			}
		},
		_smoothScroll(p, y, smooth) {
			if (!smooth) return Promise.resolve((p.scrollTop = y));
			if (y != null)
				this.scrollTop = Math.floor(Math.max(Math.min(p.scrollHeight - p.clientHeight, y), 0));
			if (smooth === true) return Promise.resolve(p.scroll({top: y, behavior: "smooth"}));
			return new Promise((resolve, reject) => {
				function scroll() {
					const d = (this.scrollTop - p.scrollTop) / 10;
					if (Math.abs(d) < 1) return resolve();
					p.scrollTop += d;
					setTimeout(() => scroll(p, smooth), smooth);
				}
				scroll();
			});
		},
		_reveal(el, smooth) {
			const rect = el.getBoundingClientRect();
			let p = this.$el;
			while (p && p.scrollHeight <= p.clientHeight) p = p.parentElement;
			if (!p) return;
			const prect = p.getBoundingClientRect();
			let y = rect.y - prect.y + p.scrollTop;
			const c = (p.clientHeight - el.clientHeight) / 2;
			if (c > 0) y -= c;
			return this._smoothScroll(p, y, smooth);
		},
		reveal(id, smooth, highlight, ignore) {
			highlight = arguments.length < 3 ? 1e3 : highlight;
			let pms = Promise.resolve(this.getParent(id));
			pms = pms.then((pid) => {
				if (pid) return this.reveal(pid, smooth, false, true);
			});
			pms = pms.then(() => {
				const vm = this.nMap[id];
				let pms = Promise.resolve();
				if (vm) {
					if (!vm.open) {
						pms = vm.toggle(true);
					}
					return pms
						.then(() => {
							if (highlight) {
								vm.i_highlight = true;
								setTimeout(() => {
									vm.i_highlight = false;
								}, highlight);
							}
						})
						.then(() => this.$nextTick())
						.then(() => this.$nextTick())
						.then(() => ignore || this._reveal(vm.$el, smooth));
				}
			});
			return pms;
		},
		input(value) {
			this.$emit("input", value);
		},
		remove(id) {
			let p = this.pmap[id];
			if (p) {
				if (p[this.childKey])
					p[this.childKey] = p[this.childKey].filter((x) => x[this.childId] != id);
			} else if (Array.isArray(this.data)) {
				let idx = this.data.findIndex((x) => x[this.childId] == id);
				if (idx >= 0) this.data.splice(idx, 1);
			}
		},
	},
};
</script>
