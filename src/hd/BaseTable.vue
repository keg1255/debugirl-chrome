<template>
	<div class="adminpage base-table">
		<hd-menus></hd-menus>
		<div class="content">
			<div class="table-header">
				<div class="left">
					<b>{{ title || table.comment }}</b>
					<slot name="header"></slot>
				</div>
				<div class="actions">
					<i-search-input
						ref="search"
						:value="keywords"
						:placeholder="`共找到${total}条`"
						onlyclear
						@submit="onSearch"
					></i-search-input>
					<div class="tar">
						<button class="primary-plain" @click="doSearch">搜索</button>
						<button class="error-plain" title="清除筛选条件" @click="clear">清除</button>
						<span>当前({{ total }}条)</span>
						每页<input
							class="pagesize"
							type="number"
							:value="+query.pageSize || 10"
							step="10"
							@change="setPageSize"
						/>
						<slot name="actions"></slot>
						<button class="success" @click="refresh">刷新</button>
					</div>
				</div>
			</div>
			<div class="table-desc"><slot name="desc"></slot></div>
			<div class="table-content">
				<hd-table
					:headers="headers"
					:data="list1"
					:sort="query"
					:sort-fn="() => () => {}"
					:hideheaders="hideheaders1"
					@toggle="toggle"
					@update:hideheaders="setting.hideheaders = $event"
					@update:sort="onSort"
					@clickItem="clickItem"
					@clickHead="clickHead"
				>
					<template v-if="table.tools?.length || $slots['tools']" #tools="{item}">
						<div class="tools">
							<slot name="tools" :item="item"></slot>
							<template v-for="(tool, i) in table.tools" :key="i">
								<i-link v-if="tool.path" :key="i" class="primary-link" :to="makeTo(tool, item)">
									{{ tool.name }}
								</i-link>
								<button
									v-else-if="tool.url && tool.params"
									class="primary-plain"
									@click="clickTool(tool, item)"
								>
									{{ tool.name }}
								</button>
							</template>
						</div>
					</template>
				</hd-table>
			</div>
			<div v-show="total > +query.pageSize || 10" class="page">
				<i-page
					:total="total"
					:page-size="+query.pageSize || 10"
					:value="+query.page || 1"
					jump-enable
					@input="$router.push({query: {...$route.query, page: $event}})"
				></i-page>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import axios from "@/lib/axios";
import {debounce, watchLocal, decodeSearch, encodeSearch, isEmpty, copy} from "@/common/utils";
import {dlg, showForm} from "~/dialogs";
import toast from "~/lib/toast";
import {hideLoading, showLoading} from "~/stores/actions";
let cache = {};
export default {
	name: "AdminTable",
	components: {},
	props: {
		hideheaders: Array,
		apiGet: {type: Function, default: axios.apiGet},
		initSort: {type: Object}, // {sortBy: "id", desc: 1}
		beforeList: Function, // (query) => {}
		afterHeaders: Function, // (headers) => {} 表格头部
		mapList: Function, // (list) => {} 表格数据
		title: String,
	},
	emits: ["clickItem"],
	data() {
		return {
			total: 0,
			list: [],
			table: {
				fields: "",
				comment: "",
				tools: [],
				params: null,
				primary_keys: null,
			},
			local: watchLocal("tables", {
				appname: "",
				counts: {},
			}),
		};
	},
	computed: {
		list1() {
			return this.mapList ? this.list.map((x) => this.mapList(x)) : this.list;
		},
		name() {
			if (this.$route.path.length > 2) {
				let table = this.$route.path.replace(/\//g, "");
				if (table == "my-scripts") return "scripts";
				return table;
			}
			return this.$route.query.table || "usertoken";
		},
		setting() {
			return watchLocal("table." + this.name, {
				hideheaders: [],
			});
		},
		hideheaders1() {
			let list = this.setting.hideheaders;
			if (this.hideheaders) {
				list = list.concat(this.hideheaders);
			}
			return list;
		},
		headers() {
			if (this.afterHeaders) return this.afterHeaders(this.table.params);
			return this.table.params;
		},
		apiPath() {
			return "/" + this.name;
		},
		query() {
			let {_, ...query} = this.$route.query;
			return query;
		},
		queryString() {
			return Object.keys(this.query)
				.map((k) => {
					let v = this.query[k];
					if (v.indexOf(" ") >= 0) v = JSON.stringify(v);
					return k + "=" + v;
				})
				.join("");
		},
		keywords() {
			let {table, page, pageSize, sortBy, desc, keyword, ...query} = this.query;
			let s = Object.entries(query).map(([k, v]: [string, string]) => {
				v = v || "";
				if (v.indexOf(" ") >= 0) v = JSON.stringify(v);
				return k + "=" + v;
			});
			let obj = decodeSearch(s.join(" "));
			if (keyword) obj.keyword = keyword;
			return encodeSearch(obj);
		},
	},
	watch: {
		"$app.uid"(v) {
			if (v) {
				this.refresh();
			} else {
				this.list = [];
			}
		},
		queryString() {
			console.log("query", this.query);
			this.refresh();
		},
	},
	mounted() {
		this.refresh();
	},
	activated() {},
	methods: {
		clear() {
			let table = this.$route.query.table;
			this.$router.push({query: {table}});
		},
		refresh: debounce(async function () {
			if (this.table.name != this.name) {
				this.table =
					cache[this.name] || (await axios.apiGet("/sys/admin_table", {name: this.name}));
				cache[this.name] = this.table;
				this.table.name = this.name;
			}
			let query = {...this.query};
			let today = new Date().setHours(0, 0, 0, 0);
			for (let k in query) {
				let v = query[k];
				if (/[><]$/.test(k)) {
					v = v
						.replace(/today/g, today)
						.replace(/now/g, Date.now())
						.replace(/\d{4}-\d{2}-\d{2}( \d{2}(:\d{2}){1,2})/g, (s) => new Date(s).getTime());
					try {
						v = eval(`(${v})`);
					} catch (e) {}
					if (!isNaN(v)) {
						query[k] = v;
					}
				}
			}
			delete query.table;
			if (!query.sortBy) {
				let sort = this.initSort;
				if (!sort && this.table.params?.id?.type == "int") {
					sort = {sortBy: "id", desc: 1};
				}
				if (sort) Object.assign(query, sort);
			}
			console.log(query);
			let body = query;
			if (this.beforeList) body = this.beforeList(body);
			let {total, list} = await this.apiGet(this.apiPath + "/list", body);
			this.total = total;
			this.list = list;
			let counts = Object.assign({}, this.local.counts);
			let {table, page, pageSize, sortBy, desc, ...rest} = query;
			if (page > Math.ceil(total / (pageSize || 10))) {
				this.$router.replace({query: {...this.$route.query, page: 1}});
			}
			if (isEmpty(rest)) {
				counts[this.name] = total;
				this.local.counts = counts;
			}
			// this.$set(this.local.counts, this.name, total);
		}),
		getParams() {
			let params = {};
			let primary_keys = this.table.primary_keys;
			let isID = primary_keys == "id";
			// 优化输入
			for (let k in this.table.params) {
				if (isID && k == "id") continue;
				let v = {...this.table.params[k]};
				if (+v.is) {
					delete v.is;
				}
				v.need = primary_keys.indexOf(k) >= 0;
				params[k] = v;
			}
			return params;
		},
		async toggle(item, key) {
			let v = item[key] ? 0 : 1;
			let body = {id: item.id, [key]: v};
			await axios.apiPost(this.apiPath + "/set", body);
			item[key] = v;
		},
		makeTo(tool, item) {
			return tool.path.replace(/\[(\w+)\]/g, (s, k) => item[k]);
		},
		clickTool(tool, item) {
			let body = {};
			for (let k in tool.params) {
				let v = item[k];
				if (v != null) body[k] = v;
			}
			showForm({
				title: tool.title || tool.name,
				default: body,
				params: tool.params,
				submit: async (data) => {
					await axios.apiPost(tool.url, data);
					this.$toast.success("操作成功");
					this.refresh();
				},
			});
		},
		doSearch() {
			this.$refs.search.submit();
		},
		onSearch(s) {
			let {table, page, pageSize, sortBy, desc, id, keyword, ...query} = this.query;
			query = {table, page, pageSize, sortBy, desc};
			let obj = decodeSearch(s);
			Object.assign(query, obj);
			this.$router.push({query});
		},
		setPageSize(e) {
			let v = e.target.value;
			if (v > 0) {
				if (v > 5000) v = 5000;
				this.$router.push({query: {...this.$route.query, pageSize: v}});
			}
		},
		onSort(query) {
			let {sortBy, desc, ...rest} = this.$route.query;
			this.$router.push({query: {...rest, ...query}});
		},
		clickHead(head, item) {
			if (head.click) return head.click(item);
			let input = this.$el.querySelector(".i-search-input input");
			if (input) {
				let s = input.value;
				let obj = decodeSearch(s);
				let ops = ["", "~", ">", "<", "!"];
				let key = head.key;
				let op;
				let v = "";
				if (obj[key] != null) {
					op = "";
					v = obj[key] + "";
				} else
					for (let k in obj) {
						if (k.slice(0, -1) == key && ops.indexOf(k.slice(-1)) >= 0) {
							op = k.slice(-1);
							v = obj[k];
							key = k.slice(0, -1);
							break;
						}
					}
				delete obj[key + (op || "")];
				if (item) {
					v = item[key] + "";
				}
				let idx = ops.indexOf(op);
				if (idx < 0) {
					op = "";
				} else {
					op = ops[(idx + 1) % ops.length];
				}
				obj[key + op] = v;
				input.value = encodeSearch(obj);
				let event = document.createEvent("HTMLEvents");
				event.initEvent("input", true, true);
				input.dispatchEvent(event);
				input.focus();
			}
		},
		clickItem(body) {
			this.$emit("clickItem", body);
			this.clickHead(body.head, body.item);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.base-table {
	.content {
		padding: 12px 24px;
		padding-bottom: 0;
		display: flex;
		flex-direction: column;
		height: 100vh;
		.table-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		> .table-content {
			height: 1px;
			flex: 1;
			margin-top: 12px;
			.scroll;
			.i-table__tools {
				> .tools {
					display: flex;
					align-items: center;
					justify-content: center;
					flex-wrap: wrap;
					> * {
						margin: 3px;
						white-space: nowrap;
					}
				}
			}
			.jv-container .jv-button {
				z-index: 1;
			}
		}
		.actions {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			flex-wrap: wrap;
			flex: 1;
			> .tar {
				text-align: right;
				justify-self: flex-end;
				margin: 12px 0;
				> * {
					margin-left: 6px;
				}
				> .pagesize {
					margin-left: 0;
					padding-left: 6px;
					border-bottom: 1px solid #ebeef5;
					width: 50px;
				}
				> .i-menu {
					display: inline-block;
				}
			}
			.i-search-input {
				border-bottom: 1px solid #ebeef5;
				width: 230px;
				flex: 1;
			}
		}
	}
	.page {
		padding: 12px 0;
	}
	.sql-box {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.5);
		padding: 12px;
		height: 50vh;
		text-align: center;
		> .inner {
			width: 100%;
			max-width: 600px;
			margin: 0 auto;
			position: relative;
			textarea {
				width: 100%;
				height: 300px;
				padding: 12px;
				border: 1px solid #ebeef5;
				border-radius: 6px;
				background: #fff;
			}
			> .tac {
				.space-x(12px);
			}
		}
	}
}
</style>
