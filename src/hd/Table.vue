<template>
	<i-table
		class="hd-table"
		:headers="headers1"
		:data="data"
		:sort="sort"
		:sort-fn="sortFn"
		:hideheaders="hideheaders"
		v-bind="$attrs"
	>
		<template #i-opts="{v, header}">
			<span :title="v" :style="'color:' + getColor(v)">{{ header.opts[v] }}</span>
		</template>
		<template #i-hide="{v, header}">
			<i-span :value="v" :limit="header.n || 50"></i-span>
		</template>
		<template #i-date="{v}">
			<i-date v-click.stop :value="v"></i-date>
		</template>
		<template #i-time="{v}">
			{{ getDayHour(v) }}
		</template>
		<template #i-version="{v}">
			{{ encodeVersion(v) }}
		</template>
		<template #i-size="{v}">
			{{ traffic(v) }}
		</template>
		<template #i-text="{v}">
			<span :class="v.class" :style="v.style">{{ v.text }}</span>
		</template>
		<template #i-html="{v}">
			<span :class="v.class" :style="v.style" v-html="v.text"></span>
		</template>
		<template #i-url="{v}">
			<hd-admin-url :value="v"></hd-admin-url>
		</template>
		<template #i-ip="{v}">
			<hd-admin-ip :value="v"></hd-admin-ip>
		</template>
		<template #i-set="{v, header}">
			<hd-admin-set v-if="header.props?.multiple" :value="v"></hd-admin-set>
			<span v-else>{{ v }}</span>
		</template>
		<template #i-json="{v, item, header}">
			<hd-admin-json :value="v" @click="click(item, header)"></hd-admin-json>
		</template>
		<template #i-foreign="{v, header}">
			<hd-admin-foreign :value="v" v-bind="header.props"></hd-admin-foreign>
		</template>
		<template #i-foreign-list="{v, header}">
			<hd-admin-foreign-list :value="v" v-bind="header.props"></hd-admin-foreign-list>
		</template>
		<template #i-toggle="{v, item, header}">
			<i-toggle :value="v" @input="toggle(item, header)"></i-toggle>
		</template>
		<template v-if="$slots.tools" #tools="{item}">
			<slot name="tools" :item="item"></slot>
		</template>
	</i-table>
</template>
<script>
import {copy, encodeVersion, getDayHour, limit, strHash, traffic} from "@/common/utils";

export default {
	name: "HdTable",
	components: {},
	props: {
		headers: {},
		data: Array,
		sort: {},
		sortFn: {},
		hideheaders: Array,
	},
	emits: ["toggle"],
	data() {
		return {};
	},
	computed: {
		headers1() {
			if (!this.headers) return;
			if (Array.isArray(this.headers)) return this.headers;
			let list = [];
			let params = this.headers;
			// 优化显示
			for (let k in params) {
				let v = params[k];
				let name = v.lbl || k;
				let head = {
					key: k,
					name,
					title:
						k +
						":" +
						name +
						(v.rem ? " " + v.rem : "") +
						(v.opts ? " " + v.opts.map((v, i) => i + ":" + v) : ""),
					type: v.type,
					sortable: /int|float|double/.test(v.type),
					...v,
				};
				if (+v.is) {
					head.is = "i-hide";
					head.n = +v.is;
				} else if (v.is == "i-token") {
					head.is = "i-hide";
					head.n = 10;
				} else if (v.is) {
					head.is = v.is;
					if (v.isprops) head.props = v.isprops;
				} else if (v.opts) {
					head.is = "i-opts";
					head.opts = v.opts;
				} else if (v.type == "json") {
					head.is = "i-json";
				} else if (/avatar|_url$/i.test(k)) {
					head.is = "i-url";
				} else if (/_at$/.test(k)) {
					head.is = "i-date";
				} else if (/_time|_delay$/.test(k)) {
					head.is = "i-time";
				} else if (/_ip$/.test(k) || k == "ip") {
					head.is = "i-foreign";
					head.props = {table: "ipinfos"};
				} else if (["create_id", "uid"].indexOf(k) >= 0) {
					head.is = "i-foreign";
					head.props = {table: "users"};
				} else if (["openid"].indexOf(k) >= 0) {
					head.is = "i-foreign";
					head.props = {table: "web_weixin_user"};
				} else if (["token", "openid"].indexOf(k) >= 0) {
					head.is = "i-hide";
					head.n = 6;
				}
				list.push(head);
			}
			return list;
		},
	},
	mounted() {},
	methods: {
		getColor(idx) {
			if (typeof idx === "string") idx = strHash(idx);
			return ["#f50", "#2db7f5", "#87d068", "#108ee9"][idx % 4] || "#108ee9";
		},
		copy(s) {
			if (copy(s)) {
				this.$toast.success("复制成功");
			} else {
				this.$toast.error("复制失败");
			}
		},
		limit(s, n) {
			return limit(s, n);
		},
		getDayHour(v) {
			return getDayHour(v);
		},
		encodeVersion(v) {
			return encodeVersion(v);
		},
		traffic(v) {
			return traffic(v);
		},
		click(item, header) {
			if (header.click) return header.click(item);
		},
		toggle(item, header) {
			if (header.click) return;
			this.$emit("toggle", item, header.key);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-table {
}
</style>
