<template>
	<div class="hd-foreign" @click.stop>
		<template v-if="table == 'users' && info">
			<img class="avatar" :src="avatar" alt="" referrerpolicy="no-referrer" />
			<br />
			<NuxtLink :title="value" :to="path" class="nickname">
				{{ info.nickname || info.nickName || value }}
			</NuxtLink>
		</template>
		<template v-else-if="table == 'ipinfos'">
			<a :title="value" :href="`https://www.ipshudi.com/${value}.htm`" target="_blank">{{
				area || value
			}}</a>
		</template>
		<template v-else-if="info && (info.title || info.name)">
			<NuxtLink :title="value" :to="path" class="nickname">
				{{ info.title || info.name || value }}
			</NuxtLink>
		</template>
		<template v-else-if="value">
			<NuxtLink :to="path">{{ value }}</NuxtLink>
		</template>
	</div>
</template>
<script>
import tables from "./tables";
export default {
	name: "Foreign",
	components: {},
	props: {
		table: String,
		value: [String, Number],
	},
	data() {
		return {
			info: null,
		};
	},
	computed: {
		path() {
			let key = this.tr?.key || "id";
			let path = `/${this.table}/?${key}=${this.value}`;
			if (!this.$router.resolve(path).matched.length) {
				path = `/?table=${this.table}&${key}=${this.value}`;
			}
			return path;
		},
		avatar() {
			let avatar = this.info && (this.info.avatar || this.info.avatarUrl);
			return /^https?:/.test(avatar)
				? avatar
				: "https://electron-update-1251441578.file.myqcloud.com/avatar.webp";
		},
		area() {
			let info = this.info;
			if (!info) return "";
			let area = [];
			let set = new Set();
			for (let key of ["country", "region", "city", "isp"]) {
				let val = info[key];
				if (val && !set.has(val)) {
					set.add(val);
					area.push(val);
				}
			}
			return area.join("|");
		},
		tr() {
			return tables.find((x) => x.name == this.table);
		},
	},
	watch: {
		value() {
			this.refresh();
		},
	},
	mounted() {
		this.refresh();
	},
	methods: {
		refresh() {
			let tr = this.tr;
			if (tr)
				tr.get(this.value).then((x) => {
					this.info = x;
				});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.hd-foreign {
	> .avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
	}
	> .nickname {
		white-space: nowrap;
	}
}
</style>
