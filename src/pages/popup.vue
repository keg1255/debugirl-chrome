<template>
	<div class="main_app">
		<div class="box">
			<table>
				<thead>
					<tr>
						<th>id</th>
						<th>地址</th>
						<th width="92">状态</th>
						<th width="120">操作</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in local.list" :key="item.id">
						<td>{{ item.id }}</td>
						<td>
							<input
								:value="item.url"
								@change="changeUrl(item, $event)"
								type="text"
								placeholder="请输入websocket地址"
							/>
						</td>
						<td>{{ item.status }}</td>
						<td>
							<button @click="connect(item)">连接</button>
							<button @click="disconnect(item)">断开</button>
							<button @click="remove(item)">删除</button>
						</td>
					</tr>
					<tr>
						<td>{{ maxId }}</td>
						<td><input v-model="body.url" type="text" placeholder="请输入websocket地址" /></td>
						<td></td>
						<td>
							<button @click="connect(body)">连接</button>
							<button @click="disconnect(body)">断开</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="box">
			<div class="title">信任域名可以操作浏览器</div>
			<div class="group">
				<div v-for="(item, i) in local.allow_hosts" :key="i" class="item">
					{{ item }} <button @click="delDomain(i)">删除</button>
				</div>
				<div class="item">
					<input v-model="domain" type="text" placeholder="如: www.baidu.com" /><button
						:disabled="!domain"
						@click="addDomain"
					>
						添加
					</button>
				</div>
			</div>
		</div>
		<div class="box">
			<div class="title">键鼠接口</div>
			<div class="group">
				<div class="item">
					<input
						v-model="local.mouse_api"
						type="text"
						placeholder="如: http://localhost:8080/api/mouse/send"
					/><button>保存</button>
				</div>
			</div>
		</div>
		<div class="line tar">
			<div>{{ local.uuid }}</div>
			<div class="flex-1"></div>
			<button @click="connectAll">全部连接</button>
			<button @click="disconnectAll">全部断开</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {local} from "@/stores/local";

const domain = ref("");
const body = ref({
	url: "",
});

const maxId = computed(() => {
	return local.list.reduce((max, item) => Math.max(max, item.id), 0) + 1;
});

function connect(item) {
	if (item === body.value) {
		item = {...body.value};
		item.enabled = "connecting";
		if (item.url) {
			local.list.push({...item, id: maxId.value});
			body.value.url = "";
		}
	} else if (item.status == "disconnected") {
		item.status = "connecting";
	}
}

function changeUrl(item, e) {
	item.url = e.target.value;
	console.log("changeUrl", item, e.target.value);
}

function disconnect(item) {
	if (item === body.value) {
		item = {...body.value};
		item.status = "disconnected";
		if (item.url) {
			local.list.push({...item, id: maxId.value});
			body.value.url = "";
		}
	} else {
		item.status = "disconnected";
	}
}

function remove(item) {
	local.list = local.list.filter((i) => i.id !== item.id);
}

function connectAll() {
	local.list.forEach((item) => {
		if (item.status == "disconnected") {
			item.status = "connecting";
		}
	});
}

function disconnectAll() {
	local.list.forEach((item) => {
		item.status = "disconnected";
	});
}

function addDomain() {
	if (domain.value) {
		local.allow_hosts.push(domain.value);
		domain.value = "";
	}
}

function delDomain(i) {
	local.allow_hosts.splice(i, 1);
}
</script>

<style lang="less">
.main_app {
	padding: 16px;
	min-width: 520px;
	.flex-1 {
		flex: 1;
	}
	button {
		cursor: pointer;
	}
	button + button {
		margin-left: 10px;
	}
	> .box {
		max-height: 400px;
		overflow-y: auto;
		th {
			position: sticky;
			top: 0;
			background-color: #fff;
			border-bottom: 1px solid #666;
		}
		th,
		td {
			padding: 10px;
			white-space: nowrap;
		}
		input {
			flex: 1;
			border: none;
			border-bottom: 1px solid #666;
			min-width: 240px;
			width: 100%;
			&:focus {
				outline: none;
			}
		}
		table {
			width: 100%;
			button {
				border: none;
				background: transparent;
				padding: 0;
				color: #0b57d0;
				&:hover {
					color: #a8c7fa;
				}
			}
		}
		> .tips {
			color: #ccc;
			flex: 1;
			&.connected {
				color: #0f0;
			}
			&.disconnected {
				color: #f00;
			}
		}
		> .title {
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 10px;
		}
		> .group {
			> .item {
				display: flex;
				align-items: center;
				margin-bottom: 10px;
				> button {
					margin-left: 10px;
				}
			}
		}
	}
	> .line {
		display: flex;
		align-items: center;
		min-height: 40px;
	}
}
</style>
