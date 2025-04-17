interface Param {
	placeholder?: string;
	label?: string;
	name?: string;
	type?: string;
	options?: string;
}

interface Task {
	code: string;
	author?: string;
	name?: string;
	domain?: string;
	domains?: string[];
	grant?: string;
	grants?: string[];
	param?: string;
	expire?: number;
	enable?: boolean;
	freq?: number;
	_params?: Record<string, any>;
	params?: Param[];
}

export function compileTask(text: string) {
	let beg = text.indexOf("==UserScript==");
	let end = text.indexOf("==/UserScript==");
	if (beg < 0 || end < 0 || beg > end) return;
	let code = text.slice(end);
	let idx = code.indexOf("\n");
	if (idx < 0) idx = code.length;
	code = code.slice(idx);
	let task: Task = {code};
	text = text.slice(beg + 14, end);
	text = text.replace(/\n\s*\/\/ ?/g, "\n");
	let lines = text.split(/\n\s*@/);
	lines = lines.map((x) => x.trim()).filter((x) => x);
	for (let line of lines) {
		let name: string;
		let m = /\w+\s*/.exec(line);
		if (m) {
			name = m[0];
			let value = line
				.slice(name.length)
				.replace(
					new RegExp(
						Array.from({length: name.length + 1})
							.fill(" ")
							.join(""),
						"g"
					),
					""
				)
				.trim();
			name = name.trim();
			let one = task[name];
			if (one) {
				let ones = task[name + "s"];
				if (ones) ones.push(value);
				else task[name + "s"] = [one, value];
			}
			task[name] = value;
		}
	}
	// console.log(task)
	if (!task) throw "格式非法,找不到==UserScript==区域";
	if (!task.author) task.author = "";
	if (!task.name) throw "缺少@name";
	if (!task.domain) throw "缺少@domain";
	else if (!task.domains) task.domains = [task.domain];
	if (task.grant && !task.grants) task.grants = task.grant.split(",");
	let params = task.params as string[];
	if (task.param && !params) params = [task.param];
	if (task.freq) task.freq = +task.freq || 0;
	if (params) {
		task._params = {};
		task.params = params.map((x) => {
			let param: Param = {};
			let ss = x.split(/\s+/);
			param.placeholder = param.label = param.name = ss[0];
			param.type = "text";
			if (ss.length > 2) {
				param.label = ss.slice(2).join(" ");
				try {
					param.type = "select";
					param.options = `[${ss[1]}]`;
				} catch (error) {
					param.type = ss[1];
				}
			} else if (ss.length == 2) {
				param.label = ss[1];
			}
			let ll = param.label.split(",");
			param.label = ll[0];
			if (ll.length > 1) param.placeholder = ll.slice(1).join(",");
			return param;
		});
	}
	delete task.param;
	delete task.domain;
	task.expire = +task.expire || 900e3; // 默认15分钟过期
	return task;
}
