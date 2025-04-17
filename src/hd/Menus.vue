<template>
	<div v-click-outside="close" class="hd-menus" :class="{show}">
		<div class="head">
			<div v-if="!user" class="login" @click="login">登录</div>
			<div v-else class="user-info">
				<i-img v-if="user.avatar" class="user-head" :src="user.avatar"></i-img>
				<div class="user-name">
					{{ user.nickname || user.account }}
				</div>
				<div class="flex-1"></div>
				<button class="error-link" @click="logout()">退出</button>
			</div>
		</div>
		<div v-if="user" class="desc">
			<div>
				<span v-if="score > 0"><b>积分:</b> {{ +score.toFixed(8) }}</span>
				<button class="primary" @click="recharge">捐赠支持</button>
			</div>
		</div>
		<ul class="menus">
			<router-link
				v-for="(item, i) in tables"
				:key="i"
				class="li"
				:to="item.path"
				:class="{active: name == item.key}"
			>
				{{ item.name }}
				<span class="tips">{{ local.counts[item.key] }}</span>
			</router-link>
		</ul>
		<div class="toggle">
			<i-svg :size="20" name="right" @click="show = !show"></i-svg>
		</div>
	</div>
</template>
<script setup lang="ts">
import {ref, computed, onMounted, onBeforeUnmount, watch} from "vue";
import {useRouter} from "vue-router";
import {sendEvent} from "@/common/userevent";
import {watchLocal} from "@/common/utils";
import {dlg, showForm} from "~/dialogs";
import {apiGet, apiPost} from "~/lib/axios";
import toast from "~/lib/toast";
import {logout, onNeedLogin, refreshUserInfo} from "~/stores/actions";
import {shareLocal} from "~/stores/local";

const router = useRouter();

const show = ref(false);
const tables = ref([
	{name: "接口令牌", key: "usertoken", path: "/"},
	{name: "我的脚本", key: "my-scripts", path: "/my-scripts/?pageSize=100"},
	{name: "脚本广场", key: "scripts", path: "/scripts/?pageSize=20"},
]);
const local = watchLocal("tables", {
	appname: "",
	counts: {},
});

const user = computed(() => shareLocal.user);
const name = computed(() => {
	if (router.currentRoute.value.path.length > 2)
		return router.currentRoute.value.path.replace(/\//g, "");
	return router.currentRoute.value.query.table || "info";
});
const title = computed(() => {
	return [tables.value.find((x) => x.key == name.value)?.name, local.appname || "管理后台"]
		.filter((x) => x)
		.join(" - ");
});
const score = computed(() => {
	return user.value && user.value.score - user.value.score_used;
});

watch(title, (v) => {
	document.title = v;
});

onMounted(() => {
	apiGet("/sys/info").then((res) => {
		local.appname = res.name;
	});
	document.title = title.value;
});

function close() {
	show.value = false;
}

function login() {
	onNeedLogin();
}

function recharge() {
	showForm({
		title: "Buy me a coffee",
		params: [
			{
				key: "score",
				label: "金额",
				type: "number",
				reg: /^\d+\.?\d{0,2}$/,
				placeholder: "请输入捐赠的金额",
			},
		],
		async submit(body) {
			if (body.score < 0.01) throw "请输入大于0.01";
			if (!/^\d+\.?\d{0,2}$/.test(body.score)) throw "请输入正确数字";
			dlg.show("Charge", {
				score: body.score,
			});
		},
	});
}

function changePWD() {
	showForm({
		title: "修改密码",
		params: [
			{
				key: "oldpwd",
				label: "旧密码",
				type: "text",
			},
			{
				key: "passwd",
				label: "密码",
				type: "password",
			},
			{
				key: "passwd1",
				label: "重复密码",
				type: "password",
			},
		],
		async submit(body) {
			let data = await apiPost("/users/change-passwd", body);
			toast.success("修改成功");
			shareLocal.user = data;
			sendEvent("修改密码");
		},
	});
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.adminpage {
	display: flex;
	max-width: 100vw;
	min-height: 100vh;
	> .content {
		flex: 1;
		width: 1px;
	}
}
.form-box {
	min-width: 375px;
}
.hd-menus {
	min-width: 240px;
	display: flex;
	flex-direction: column;
	background-color: #fff;
	border-right: 1px solid #e8e8e8;
	height: 100vh;
	> .head {
		padding: 12px;
		> .user-info {
			display: flex;
			align-items: center;
			> .i-img {
				width: 32px;
				height: 32px;
				border-radius: 50%;
				margin-right: 6px;
			}
			button {
				margin-left: 6px;
			}
		}
	}
	> .desc {
		padding: 12px;
	}
	.menus {
		flex: 1;
		height: 1px;
		.scroll-y;
		.li {
			cursor: pointer;
			padding: 2px 12px;
			display: block;
			color: #333;
			&:hover {
				background-color: #f5f5f5;
			}
			> .tips {
				color: @success;
				font-size: 0.9em;
			}
		}
		.hd-foreign > .nickname {
			white-space: normal;
		}
		.active {
			color: @primary;
		}
	}
	> .toggle {
		display: none;
	}
	@media screen and (max-width: 1200px) {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		bottom: 0;
		transform: translateX(-100%);
		transition: transform 0.3s;
		&.show {
			transform: translateX(0);
			> .toggle {
				> .i-svg {
					transform: rotate(180deg);
				}
			}
		}
		> .toggle {
			position: absolute;
			right: -20px;
			top: 50%;
			transform: translateY(-50%);
			background-color: #fff;
			border: 1px solid #e8e8e8;
			border-left: none;
			width: 20px;
			height: 40px;
			display: flex;
			align-items: center;
			border-top-right-radius: 5px;
			border-bottom-right-radius: 5px;
			> .i-svg {
				transform: rotate(0);
			}
		}
	}
}
</style>
