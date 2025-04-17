<template>
	<ul v-if="isArr" class="i-tree-branch">
		<i-branch
			v-for="(child, i) in data"
			:key="data_id || 'idx' + i"
			:idx="i"
			:data="child"
			:draggable="draggable"
		></i-branch>
	</ul>
	<li v-else :class="{open}">
		<div
			class="i-tree-line"
			:class="cls"
			:draggable="draggable"
			@click="click($event)"
			@dragstart="drag"
			@dragover.prevent="drop"
			@dragleave="drop($event, 1)"
			@drop="drop($event, 2)"
		>
			<i-svg
				class="i-tree-icon"
				:loading="i_loading"
				:src="i_loading ? root.loadicon : root.tricon"
			>
			</i-svg>
			<node-content :node="data" :vm="self"></node-content>
		</div>
		<keep-alive>
			<i-branch
				v-if="open && hasChild"
				:data="data[root.childKey]"
				:draggable="draggable"
			></i-branch>
		</keep-alive>
	</li>
</template>
<script>
export default {
	name: "IBranch",
	components: {
		NodeContent: {
			props: {
				node: {required: true},
				vm: {required: true},
			},
			render(h) {
				const root = this.$parent.root;
				const node = this.node;
				const vm = this.vm;
				return root.$slots.default
					? root.$slots.default({node, vm})
					: h("span", {class: "i-tree-node-title"}, node.title);
			},
		},
	},
	inject: {
		root: {from: "i-tree-root"},
		value: {from: "i-tree-value"},
		input: {from: "i-tree-input"},
		parent: {
			from: "i-tree-parent",
			default() {
				return this;
			},
		},
	},
	provide() {
		return {
			"i-tree-parent": this,
		};
	},
	props: {
		data: {type: [Array, Object], required: true},
		idx: {type: Number},
	},
	data() {
		return {
			i_pos: 0,
			i_loaded: false,
			i_open: this.root.autoOpen,
			i_dragenter: 0,
			i_loading: false,
			i_highlight: false,
		};
	},
	computed: {
		self() {
			if (this.isArr) return this.parent;
			return this.data;
		},
		draggable() {
			if (typeof this.root.draggable === "function") return !!this.root.draggable(this.data);
			return !!this.root.draggable;
		},
		isArr() {
			return this.data instanceof Array;
		},
		hasChild() {
			return this.data[this.root.childKey] && this.data[this.root.childKey].length;
		},
		showIcon() {
			if (this.root.childCnt && this.root.getChildren && !this.i_loaded && !this.i_loading)
				return this.data[this.root.childCnt];
			return this.hasChild;
		},
		active() {
			return this.value && this.value.includes(this.data_id);
		},
		cls() {
			const cls = {};
			if (this.i_dragenter) {
				cls.top = this.i_pos == 1;
				cls.middle = this.i_pos == 2;
				cls.bottom = this.i_pos == 3;
			}
			cls.highlight = this.i_highlight;
			cls.active = this.active;
			cls.loading = this.i_loading;
			cls.showIcon = this.showIcon;
			return cls;
		},
		open() {
			if (!this.data || this.data.open == null) return this.i_open;
			return this.data.open;
		},
		data_id() {
			if (this.isArr) return 0;
			return this.data[this.root.childId];
		},
	},
	watch: {
		data_id: {
			immediate: true,
			handler(val, oldVal) {
				if (oldVal && this.root.nMap[oldVal] == this) delete this.root.nMap[oldVal];
				if (!this.data_id) return;
				this.$nextTick(function () {
					if (this.root.nMap[this.data_id]) console.error(`<i-tree>重复的data_id:${this.data_id}`);
					this.root.nMap[this.data_id] = this;
				});
			},
		},
		data() {
			if (!this.isArr) {
				this.i_loaded = false;
				this.i_open = this.root.autoOpen;
			}
		},
	},
	beforeUnmount() {
		if (!this.data_id) return;
		delete this.root.nMap[this.data_id];
	},
	methods: {
		click(e) {
			const clickIcon = e.target.className.indexOf("i-tree-icon") >= 0;
			if (!clickIcon) {
				this.root.$emit("click", this.data);
				this.$nextTick(this.toggleChecked);
				if (!this.root.contentToggle) return; // 不允许点击内容展开
			}
			return this.toggle(clickIcon);
		},
		_toggle(force) {
			if (!force && this.i_open && this.value && !this.active) return;
			this.i_open = !this.i_open;
			this.root.$emit("toggle", this.data, this.i_open);
		},
		toggle(force) {
			if (this.hasChild) {
				this._toggle(force);
			} else if (this.showIcon) {
				this.i_loading = true;
				return Promise.resolve(this.root.getChildren(this.data)).then(
					() => {
						this.i_loaded = true;
						this.i_loading = false;
						if (this.showIcon) this._toggle(force);
					},
					() => {
						this.i_loading = false;
					}
				);
			}
			return Promise.resolve();
		},
		toggleChecked() {
			if (!this.value) return;
			if (this.active) {
				if (this.root.multiple) this.value.splice(this.value.indexOf(this.data_id), 1);
				else this.value.splice(0, this.value.length);
			} else if (this.root.multiple || !this.value.length) this.value.push(this.data_id);
			else this.value.splice(0, this.value.length, this.data_id);
			this.input(this.value);
			this.root.$emit("change", this.value);
		},
		drag(e) {
			this.root.drag(this.data);
		},
		drop(e, step) {
			const percent = e.offsetY / e.target.offsetHeight;
			let type;
			const mode = this.root.dropMode(this.data);
			const now = +new Date();
			if (percent < 0.3 && mode & 1) {
				this.i_pos = 1;
				type = "top";
			} else if (percent <= 0.7 && mode & 2) {
				this.i_pos = 2;
				type = "center";
			} else if (mode & 4) {
				this.i_pos = 3;
				type = "bottom";
			} else {
				this.i_pos = 0;
			}
			if (step && this.i_dragenter) this.i_dragenter = 0;
			else if (!step && !this.i_dragenter) this.i_dragenter = now;
			else if (
				this.root.droppopen &&
				this.i_dragenter &&
				now - this.i_dragenter > this.root.droppopen
			) {
				this.toggle();
				this.i_dragenter = now + 10e3;
			}
			if (step == 2) {
				this.root.drop(type, this.parent, this.data, this.idx);
			}
		},
	},
};
</script>
<style lang="less">
@import "../../styles/define.less";
.i-tree-branch {
	padding-left: 0;
	li {
		list-style-type: none;
		-webkit-touch-callout: none;
		user-select: none;
		padding: 0;
	}
	li.open > .i-tree-line > i {
		transform: rotate(180deg);
	}
	.i-tree-line {
		align-items: center;
		display: flex;
		line-height: 1;
		border-top: 1px solid transparent;
		border-bottom: 1px solid transparent;
		padding-left: 1em;
	}
	.i-tree-line > .loading {
		color: rgba(0, 0, 0, 0.5);
		animation: loading 1.3s linear infinite;
	}
	.i-tree-line > .i-tree-icon {
		margin-right: 0.1em;
		min-width: 14px;
		width: 14px;
		height: 14px;
	}
	.i-tree-line.showIcon > .i-tree-icon {
		opacity: 1;
	}
	.i-tree-line.top {
		border-top-color: rgba(18, 113, 255, 0.5) !important;
	}
	.i-tree-line.middle {
		background-color: rgba(18, 113, 255, 0.5) !important;
		color: black !important;
	}
	.i-tree-line.bottom {
		border-bottom-color: rgba(18, 113, 255, 0.5) !important;
	}
	.i-tree-branch {
		padding-left: 1.125rem;
	}
	.i-tree-icon {
		opacity: 0;
		width: 1em;
		color: rgba(0, 0, 0, 0.5);
		cursor: pointer;
	}
	li > .i-tree-line > .i-tree-icon {
		transition: transform 300ms;
		transform: rotate(90deg);
	}
	li.open > .i-tree-line > .i-tree-icon {
		transition: transform 300ms;
		transform: rotate(180deg);
	}
}
</style>
