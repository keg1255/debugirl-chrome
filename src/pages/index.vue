<template>
	<hd-base-table ref="table" :after-headers="afterHeaders" @clickItem="clickItem">
		<template #desc>
			<p>连接后可以通过api调用脚本并获取返回值</p>
		</template>
		<template #actions>
			<button class="primary" @click="add()">添加</button>
		</template>
		<template #tools="{item}">
			<button v-if="isConnected(item)" class="error-plain" @click="disconnect(item)">断开</button>
			<button v-else-if="has(item)" class="error-plain" @click="disconnect(item)">连接中</button>
			<button v-else class="success" @click="connect(item)">连接</button>
			<button class="error" @click="reset(item)">重置</button>
		</template>
	</hd-base-table>
</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {randomString} from "~/common/utils";
import {dlg, showForm} from "~/dialogs";
import axios from "~/lib/axios";
import config from "~/lib/config";
import {local} from "~/stores/local";

const table = ref(null);

// Methods
async function add() {
	await axios.apiPost("/usertoken/set", {token: "sk-" + randomString(32)});
	table.value.refresh();
}

function getUrl(token) {
	return config.apiDomain.replace("http", "ws").replace("/api", "/ws/connect?token=" + token);
}

function has(item) {
	return local.list.some((x) => x.id == item.id && x.status != "disconnected");
}

function isConnected(item) {
	return (item.online = +local.list.some((x) => x.id == item.id && x.status == "connected"));
}

async function connect(item) {
	if (has(item)) return;
	local.list = [{id: item.id, url: getUrl(item.token), status: "connecting", timeout: 0}];
}

async function disconnect(item) {
	local.list = local.list.filter((x) => x.id != item.id);
}

async function reset(item) {
	if (!(await dlg.confirm("确定要重新生成token吗?"))) return;
	await axios.apiPost("/usertoken/set", {id: item.id, token: "sk-" + randomString(32)});
	table.value.refresh();
}

async function del(item) {
	await axios.apiPost("/usertoken/del", {id: item.id});
	table.value.refresh();
}

function afterHeaders(params) {
	return {...params, online: {lbl: "状态", opts: ["离线", "在线"]}};
}

function clickItem({head, item}) {
	if (head.key == "remark") {
		showForm({
			title: "修改备注",
			params: [
				{
					key: "remark",
					label: "备注",
					type: "textarea",
					placeholder: "请输入备注",
					def: item.remark || "",
				},
			],
			async submit(body) {
				if (body.remark == item.remark) return;
				await axios.apiPost("/usertoken/set", {id: item.id, remark: body.remark});
				item.remark = body.remark;
			},
		});
	}
}

// Lifecycle
onMounted(() => {});
</script>
<style lang="less">
@import "~@/styles/define.less";
.pages-index {
}
</style>
