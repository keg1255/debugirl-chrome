<template>
	<component :is="virtual ? 'IScroll' : 'div'" class="i-table" @scroll="onScroll">
		<table>
			<thead>
				<tr>
					<th
						v-for="(head, i) in headers2"
						:key="i"
						:width="head.width"
						:title="head.title"
						:class="'head-' + head.key"
						@click="clickHead(head)"
					>
						{{ head.name
						}}<span v-if="head.sortable" class="caret-wrapper">
							<i
								class="sort-caret ascending"
								:class="{
									active: sort1.sortBy == head.key && sort1.desc == 0,
								}"
								@click.stop="clickSort(head, 0)"
							></i>
							<i
								class="sort-caret descending"
								:class="{
									active: sort1.sortBy == head.key && sort1.desc == 1,
								}"
								@click.stop="clickSort(head, 1)"
							></i>
						</span>
					</th>
					<th v-if="$slots.tools" class="head--tools">
						<span>操作</span>
						<i-svg
							v-if="hideheaders"
							name="setting"
							:class="{active: hideheaders.length}"
							@click="setting"
						></i-svg>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, i) in list" :key="i" @click="$emit('click', item)">
					<td
						v-for="(head, j) in headers2"
						:key="j"
						:class="'body-' + head.key"
						@click="$emit('clickItem', {head, item})"
					>
						<slot
							v-if="$slots[head.is || head.key]"
							:name="head.is || head.key"
							:k="head.key"
							:v="head.encode ? head.encode(item) : item[head.key]"
							:item="item"
							:header="head"
							:index="i"
						></slot>
						<span v-else>{{ head.encode ? head.encode(item) : item[head.key] }}</span>
					</td>
					<td v-if="$slots.tools" class="i-table__tools">
						<slot name="tools" :item="item"></slot>
					</td>
				</tr>
			</tbody>
		</table>
	</component>
</template>
<script>
import IScroll from "@/components/IScroll.vue";
import {showForm} from "~/dialogs";

export default {
	name: "ITable",
	components: {
		IScroll,
	},
	props: {
		headers: {required: true},
		data: {type: Array, required: true},
		sortFn: {type: Function},
		sort: {type: Object},
		virtual: {type: Boolean}, // 虚拟列表
		hideheaders: {type: Array},
	},
	emits: ["click", "clickItem", "clickHead", "update:hideheaders", "update:sort"],
	data() {
		return {
			sort0: {
				sortBy: "",
				desc: 0,
			},
			virtualStart: 0, // 虚拟列表开始索引
			virtualEnd: 100, // 虚拟列表结束索引
			virtualHeight: 0, // 虚拟一列高度
			virtualHeader: 0, // i-table顶部的高度
		};
	},
	computed: {
		headclickable() {
			return this._.vnode.props.onClickHead;
		},
		headers1() {
			if (Array.isArray(this.headers)) return this.headers;
			if (!this.headers) {
				if (this.data.length)
					return Object.keys(this.data[0]).map((key) => ({
						key,
						name: key,
					}));
				return [];
			}
			let list = [];
			for (let k in this.headers) {
				let v = this.headers[k];
				list.push({
					key: k,
					name: v.lbl || k,
					type: v.type,
					sortable: /int|float|double/.test(v.type),
				});
			}
			return list;
		},
		headers2() {
			let set = new Set(this.hideheaders);
			return this.headers1.filter((x) => !set.has(x.key));
		},
		sort1() {
			return this.sort || this.sort0;
		},
		list() {
			let sort = this.sort1;
			let data = this.data;
			if (sort.sortBy) {
				let key = sort.sortBy;
				data = this.data.concat();
				let fn;
				if (typeof this.sortFn === "function") fn = this.sortFn(sort);
				if (!fn) {
					let head = this.headers1.find((v) => v.key == key);
					if (head && typeof head.sortable === "function") {
						fn = sort.desc ? (a, b) => head.sortable(b, a) : head.sortable;
					}
				}
				if (!fn) {
					if (data[0] && !isNaN(data[0][key]))
						fn = sort.desc ? (a, b) => b[key] - a[key] : (a, b) => a[key] - b[key];
					else
						fn = sort.desc
							? (a, b) => b[key].localeCompare(a[key])
							: (a, b) => a[key].localeCompare(b[key]);
				}
				data.sort(fn);
			}
			if (this.virtual) {
				data = data.slice(this.virtualStart, this.virtualEnd);
			}
			return data;
		},
	},
	watch: {
		data() {
			this.virtualHeight = 0;
			this.scrollTop = null;
			this.$nextTick(this.onScroll);
		},
	},
	mounted() {
		this.onScroll();
	},
	methods: {
		setting() {
			let options = this.headers1.map((x) => {
				return {
					label: x.name,
					value: x.key,
				};
			});
			let keys = options.map((x) => x.value);
			let set = new Set(this.hideheaders);
			showForm({
				params: {
					shows: {
						is: "Checkbox",
						lbl: "显示头部",
						options,
					},
				},
				default: {
					shows: keys.filter((x) => !set.has(x)),
				},
				submit: (body) => {
					let set = new Set(body.shows);
					let hides = keys.filter((x) => !set.has(x));
					this.$emit("update:hideheaders", hides);
				},
			});
		},
		clickHead(head) {
			if (this.headclickable) return this.$emit("clickHead", head);
			if (head.sortable) {
				let sortKey = head.key;
				let sort = this.sort ? Object.assign({}, this.sort) : this.sort0;
				if (sort.sortBy != sortKey) {
					sort.sortBy = sortKey;
					sort.desc = 0;
				} else if (sort.desc == 0) {
					sort.desc = 1;
				} else if (this.sort) {
					delete sort.sortBy;
					delete sort.desc;
				} else {
					sort.sortBy = "";
					sort.desc = 0;
				}
				this.$emit("update:sort", sort);
			}
		},
		clickSort(head, desc) {
			let sortKey = head.key;
			let sort = this.sort ? Object.assign({}, this.sort) : this.sort0;
			if (sort.sortBy == sortKey && sort.desc == desc) {
				if (this.sort) {
					delete sort.sortBy;
					delete sort.desc;
				} else {
					sort.sortBy = "";
					sort.desc = 0;
				}
			} else {
				sort.sortBy = sortKey;
				sort.desc = desc;
			}
			this.$emit("update:sort", sort);
		},
		onScroll: function (e) {
			if (!this.virtual) return;
			let el = this.$el;
			el = el.querySelector(".i-scroll__wapper") || el;
			let scrollTop = el.scrollTop;
			if (this.scrollTop == scrollTop) return;
			let height = this.virtualHeight;
			if (!height) {
				let tr = el.querySelector("tbody tr");
				if (tr) {
					let rect = tr.getBoundingClientRect();
					this.virtualHeader = rect.top - el.getBoundingClientRect().top;
					this.virtualHeight = height = rect.height;
				}
				return;
			}
			let start = Math.floor(scrollTop / height);
			let end = Math.ceil((scrollTop + el.clientHeight - this.virtualHeader) / height);
			if (start == this.virtualStart && end == this.virtualEnd) return;
			let top = start * height;
			let bottom = (this.data.length - end) * height;
			el.style.setProperty("--i-table-top", top + "px");
			el.style.setProperty("--i-table-bottom", bottom + "px");
			this.virtualStart = start;
			this.virtualEnd = end;
			this.scrollTop = el.scrollTop = scrollTop;
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-table {
	--i-table-top: 0px;
	--i-table-bottom: 0px;
	table {
		width: 100%;
		th,
		td {
			padding: 12px 6px;
			border-bottom: 1px solid #ebeef5;
			text-align: center;
		}
		th {
			.i-svg {
				width: 1.5em;
				height: 1.5em;
				transform: translateY(-2px);
			}
		}
		thead {
			tr > th {
				position: sticky;
				top: 0;
				z-index: 2;
				background-color: #fff;
				white-space: nowrap;
				cursor: default;
				&.head--tools {
					> .i-svg {
						&.active {
							color: @primary;
						}
					}
				}
			}
			.caret-wrapper {
				display: inline-block;
				height: 1em;
				width: 16px;
				position: relative;
			}
			.sort-caret {
				width: 0;
				height: 0;
				border: 5px solid transparent;
				position: absolute;
				left: 3px;
				cursor: pointer;
				&.ascending {
					border-bottom-color: #c0c4cc;
					top: -3px;
					&.active {
						border-bottom-color: #409eff;
					}
				}
				&.descending {
					border-top-color: #c0c4cc;
					bottom: -7px;
					&.active {
						border-top-color: #409eff;
					}
				}
			}
		}
		tbody {
			tr {
				transition: background-color 0.25s ease;
				&:hover {
					background-color: #f5f7fa;
				}
			}
			&::before {
				content: " ";
				height: var(--i-table-top);
				display: block;
			}
			&::after {
				content: " ";
				height: var(--i-table-bottom);
				display: block;
			}
		}
	}
}
</style>
