<template>
	<hd-base-table
		ref="table"
		title="我的脚本"
		class="page-my-scripts"
		:after-headers="afterHeaders"
		:before-list="beforeList"
		:map-list="mapList"
		@clickItem="clickItem"
	>
		<template #desc>
			<p>
				脚本代码保存云端, 敏感信息请放在本地存储,
				脚本公开后其他用户可以fork代码。设置了路由的脚本启用后可以通过接口远程调用。
			</p>
		</template>
		<template #actions>
			<button class="success-plain" @click="show_store = !show_store">
				{{ show_store ? "隐藏" : "显示" }}本地存储
			</button>
			<button class="primary" @click="add({})">添加</button>
		</template>
		<template #tools="{item}">
			<button v-if="item.route" class="primary-plain" @click="copyCurl(item)">复制curl</button>
			<button class="success" @click="run(item)">
				运行
				<i-loading v-if="runningMap[item.id]"></i-loading>
			</button>
			<button class="primary" @click="add(item)">修改</button>
			<button class="error" @click="del(item)">删除</button>
		</template>
	</hd-base-table>
</template>
<script setup lang="ts">
import {Buffer} from "buffer";
import {onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {clearKeys, copy, getDayHour, isEmpty, tryJSON} from "~/common/utils";
import {dlg, showForm} from "~/dialogs";
import axios from "~/lib/axios";
import config from "~/lib/config";
import {runScript} from "~/options/script_runner";
import {compileTask} from "~/lib/soulsign";
import toast from "~/lib/toast";
import {local, scriptsLocal} from "~/stores/local";
import app from "~/stores/app";

const route = useRoute();
const router = useRouter();
const table = ref(null);
const show_store = ref(false);
const runningMap = reactive({});
// Methods
function afterHeaders(params) {
	if (!params) return params;
	let {uid, fork_at, fork_id, fork_cnt, create_at, update_at, ...rest} = params;
	rest = {
		...rest,
		autorun: {
			lbl: "自动运行",
			is: "i-toggle",
			click(item) {
				if (!item) return;
				let one = scriptsLocal.list.find((x) => x.id == item.id);
				if (!one) {
					one = {id: item.id, name: item.name, freq: 300};
					scriptsLocal.list.push(one);
				}
				one.autorun = !one.autorun;
			},
		},
		freq: {
			lbl: "运行间隔",
			encode(item) {
				let ms = +item.freq || 300;
				return getDayHour(ms * 1e3);
			},
			click(item) {
				if (!item) return;
				showForm({
					title: "修改运行间隔",
					params: {
						freq: {
							lbl: "运行间隔",
							type: "number",
							need: true,
							placeholder: "请输入运行间隔(秒)",
						},
					},
					default: {freq: item.freq},
					submit: async (body) => {
						if (body.freq == item.freq) return;
						let one = scriptsLocal.list.find((x) => x.id == item.id);
						if (!one) {
							one = {id: item.id, name: item.name, freq: body.freq};
							scriptsLocal.list.push(one);
						} else {
							one.freq = body.freq;
						}
					},
				});
			},
		},
		next_at: {
			lbl: "下次运行",
			is: "i-date",
			click(item) {},
		},
		result: {
			lbl: "运行结果",
			is: "i-html",
			click(item) {
				if (!item) return;
				copy(item.result.text) && toast.success("已复制");
			},
		},
	};
	if (show_store.value) {
		rest.store = {
			lbl: "本地存储",
			is: "i-json",
			click(item) {
				if (!item) return;
				console.log(item);
				return showForm({
					title: "修改store",
					mode: "fullscreen",
					params: {
						code: {lbl: " ", type: "code", language: "json", need: true},
					},
					default: {code: JSON.stringify(item.store, null, 2)},
					submit: async (body) => {
						let store;
						if (body.code) {
							try {
								store = JSON.parse(body.code);
							} catch (error) {
								console.error(error);
								throw "非法的JSON格式";
							}
						}
						let one = scriptsLocal.list.find((x) => x.id == item.id);
						if (!one) {
							one = {id: item.id, name: item.name, freq: 300, store};
							scriptsLocal.list.push(one);
						} else {
							one.store = store;
						}
					},
				});
			},
		};
	}
	return rest;
}

function beforeList(params) {
	if (!params) return params;
	params.fields = "myscript";
	return params;
}

function mapList(item) {
	let script = scriptsLocal.list.find((x) => x.id == item.id) || ({} as any);
	let next_at = Math.max(
		(+script.run_at || 0) + (+script.freq || 300) * 1000,
		+script.next_at || 0
	);
	if (next_at <= app.tick) next_at = 0;
	return Object.assign(item, {
		autorun: script?.autorun,
		freq: script?.freq,
		next_at,
		store: script?.store,
		result: script?.result || {},
	});
}

async function add(data) {
	data = data || {};
	console.log(data);
	if (data.id) {
		if (!data.code) data.code = await axios.apiGet("/scripts/get", {id: data.id});
	} else {
		data.code = `async function main(params) {\n    \n}`;
	}
	return showForm({
		title: "添加脚本",
		mode: "fullscreen",
		params: {
			name: {lbl: "名称", placeholder: "脚本名称", maxlength: 64, need: true},
			code: {lbl: "代码", type: "code", language: "js", need: true},
		},
		default: data,
		submit: async (body) => {
			if (!body.name) throw "请输入名称";
			if (data && data.id) {
				clearKeys(body, data);
				if (isEmpty(body)) return;
				body.id = data.id;
			}
			await axios.apiPost("/scripts/set", body);
			if (body.name) data.name = body.name;
			if (body.code) data.code = body.code;
			table.value.refresh();
		},
		actions: [
			{
				name: "测试",
				handler: async (body) => {
					await run1({
						id: data.id || 0,
						name: body.name || "测试",
						code: body.code.replace(/(\smain\([^\)]*\)\s*\{)/, "$1debugger;"),
					});
				},
			},
			{
				name: "从魂签脚本转换",
				handler: async (body) => {
					let task = compileTask(body.code);
					if (!task) return toast.error(`没有检测到魂签脚本`);
					let {name, code, ...rest} = task;
					body.name = name;
					body.code = `const exports = {};
const module = {exports};
const task = ${JSON.stringify(rest)};
const retry_freq = 10 * 60e3; // 出错后间隔10分钟重试
const today = new Date().setHours(8, 0, 0, 0); // 每天8点签到
const axios = async function (opt) {
	let body = opt.data;
	let headers = {...opt.headers};
	if (typeof body == "object") {
		headers["Content-Type"] = "application/json";
		body = JSON.stringify(body);
	}
	const resp = await fetch(opt.url, {
		method: opt.method || "GET",
		headers,
		body,
	});
	let data = await resp.text();
	try {
		data = JSON.parse(data);
	} catch (e) {}
	return {
		status: resp.status,
		data,
		headers: resp.headers,
	};
};
axios.get = async function (url, opt) {
	return axios({url, ...opt});
};
axios.post = async function (url, body, opt) {
	return axios({url, method: "POST", data: body, ...opt});
};

async function open(url, debug, callback) {
	let tab = await win.newTab({url, active: debug ? true : false});
	if (!callback) {
		tab.close();
		return;
	}
	function newFb(tb = tab) {
		async function getFrame(url, fuzzy, timeout = 10e3) {
			let waitCount = timeout / 1e3;
			fuzzy = fuzzy || 0;
			let urlHost = url.replace(/^(https?:\\/\\/[^\\/]+)[\\s\\S]*$/, "$1");
			let urlPath = url.split("?")[0];
			if (fuzzy > 2) url = urlHost;
			else if (fuzzy > 1) url = urlPath;
			while (true) {
				let frames = await tb.getFrames();
				if (!fuzzy || fuzzy == 1) {
					for (let item of frames) {
						if (item.getURL() == url) return newFb(item);
					}
				}
				if (fuzzy > 1) {
					for (let item of frames) {
						if (item.getURL().startsWith(url)) return newFb(item);
					}
				} else if (!fuzzy) {
					for (let item of frames) {
						if (item.getURL().startsWith(urlPath)) return newFb(item);
					}
					for (let item of frames) {
						if (item.getURL().startsWith(urlHost)) return newFb(item);
					}
				}
				if (--waitCount < 1) break;
				await sleep(1e3);
			}
			throw \`等待iframe: \${url} 超时>\${timeout / 1e3}s\`;
		}
		return {
			eval: (code, ...args) => tb.runjs(makeCode(code, args)),
			sleep,
			waitLoaded: async (ms) => {
				let start = Date.now();
				await waitUntil(() => tb.tab.status === "loading", ms / 2);
				await waitUntil(() => tb.tab.status === "complete", ms - (Date.now() - start));
			},
			click: (selector) =>
				tb.waitSelector(selector, 10e3).then((ok) => ok && tb.click(selector).then(() => true)),
			value: async (selector, value) => {
				if (await tb.waitSelector(selector, 10e3)) {
					await tb.input(selector, value);
					await tb.trigger(selector, "input");
				}
			},
			getFrame,
			async waitUntil(selector, timeout = 10e3) {
				let retryCount = timeout / 1e3;
				let ret;
				while (retryCount > 0) {
					if (
						(ret = await (typeof selector == "function"
							? selector()
							: this.eval((s) => !!document.querySelector(s), selector)
						).catch(() => false))
					)
						return ret;
					if (--retryCount <= 0) throw \`等待\${selector}超时>\${timeout / 1e3}s\`;
					await sleep(1e3);
				}
			},
		};
	}
	const fb = newFb();
	return await callback(fb).then((x) => {
		tab.close();
		return x;
	});
}

async function getLocal(url, key) {
	let exist = win.tabs.find((x) => x.getURL().startsWith(url));
	let tab = exist;
	if (!exist) {
		tab = await win.newTab({url, active: false});
	}
	let value = await tab.runjs(\`localStorage.getItem(\${JSON.stringify(key)})\`);
	if (!exist) tab.close();
	return value;
}

function getCookie(url, key) {
	return win.getCookie(key, url);
}

function datetime(t) {
	t = new Date(t);
	let year = t.getFullYear().toString();
	var month = (t.getMonth() + 1).toString();
	if (month.length < 2) month = "0" + month;
	var date = t.getDate().toString();
	if (date.length < 2) date = "0" + date;
	var hours = t.getHours().toString();
	if (hours.length < 2) hours = "0" + hours;
	var mintues = t.getMinutes().toString();
	if (mintues.length < 2) mintues = "0" + mintues;
	var seconds = t.getSeconds().toString();
	if (seconds.length < 2) seconds = "0" + seconds;
	return \`\${year}-\${month}-\${date} \${hours}:\${mintues}:\${seconds}\`;
}

async function main(param) {
	const store = await getStore({});
	let online = await module.exports.check({...store, ...param});
	if (!online) {
		win.notify("不在线");
		throw "不在线";
	}
	let result = await module.exports.run({...store, ...param});
	let next_at = task.freq
		? Date.now() + task.freq
		: new Date(Date.now() + 86400e3).setHours(8, 0, 0, 0);
	await setNextAt(next_at);
	return result;
}

${code}`;
				},
			},
		],
	});
}

async function run(data) {
	if (runningMap[data.id]) return;
	runningMap[data.id] = true;
	await run1({id: data.id, name: data.name}).finally(() => {
		runningMap[data.id] = false;
	});
}

function run1(data: {id: number; name: string; code?: any; data?: any}) {
	return runScript(data)
		.then((res) => {
			console.log(res);
			function readStream(rs, msg) {
				let reader = rs.getReader();
				function next() {
					reader.read().then(({done, value}) => {
						if (done) return (msg.btns[0] = "知道了");
						msg.msg += value;
						next();
					});
				}
				next();
			}
			if (res instanceof ReadableStream) {
				let msg = reactive({title: "流式输出", msg: "", btns: ["关闭"]});
				dlg.openMessage(msg);
				readStream(res, msg);
				return;
			}
			if (res instanceof Response) {
				let msg = reactive({title: `Response: ${res.status}`, msg: "", btns: ["关闭"]});
				dlg.openMessage(msg);
				readStream(res.body, msg);
				return;
			}
			return dlg.alert(res, {title: "成功"});
		})
		.catch((err) => {
			console.error(err);
			dlg.alert(err, {title: "失败"});
		});
}

async function del(item) {
	if (await dlg.confirm(`确定删除【${item.name}】脚本吗？`)) {
		await axios.apiPost("/scripts/del", {id: item.id});
		table.value.refresh();
	}
}

async function copyCurl(item) {
	let ws = config.apiDomain.replace("http", "ws").replace("/api", "/ws/connect");
	let one = local.list.find((x) => x.url.startsWith(ws));
	if (!one) return toast.error("请先连接令牌");
	let m = /token=([^&=]+)/.exec(one.url);
	if (!m) return toast.error("请先连接令牌");
	let token = m[1];
	let url = item.route;
	if (!url.startsWith("/")) url = "/" + url;
	url = config.apiDomain.replace("/api", url);
	let curl = `curl -X POST '${url}' -H 'Authorization: Bearer ${token}' -H 'Content-Type: application/json' -d '{}'`;
	copy(curl) && toast.success("curl 复制成功");
}

function clickItem({head, item}) {
	console.log(head);
	if (head.key == "name" || head.key == "route") {
		showForm({
			title: "修改" + head.name,
			params: [
				{
					key: head.key,
					label: head.name,
					placeholder: "请输入" + head.name,
					default: item[head.key] || "",
					autofocus: true,
				},
			],
			async submit(body) {
				if (body[head.key] == item[head.key]) return;
				await axios.apiPost("/scripts/set", {id: item.id, [head.key]: body[head.key]});
				item[head.key] = body[head.key];
			},
		});
	}
}

// Lifecycle
onMounted(() => {
	let b64 = route.query._;
	if (b64) {
		let message = tryJSON(Buffer.from(b64 + "", "base64").toString());
		console.log("message", message);
		function send(data) {
			return chrome.scripting.executeScript({
				target: {tabId: message.tabId, frameIds: message.frameIds},
				world: "MAIN",
				func: function (data) {
					(window as any).debugirl(data);
				},
				args: [{...data, rid: message.rid}],
			});
		}
		if (message.type == "add") {
			if (!message.code) return send({err: "need param code"});
			send({data: "opened"});
			add({
				name: message.name || "",
				code: message.code || "",
			}).finally(() => {
				let {_, ...rest} = route.query;
				router.push({query: rest});
			});
		}
		if (message.type == "run") {
			if (!message.code) return send({err: "need param code"});
			showForm({
				title: "运行脚本",
				desc: "运行结果会返回给原网站",
				mode: "fullscreen",
				params: {
					code: {lbl: "代码", type: "code", language: "js", need: true},
				},
				default: {
					code: message.code,
				},
				buttons: ["运行", "取消"],
				submit: async (body) => {
					await runScript({id: 0, name: body.name, code: body.code})
						.then((res) => {
							console.log(res);
							return send({data: res});
						})
						.catch((err) => {
							console.error(err);
							return send({err});
						});
				},
			}).finally(() => {
				window.close();
			});
		}
	}
	const win: any = window;
	win.axios = axios;
});
</script>
<style lang="less">
@import "~@/styles/define.less";
.page-my-scripts {
	.runner {
		position: fixed;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		opacity: 0;
		pointer-events: none;
	}
	.body-name {
		cursor: pointer;
	}
	.body-route {
		cursor: pointer;
		color: @primary;
	}
	.body-freq {
		cursor: pointer;
	}
	.body-result {
		font-size: 12px;
		cursor: pointer;
		word-break: keep-all;
		> span {
			display: inline-block;
		}
		> * {
			max-width: 250px;
			max-height: 100px;
			.scroll-y;
		}
		.error {
			color: @error;
		}
		.success {
			color: @success;
		}
	}
}
</style>
