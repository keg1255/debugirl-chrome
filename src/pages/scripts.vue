<template>
	<hd-base-table ref="table" title="脚本广场" class="page-scripts" :after-headers="afterHeaders">
		<template #desc>
			<p>这里展示的是公开的脚本, 可以fork到我的脚本中</p>
		</template>
		<template #actions> </template>
		<template #tools="{item}">
			<button class="success-plain" @click="view(item)">查看代码</button>
			<button class="primary-plain" @click="fork(item)">fork</button>
		</template>
	</hd-base-table>
</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {dlg, showForm} from "~/dialogs";
import axios from "~/lib/axios";
import {useRouter} from "vue-router";

const router = useRouter();
const table = ref(null);
// Methods
function afterHeaders(params) {
	if (!params) return params;
	let {state, fork_at, ...rest} = params;
	delete rest.public;
	return rest;
}

async function view(data) {
	data = data || {};
	console.log(data);
	if (data.id) {
		if (!data.code)
			data.code = await axios.apiGet("/scripts/get", {id: data.id, code_md5: data.code_md5});
	} else {
		data.code = `async function main(params) {\n    \n}`;
	}
	return showForm({
		title: data.name || "查看代码",
		mode: "fullscreen",
		params: {
			code: {lbl: " ", type: "code", language: "js", need: true},
		},
		default: data,
		buttons: ["fork", "关闭"],
		submit: () => {
			return fork(data);
		},
	});
}

async function fork(item) {
	await axios.apiPost("/scripts/fork", {
		id: item.id,
	});
	dlg
		.openMessage({
			title: "fork成功",
			msg: "去我的脚本中查看?",
			btns: ["关闭", "去看看"],
		})
		.then((idx) => {
			if (idx) {
				router.push("/my-scripts/?pageSize=100");
			}
		});
}

// Lifecycle
onMounted(() => {});
</script>
<style lang="less">
@import "~@/styles/define.less";
.page-scripts {
}
</style>
