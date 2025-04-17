/**
 * 对URL参数进行编码,相当于 encodeURIComponent, 但只会编码 %=?+& 字符, 更加易读
 * @param {string} str
 */
export function encodeURI(str) {
	return (str + "")
		.replace(/%/g, "%25")
		.replace(/=/g, "%3D")
		.replace(/\?/g, "%3F")
		.replace(/\+/g, "%2B")
		.replace(/&/g, "%26")
		.replace(/#/g, "%23");
}

/**
 * 将data编码为URL的query参数
 * @param {{[key:string]:any}} data 要编码的数据。
 * @param {number} [limit] 限制过大的参数
 * @returns {string} 编码后的字符串
 * @example
 * encodeQuery({a: 1, b: 2}) // a=1&b=2
 */
export function encodeQuery(data, limit) {
	var ss = [];
	for (var k in data) {
		var v = data[k];
		if (v === undefined || typeof v === "function") continue;
		if (v == null || v === false) v = "";
		if (typeof v === "object") v = JSON.stringify(v);
		else v = v.toString();
		if (v.length > limit) continue;
		ss.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
	}
	return ss.join("&");
}

/**
 * 将URL的query参数解码为data
 * @param {string|object} data 要解码的字符串。
 * @returns {any} 解码后的数据。
 * @example
 * decodeQuery("a=1&b=2") // {a: 1, b: 2}
 */
export function decodeQuery(data) {
	if (!data) return {};
	if (typeof data === "string") {
		var obj = {};
		var par = data.split("&");
		for (var i = 0; i < par.length; i++) {
			var ss = par[i].split("=");
			if (ss.length != 2) continue;
			var k = decodeURIComponent(ss[0]);
			var v = decodeURIComponent(ss[1]);
			obj[k] = v;
		}
		data = obj;
	}
	for (let k in data) {
		let v = data[k];
		v = decodeURIComponent(v);
		if (/^[\[\{]/.test(v)) v = tryJSON(v);
		data[k] = v;
	}
	return data;
}

/**
 * 拼接url和query参数，生成新的url
 * @param {string} url
 * @param {any} [query]
 * @returns {string}
 * @example
 * encodeHref("/api/user", {id: 1})
 * "/api/user?id=1"
 */
export function encodeHref(url, query) {
	if (isEmpty(query)) return url;
	return url + (url.indexOf("?") >= 0 ? "&" : "?") + encodeQuery(query);
}

/**
 * 解码 html字符串, 将 &lt; &gt; &amp; &quot; &apos; &#x...; &#...; 转换为对应的字符
 * @param {string} str
 * @returns {string}
 * @example
 * decodeHTML("&lt;&gt;&amp;&quot;&apos;&#x...;&#...;")
 */
export function decodeHTML(str) {
	return str
		.replace(/<[^>]*>/g, "")
		.replace(/&#(x)?([^&]{1,5});?/g, function ($, $1, $2) {
			return String.fromCharCode(parseInt($2, $1 ? 16 : 10));
		})
		.replace(/&nbsp;/g, " ")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&trade;/g, "™")
		.replace(/&copy;/g, "©")
		.replace(/&reg;/g, "®")
		.replace(/&ldquo;/g, "“")
		.replace(/&rdquo;/g, "”")
		.replace(/&yen;/g, "¥")
		.replace(/&mdash;/g, "—")
		.replace(/&ndash;/g, "–")
		.replace(/&apos;/g, "'")
		.replace(/&darr;/g, "↓")
		.replace(/&uarr;/g, "↑")
		.replace(/&larr;/g, "←")
		.replace(/&rarr;/g, "→")
		.replace(/&middot;/g, "·")
		.replace(/&bull;/g, "•")
		.replace(/&hellip;/g, "…")
		.replace(/&permil;/g, "‰")
		.replace(/&amp;/g, "&")
		.replace(/&times;/g, "×");
}

/**
 * 编码 html,编码后的字符串可以直接用于innerHTML
 * @param {string} html
 * @returns {string}
 * @example
 * encodeHTML("<div>123</div>") // "&lt;div&gt;123&lt;/div&gt;"
 */
export function encodeHTML(html) {
	return html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/**
 * 编码 attrs 为标签属性字符串
 * @param {object} attrs
 * @returns {string}
 * @example
 * encodeAttrs({src:'http://www.baidu.com',id:1,data:[1,2,3]})
 * // src="http://www.baidu.com" id=1 data="[1,2,3]"
 */
export function encodeAttribute(attrs) {
	let s = "";
	for (let k in attrs) {
		let v = attrs[k];
		if (typeof v === "number" || typeof v === "boolean") s += ` ${k}=${v}`;
		else if (typeof v === "string") s += ` ${k}="${encodeHTML(v)}"`;
		else s += ` ${k}="${encodeHTML(JSON.stringify(v))}"`;
	}
	return s;
}

/**
 * 解码 attrs 为对象
 * @param {string} str
 * @param {boolean} [noParse] 不解析属性值,全部返回字符串
 * @returns {object}
 * @example
 * decodeAttrs('src="http://www.baidu.com" id=1 data="[1, 2,3]"')
 * // {src:'http://www.baidu.com',id:1,data:[1,2,3]}
 * decodeAttrs('src="http://www.baidu.com" id=1 data="[1, 2,3]"',true)
 * // {src:'http://www.baidu.com',id:1,data:'[1, 2,3]'}
 **/
export function decodeAttribute(str, noParse) {
	let attrs = {};
	if (!str) return attrs;
	let i = 0;
	while (i < str.length) {
		let j = str.indexOf("=", i);
		if (j < 0) break;
		let k = str.substring(i, j).trim();
		i = j + 1;
		let v = "";
		if (str[i] === '"' || str[i] === "'") {
			let c = str[i];
			i++;
			j = str.indexOf(c, i);
			if (j < 0) break;
			v = str.substring(i, j);
			i = j + 1;
		} else {
			j = str.indexOf(" ", i);
			if (j < 0) break;
			v = str.substring(i, j);
			i = j + 1;
		}
		v = decodeHTML(v);
		if (!noParse) {
			if (/^[\[\{]/.test(v)) v = tryJSON(v);
			else if (/^\d+$/.test(v)) v = parseInt(v);
			else if (/^\d+\.\d+$/.test(v)) v = parseFloat(v);
			else if (v === "true") v = true;
			else if (v === "false") v = false;
		}
		attrs[k] = v;
	}
	return attrs;
}

/**
 * 解码 csv 文本, 返回一个二维数组
 * @param {string} text
 * @param {(error: {prefix?:string,text:string})=>void} [onerror] 错误处理函数
 * @returns {any[][]}
 * @example
 * decodeCsv("1,2,3\n4,5,6") // [[1,2,3],[4,5,6]]
 */
export function decodeCsv(text, onerror) {
	text = text.replace(/\r\n/g, "\n");
	let list = [];
	let row;
	function addCols(cols) {
		console.log(cols.length);
		if (!row) {
			row = cols;
			list.push(row);
		} else {
			row.push(...cols);
		}
	}
	while (text.length) {
		let m = /[^"\n]+/.exec(text);
		if (m) {
			let prefix = m[0].trimEnd();
			if (prefix.endsWith(",")) {
				if ((text[m[0].length] || "\n") != "\n") prefix = prefix.slice(0, -1);
				addCols(prefix.split(","));
			} else if (onerror) onerror({prefix, text});
			text = text.slice(m[0].length);
		}
		if (text[0] == "\n") {
			text = text.slice(1);
			row = null;
		} else if (text[0] == '"') {
			let ret = matchString(text, [{c: '"', t: '"'}]);
			addCols([ret.value]);
			text = ret.next.trim().replace(/^,/, "");
		} else if (text && onerror) {
			onerror({text});
		}
	}
	return list;
}

export function encodeCsv(list) {
	return list
		.map((row) => {
			return row.map((x) => {
				if (x == null) x = "";
				else if (typeof x == "object") x = JSON.stringify(x);
				else x = x + "";
				return /[,"\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x;
			});
		})
		.join("\n");
}

/**
 * 创建Date对象,兼容IOS
 * @param {string|number|Date} [date]
 */
export function newDate(date) {
	if (date == null) return new Date();
	if (typeof date === "string") return new Date(date.replace(/-/g, "/"));
	return new Date(date);
}

/**
 * 获取距离1970-01-04(星期日)的天数, 可以用于判断是否同一天, 返回值 % 7 可以得到星期几(0-6 代表星期日到星期六)
 * @param {Date|string|number} [date]
 * @returns {number}
 */
export function getDay(date) {
	date = newDate(date);
	getDay.t = getDay.t || new Date(1970, 0, 4, 0, 0, 0, 0).getTime();
	return Math.floor((+date - getDay.t) / 86400e3);
}

/**
 * 格式化时间显示
 * - YY: 年份(2位)
 * - YYYY: 年份(4位)
 * - MM: 月份(2位)
 * - DD: 日期(2位)
 * - hh: 小时(2位)
 * - mm: 分钟(2位)
 * - ss: 秒(2位)
 * @param {string} format
 * @param {number|Date|string} [t]
 * @example
 * format("YYYY-MM-DD hh:mm:ss", new Date()) // "2019-01-01 00:00:00"
 */
export function format(format, t) {
	t = newDate(t);
	if (!format) {
		let now = new Date();
		if (getDay(now) - getDay(t) == 1) format = "昨天 hh:mm";
		else if (t.getFullYear() != now.getFullYear()) format = "YYYY-MM-DD hh:mm";
		else if (t.getMonth() != now.getMonth() || t.getDate() != now.getDate()) format = "MM-DD hh:mm";
		else format = "hh:mm";
	}
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
	return format
		.replace(/YYYY/g, year)
		.replace(/YY/g, year.slice(2))
		.replace(/MM/g, month)
		.replace(/DD/g, date)
		.replace(/hh/g, hours)
		.replace(/mm/g, mintues)
		.replace(/ss/g, seconds);
}

/**
 * 将时长转化为 00:00:00.sss 格式
 * @param {number} t
 * @param {boolean} [showMs]
 */
export function encodeTime(t, showMs) {
	let s = Math.floor(t / 1000);
	let ms = t % 1000;
	let m = Math.floor(s / 60);
	s = s % 60;
	let h = Math.floor(m / 60);
	m = m % 60;
	return (
		(h ? h + ":" : "") +
		(m < 10 ? "0" : "") +
		m +
		":" +
		(s < 10 ? "0" : "") +
		s +
		(showMs ? "." + ms : "")
	);
}

/**
 * 解码 00:00:00.sss 格式的时长
 * @param {string} str
 */
export function decodeTime(str) {
	let ss = str.split(":");
	let ms = +ss.pop() * 1000;
	ms += +ss.pop() * 60 * 1000;
	ms += +ss * 60 * 60 * 1000;
	return ms;
}

/**
 * 将时间转化为 2022-02-02 12:12:12 格式,效率比 format 高
 * - 返回值 .slice(0,10) 可以得到日期
 * - 返回值 .slice(11) 可以得到时间
 * @param {number|string|Date} [t]
 * @returns {string}
 * @example
 * datetime().slice(0,10) // "2022-02-02"
 */
export function datetime(t) {
	t = newDate(t);
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
	return `${year}-${month}-${date} ${hours}:${mintues}:${seconds}`;
}

/**
 * 用对旧数据优化的方式从保存的数据中恢复配置项
 * - 用v初始化def, 第一层只保留def的key，如果v中有相同的key, 则会覆盖def中的值
 * - 之后会合并def和v的key, 如果v中有相同的key, 则会覆盖def中的值
 * @template T
 * @param {T} def
 * @param {any} v
 * @param {boolean} [copyAllKeys]
 * @returns {T}
 * @example
 * deepInit({a: 1, b: {}}, {a: 3, b: {d: 1}, c: 4}) // {a: 3, b: {d: 1}}
 */
export function deepInit(def, v, copyAllKeys) {
	if (Array.isArray(def) && !Array.isArray(v)) return def;
	if (def != undefined && v == undefined) return def;
	if (def == null || v === null) return v;
	if (Array.isArray(def)) {
		def.length = 0;
		def.push.apply(def, v);
	} else if (typeof def === "object") {
		for (let k in def) {
			def[k] = deepInit(def[k], v[k], true);
			delete v[k];
		}
		if (copyAllKeys)
			for (let k in v) {
				def[k] = v[k];
			}
		return def;
	}
	return v;
}

/**
 * 深拷贝一个对象或数组
 * @template T
 * @param {T} obj
 * @returns {T}
 */
export function deepClone(obj) {
	if (obj == null) return obj;
	if (Array.isArray(obj)) {
		return obj.map(deepClone);
	}
	if (obj instanceof ArrayBuffer) return obj;
	if (obj instanceof Uint8Array) return obj;
	if (typeof obj === "object") {
		let o = {};
		for (let k in obj) {
			o[k] = deepClone(obj[k]);
		}
		return o;
	}
	return obj;
}

/**
 * 深度比较两个对象是否相等
 * @param {any} def
 * @param {any} v
 * @param {(paths:string[],val1:any,val2:any)=>boolean} fn 比较函数,paths是路径,val1是def中的值,val2是v中的值
 * @param {string[]} [paths] 请忽略,内部递归使用
 * @returns {boolean}
 */
export function deepDiff(def, v, fn, paths = []) {
	if (Array.isArray(def) && !Array.isArray(v)) return fn(paths, def, v);
	if ((def == null || v == null) && (def !== null || v !== null)) return fn(paths, def, v);
	if (Array.isArray(def)) {
		if (def.length != v.length) return fn(paths, def, v);
		for (let i = 0; i < def.length; i++) {
			if (deepDiff(def[i], v[i], fn, paths.concat(i))) return true;
		}
		return false;
	}
	if (typeof def === "object") {
		let set = new Set();
		for (let k in def) {
			if (deepDiff(def[k], v[k], fn, paths.concat(k))) return true;
			set.add(k);
		}
		for (let k in v) {
			if (!set.has(k) && deepDiff(def[k], v[k], fn, paths.concat(k))) return true;
		}
		return false;
	}
	return fn(paths, def, v);
}

export function compare(a, b) {
	if (a == b) return true;
	if (a == null) return false;
	if (b == null) return false;
	if (typeof a !== typeof b) return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a)) {
		if (a.length != b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!compare(a[i], b[i])) return false;
		}
		return true;
	}
	if (typeof a === "object") {
		let set = new Set();
		for (let k in a) {
			if (!compare(a[k], b[k])) return false;
			set.add(k);
		}
		for (let k in b) {
			if (!set.has(k) && !compare(a[k], b[k])) return false;
		}
		return true;
	}
	return false;
}

/**
 * 通过文件路径获取文件夹路径
 * @param {string} filepath
 * @returns {string} 返回文件夹路径
 * @example
 * dirname("/foo/bar") // "/foo"
 */
export function dirname(filepath) {
	var i = filepath.length - 1;
	while ((filepath[i] == "/" || filepath[i] == "\\") && i > 0) i--;
	for (; i >= 0; i--) {
		if (filepath[i] == "/" || filepath[i] == "\\") return i ? filepath.slice(0, i) : filepath[i];
	}
	return "";
}

/**
 * 通过文件路径获取文件名
 * - C:\xunjie\maincss.js 中的 maincss.js
 * @param {string} filepath
 * @returns {string} 文件名
 * @example
 * basename("/foo/bar") // "bar"
 * basename("/foo/bar.js") // "bar.js"
 */
export function basename(filepath) {
	var i = filepath.length - 1;
	while (filepath[i] == "/" || filepath[i] == "\\") i--;
	var end = i + 1;
	for (; i >= 0; i--) {
		if (filepath[i] == "/" || filepath[i] == "\\") return filepath.slice(i + 1, end);
	}
	return filepath.slice(0, end);
}

/**
 * 获取文件缀名
 * @param {string} filepath
 * @returns {string} 文件缀名
 * @example
 * extname("/foo/bar.js") // ".js"
 * extname("/foo/bar") // ""
 * extname("/foo/bar.") // "."
 * extname("/foo/bar/") // ""
 */
export function extname(filepath) {
	filepath = basename(filepath);
	let idx = filepath.lastIndexOf(".");
	return idx > 0 ? filepath.slice(idx).toLowerCase() : "";
}

/**
 * 替换文件后缀
 * @param {string} filepath
 * @param {string} [ext=""] 新的文件后缀
 * @returns {string}
 * @example
 * replaceExt("/foo/bar.js", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar.", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar/", ".ts") // "/foo/bar.ts"
 * replaceExt("/foo/bar.js", "") // "/foo/bar"
 */
export function replaceExt(filepath, ext = "") {
	var i = filepath.length - 1;
	while (filepath[i] == "/" || filepath[i] == "\\") i--;
	return filepath.slice(0, i + 1 - extname(filepath).length) + ext;
}

/**
 * 调整src高宽，使其充满dst而不超出dst
 * - 类似css中的background-size: contain
 * - https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 * @param {Size} src
 * @param {Size} dst
 */
export function contain(src, dst) {
	var r = src.width / src.height;
	var w = r * dst.height;
	if (dst.width >= w) {
		src.width = w;
		src.height = dst.height;
	} else {
		src.width = dst.width;
		src.height = dst.width / r;
	}
	return src;
}

/**
 * 调整src高宽，使其刚好覆盖dst
 * - 类似css中的background-size: cover
 * - https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
 * @param {Size} src
 * @param {Size} dst
 */
export function cover(src, dst) {
	if (src.height == 0 || src.width == 0) return src;
	var r = src.width / src.height;
	var w = r * dst.height;
	if (dst.width > w) {
		src.width = dst.width;
		src.height = dst.width / r;
	} else {
		src.width = w;
		src.height = dst.height;
	}
	return src;
}

/**
 * 调整src高宽, 如果超过dst则使其刚好不超出dst,否则保持原样
 * @param {Size} src
 * @param {Size} dst
 */
export function limitSize(src, dst) {
	let ratio = 1;
	if (src.width > dst.width) {
		ratio = dst.width / src.width;
		src.width = dst.width;
		src.height = src.height * ratio;
	}
	if (src.height > dst.height) {
		ratio = dst.height / src.height;
		src.height = dst.height;
		src.width = src.width * ratio;
	}
	return src;
}

/**
 * 判断子元素是否充满父元素高度而非宽度
 * @param {Size|HTMLElement} container
 * @param {Size} box
 */
export function isVertical(container, box) {
	let width = container.width || container.clientWidth;
	let height = container.height || container.clientHeight;
	console.log(width, height, box.width, box.height);
	return box.width / box.height < width / height;
}

/**
 * 等待ms毫秒
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
	return new Promise(function (resolve) {
		setTimeout(resolve, ms);
	});
}

/**
 * 限制字符串长度, 如果超出，则显示...
 * @param {string} s 字符串
 * @param {number} n 限制长度(包含...)
 * @param {number} [m=0] 末尾要保留的字符数
 * @returns {string}
 */
export function limit(s, n, m = 0) {
	let tail = s && m ? s.slice(-m) : "";
	return s ? (s.length <= n + m ? s : s.slice(0, n - 3) + "..." + tail) : "";
}

/**
 * 生成随机字符串,包含小写字母和数字
 * @param {number} len
 * @param {number} [radix=36] 基数,默认36
 * @returns {string}
 */
export function randomString(len, radix = 36) {
	if (len < 1) return "";
	let s = Math.random()
		.toString(radix)
		.slice(2, len + 2);
	return s + randomString(len - s.length, radix);
}

/**
 * 生成随机字符串,仅包含数字
 * @param {number} len
 */
export function randomNumber(len) {
	if (len < 1) return "";
	let s = Math.random().toString().slice(2);
	return s + randomNumber(len - s.length);
}

/**
 * 生成随机整数
 * @param {number} max 最大值
 */
export function randN(max) {
	return Math.floor(Math.random() * max);
}

export function newUuid() {
	let s = randomString(36, 16).split("");
	s[14] = "4";
	s[19] = ((+s[19] & 0x3) | 0x8).toString(16);
	s[8] = s[13] = s[18] = s[23] = "";
	return s.join("");
}

/**
 * 如果是数组,则返回本身，否则返回 [ val ]
 * @template T
 * @param {T|T[]} val
 * @returns {T[]}
 * @example
 * toArray(null) // []
 * toArray([]) // []
 * toArray(1) // [1]
 */
export function arr(val) {
	if (val == null) return [];
	return typeof val != "string" && val.length ? Array.from(val) : [val];
}

/**
 * @template T
 * @param {T[]|T} arr
 * @returns {T}
 */
export function one(arr) {
	return Array.isArray(arr) ? arr[0] : arr;
}

/**
 * 将data数组的数据合并到list数组中
 * - 通常后端返回订单列表和用户列表，需要在订单列表中显示用户信息时处理数据使用
 * @deprecated 不常用
 * @param {any[]} list 订单列表
 * @param {any[]} data 用户列表
 * @param {string} key 合并后添加到list元素上的key
 * @param {string} [foreignKey] 订单列表中表示用户id的key,默认为 `${参数key}_id`
 * @example
 * leftJoin([{id: 1, user_id: 1}, {id: 2, user_id: 1}, {id: 2, user_id: 2}], [{id: 1, name: "a"}, {id: 2, name: "b"}], "user")
 * [{id: 1, user_id: 1, user: {id: 1, name: "a"}}, {id: 2, user_id: 1, user: {id: 1, name: "a"}}, {id: 2, user_id: 2, user: {id: 2, name: "b"}}]
 */
export function leftJoin(list, data, key, foreignKey) {
	foreignKey = foreignKey || key + "_id";
	let map = {};
	for (let item of data) {
		map[item.id] = item;
	}
	for (let item of list) {
		let id = item[foreignKey];
		item[key] = map[id] || {id};
	}
}

/**
 * 修改body, 去掉keys和undefine
 * - keys为数组时, 遍历keys, 并删除body[key]
 * - keys为对象时, 遍历body, 如果body[key]为undefine或body[key]等于keys[key]时, 删除body[key]
 * @template T
 * @param {T} body
 * @param {string[] | { [key: string]: any }} keys
 * @returns {T}
 * @example
 * clearKeys({a: 1, b: undefined, c: 2}, {a: 1, c: 3}) // {c: 2}
 */
export function clearKeys(body, keys) {
	if (keys instanceof Array) {
		// 清除keys中的字段
		for (let key of keys) {
			delete body[key];
		}
	} else {
		// 清除与keys值相同的字段
		for (let k in body) {
			let v = body[k];
			if (keys[k] == v || v === undefined || typeof v == "function") delete body[k];
		}
	}
	return body;
}

/**
 * 将news和body中的key相同的值复制到body中
 * @template T
 * @param {T} body
 * @param {any} news
 * @returns {T}
 */
export function copyKeys(body, news) {
	for (let k in news) {
		if (k in body) body[k] = news[k];
	}
	return body;
}

/**
 * 判断对象是否为空
 * @param {any} obj
 * @returns {boolean}
 * @example
 * isEmpty({}) // true
 * isEmpty({a: 1}) // false
 * isEmpty(null) // true
 */
export function isEmpty(obj) {
	if (!obj) return true;
	let ok = true;
	// eslint-disable-next-line no-unreachable-loop
	for (let _ in obj) {
		ok = false;
		break;
	}
	return ok;
}

const bs = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
/**
 * 字节数转换
 * @param {number} size
 * @param {number} [n=0] 保留几位小数, 负数表示去掉小数末尾的0
 * @param {number} [i=0] 参数size的单位是什么,0-3 对应 b/kb/mb/gb
 * @returns {string}
 * @example
 * byteSize(1024) // 1KB
 * byteSize(1024, 2) // 1.00KB
 */
export function traffic(size, n = 2, i = 0) {
	size = parseFloat(size);
	if (isNaN(size)) return "";
	for (; i < bs.length; i++) {
		if (size < 1024) {
			break;
		}
		size /= 1024;
	}
	n = Math.abs(n);
	if (size < 1 && !n) n = n + 1;
	size = size.toFixed(n);
	if (n < 0) size = +size;
	return size + bs[i];
}

/**
 * 小数转百分比,不包含%
 * @deprecated 已废弃,请使用 +(v*100).toFixed(n)+"%"
 * @param {number} v
 * @param {number} [n=0] 保留几位小数 100为两位
 * @returns {number}
 */
export function percent(v, n) {
	return Math.floor(v * 100 * n) / n;
}

/**
 * 防抖 间隔时间内的重复调用只有最后一次生效
 * @template T
 * @param {T} fn
 * @param {number} [delay=300]
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: debounce(function() {
 * 		console.log('哼,你不停我就不触发')
 * 	}, 300)
 * }
 */
export function debounce(fn, delay = 300) {
	const k = Symbol("timer");
	var timer;
	let pms = newPromise();
	return function () {
		var args = arguments;
		clearTimeout(this == null ? timer : this[k]);
		timer = setTimeout(() => {
			pms.resolve(fn.apply(this, args));
			pms = newPromise();
		}, delay);
		if (this) this[k] = timer;
		return pms;
	};
}

/**
 * 节流 每隔一段时间只能调用一次
 * - 第一次不用等待
 * - 最后一次可能被忽略
 * @template T
 * @param {T} fn
 * @param {number} [delay=300]
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: throttle(function() {
 * 		console.log('已经冷落你超过5秒了,让你触发一次吧')
 * 	}, 5000)
 * }
 */
export function throttle(fn, delay = 300) {
	let valid = true;
	return function () {
		var args = arguments;
		if (!valid) {
			// 休息时间
			return;
		}
		// 工作时间，执行函数并且在间隔期内把状态位设为无效
		valid = false;
		fn.apply(this, args);
		setTimeout(() => {
			valid = true;
		}, delay);
	};
}

/**
 * 节流 每隔一段时间只能调用一次
 * - 第一次不用等待
 * - 最后一次不会被忽略
 * @template T
 * @param {T} fn
 * @param {number} [delay=300]
 * @returns {T}
 **/
export function throttle2(fn, delay = 300) {
	let valid = true;
	let args;
	return function () {
		args = arguments;
		if (!valid) {
			// 休息时间
			return;
		}
		// 工作时间，执行函数并且在间隔期内把状态位设为无效
		valid = false;
		fn.apply(this, args);
		args = null;
		setTimeout(() => {
			valid = true;
			if (args) {
				fn.apply(this, args);
				args = null;
			}
		}, delay);
	};
}

/**
 * promise没有返回之前，重复调用只返回首次调用的结果
 * @template {{(...args:any[])=>Promise<any>}}T
 * @param {T} fn
 * @param {string} [key] 执行过程中设置this[key]为true，执行完毕后设置为false, 不传则不设置
 * - 通常用于显示loading动画
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: onlyone(function() {
 * 		console.log('我手里有事,别找我')
 * 	}
 * }
 */
export function onlyone(fn, key) {
	let pms = null;
	return function () {
		if (!pms) {
			pms = fn.apply(this, arguments).finally(() => {
				pms = null;
				if (key) this[key] = false;
			});
		}
		if (key) this[key] = true;
		return pms;
	};
}

/**
 * 缓存promise,只返回第一次成功调用的结果
 * @template T
 * @param {T} fn
 * @returns {T&{reset:()=>void}}
 */
export function cacheone(fn) {
	let pms = null;
	let nfn = function () {
		if (pms == null) {
			pms = fn.apply(this, arguments);
			if (pms && typeof pms.catch === "function") pms.catch(() => (pms = null));
		}
		return pms;
	};
	nfn.reset = () => (pms = null);
	return nfn;
}

/**
 * 依次执行函数，上一个promise返回或出错后执行下一个
 * @template {{(...args:any[])=>Promise<any>}} T
 * @param {T} fn
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: synchronized(function() {
 * 		console.log('稍等一下,请排好队')
 * 	}
 * }
 */
export function synchronized(fn) {
	let pms = Promise.resolve();
	return function () {
		let p = pms.then(() => fn.apply(this, arguments));
		pms = p.catch(() => 0);
		return p;
	};
}

/**
 * 控制并发数量
 * @template {{(...args:any[])=>Promise<any>}} T
 * @param {T} fn
 * @returns {T}
 * @example
 * template: `<div @click="onclick">你点我呀</div>`,
 * methods: {
 * 	onclick: thread_pool(function() {
 * 		console.log('稍等一下,请排好队')
 * 	}, 3)
 * }
 */
export function thread_pool(fn, max = 5) {
	let arr = new Set();
	return async function () {
		while (arr.size >= max) {
			await Promise.race(arr).catch(() => {});
		}
		let p = Promise.resolve().then(() => fn.apply(this, arguments));
		arr.add(p);
		return p.finally(() => {
			arr.delete(p);
		});
	};
}

/**
 * 重试
 * @template {{(...args:any[])=>Promise<any>}} T
 * @param {T} fn
 * @param {number} [times=3] 重试次数
 * @param {number} [ms=1e3] 重试间隔时间(毫秒)
 * @returns {T}
 */
export function retry(fn, times = 3, ms = 1e3) {
	return function () {
		let n = times;
		let args = arguments;
		const call = () => {
			n--;
			try {
				let ret = fn.apply(this, args);
				if (n >= 0 && ret && typeof ret.then === "function")
					return ret.catch(() => sleep(ms).then(call));
				return ret;
			} catch (error) {
				if (n < 0) throw error;
				return call();
			}
		};
		return call();
	};
}

/**
 * @template T
 * @param {()=>T} mapFn
 * @returns {(key:string)=>T}
 */
export function mapFunction(mapFn) {
	const lock = new Map();
	return function (key) {
		let fn = lock.get(key);
		if (!fn) {
			fn = mapFn();
			lock.set(key, fn);
		}
		return fn;
	};
}

/**
 * 生成装饰器
 * @deprecated 不常用
 * @template {{(...args:any[])=>any}} F
 * @param  {((k:F)=>F)[]} list
 * @returns {(target: any, propertyKey: any, descriptor: any) => void}
 */
export function useDecorator(...list) {
	if (!list.length) return function () {};
	return function (target, propertyKey, descriptor) {
		let fn = descriptor.value;
		list.forEach((x) => (fn = x(fn)));
		descriptor.value = fn;
	};
}

/**
 * 字符串转UTF8编码数据
 * @param {string} input
 * @returns {Uint8Array}
 */
export function fromUtf8(input) {
	const bytes = [];
	for (let i = 0, len = input.length; i < len; i++) {
		const value = input.charCodeAt(i);
		if (value < 0x80) {
			bytes.push(value);
		} else if (value < 0x800) {
			bytes.push((value >> 6) | 0b11000000, (value & 0b111111) | 0b10000000);
		} else if (
			i + 1 < input.length &&
			(value & 0xfc00) === 0xd800 &&
			(input.charCodeAt(i + 1) & 0xfc00) === 0xdc00
		) {
			const surrogatePair =
				0x10000 + ((value & 0b1111111111) << 10) + (input.charCodeAt(++i) & 0b1111111111);
			bytes.push(
				(surrogatePair >> 18) | 0b11110000,
				((surrogatePair >> 12) & 0b111111) | 0b10000000,
				((surrogatePair >> 6) & 0b111111) | 0b10000000,
				(surrogatePair & 0b111111) | 0b10000000
			);
		} else {
			bytes.push(
				(value >> 12) | 0b11100000,
				((value >> 6) & 0b111111) | 0b10000000,
				(value & 0b111111) | 0b10000000
			);
		}
	}

	return Uint8Array.from(bytes);
}

/**
 * UTF8编码数据转字符串
 * - web端推荐用 TextDecoder
 * @param {Uint8Array} input
 * @returns {string}
 */
export function toUtf8(input) {
	let decoded = "";
	for (let i = 0, len = input.length; i < len; i++) {
		const byte = input[i];
		if (byte < 0x80) {
			decoded += String.fromCharCode(byte);
		} else if (byte >= 0b11000000 && byte < 0b11100000) {
			const nextByte = input[++i];
			decoded += String.fromCharCode(((byte & 0b11111) << 6) | (nextByte & 0b111111));
		} else if (byte >= 0b11110000 && byte < 0b101101101) {
			const surrogatePair = [byte, input[++i], input[++i], input[++i]];
			const encoded = "%" + surrogatePair.map((byteValue) => byteValue.toString(16)).join("%");
			decoded += decodeURIComponent(encoded);
		} else {
			decoded += String.fromCharCode(
				((byte & 0b1111) << 12) | ((input[++i] & 0b111111) << 6) | (input[++i] & 0b111111)
			);
		}
	}

	return decoded;
}

/**
 * 检查文件名重复并返回新的文件名
 * @param {string} name 文件名
 * @param {Set<string>|string[]} names 已存在的文件名集合或数组
 * @param {(s:string)=>string} [fn] 旧文件名转新文件名的函数, 默认返回`${name}(${index++})`
 * - 请不要用类似 s => s 这样的函数，它会导致死循环
 * @returns {string} 新文件名
 * @example
 * const newName = checkName('a.txt', ['a.txt', 'a(1).txt']);
 * console.log(newName); // a(2).txt
 */
export function checkRename(name, names, fn) {
	let nameset = Array.isArray(names) ? new Set(names) : names;
	if (!fn)
		fn = (s) =>
			s.replace(
				/(\(\d+\))?(\.\w+)?$/,
				(_, x, ext) => (x ? `(${parseInt(x.slice(1)) + 1})` : `(1)`) + (ext || "")
			);
	let n = 10000;
	while (nameset.has(name) && n--) name = fn(name);
	if (!n) throw new Error("checkRename过多,是否fn函数有问题?");
	return name;
}

/**
 * 创建一个Promise实例，可以在在外部调用resolve或reject
 * @template [T=any]
 * @param {(resolve:(v?:T)=>void, reject:(r?:any)=>void)=>void} [fn]
 * @return {IPromise<T>}
 * @example
 * const p = createPromise()
 * p.then(()=>{
 *  console.log('resolved');
 * });
 * // 其他地方
 * console.log(p.pending, p.resolved, p.rejected) // 判断Promise状态
 * setTimeout(()=>p.resolve(), 1000);
 */
export function newPromise(fn) {
	let a, b;
	var tmp = {
		resolve(x) {
			if (this.pending) {
				a(x);
				this.resolved = true;
				this.pending = false;
			}
		},
		reject(e) {
			if (this.pending) {
				b(e);
				this.rejectd = true;
				this.pending = false;
			}
		},
		pending: true,
		resolved: false,
		rejected: false,
	};
	/** @type {Promise<T>} */
	var pms = new Promise(function (resolve, reject) {
		a = resolve;
		b = reject;
		if (fn) fn(tmp.resolve, tmp.reject);
	});
	return Object.assign(pms, tmp);
}

/**
 * 创建一个取消令牌,可用于取消axios请求
 * @example
 * var token = newCancelToken();
 * axios.get('/user/12345', {
 * 	cancelToken: token,
 * }).catch(function (thrown) {
 * });
 * // 取消请求 (message 参数是可选的)
 * token.cancel('Operation canceled by the user.');
 */
export function newCancelToken() {
	/** @type {(msg:string)=>void} */
	let cancel;
	let token = {
		reason: null,
		throwIfRequested() {
			if (this.reason) throw this.reason;
		},
	};
	let promise = new Promise((resolve, reject) => {
		cancel = (message) =>
			resolve((token.reason = {code: "ERR_CANCELED", name: "CanceledError", message}));
	});
	return {token: Object.assign(token, {promise}), cancel};
}

/**
 * 判断按键是否用于输入文本
 * - Nice: http://unixpapa.com/js/key.html
 * @param {{keyCode:number;ctrlKey?:boolean;metaKey?:boolean;altKey?:boolean;}} e
 * @returns {boolean}
 */
export function isIntendToInput(e) {
	if (e.ctrlKey || e.metaKey || e.altKey) return false;

	// a-zA-Z
	if (e.keyCode >= 65 && e.keyCode <= 90) return true;

	// 0-9 以及其上面的符号
	if (e.keyCode >= 48 && e.keyCode <= 57) return true;

	// 小键盘区域 (除回车外)
	if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

	// 小键盘区域 (除回车外)
	// @yinheli from pull request
	if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

	// 输入法
	if (e.keyCode == 229 || e.keyCode === 0) return true;

	return false;
}

/**
 * 检查是否国内手机号码
 * @param {string} phone
 * @returns {boolean}
 */
export function isChineseMobilePhone(phone) {
	return /^([1-9]{1,3}-)?1[3-9][0-9]{9}$/.test(phone);
}

/**
 * 判断是否邮箱格式，不支持中文邮箱
 * @param {string} email
 * @returns {boolean}
 */
export function isEmail(email) {
	return /^[\w-]+@[\w-]+(\.[\w-]+)+$/.test(email);
}

/**
 * 检查字符串是否是有效的UTF-8编码
 * @param {string} str
 * @returns {boolean}
 */
export function isValidUtf8Character(str) {
	// 匹配允许的字符范围：
	// 1. 空格 (\x20), 制表符 (\t), 换行符 (\n), 回车符 (\r), 垂直制表符 (\v), 换页符 (\f)
	// 2. 可打印字符：从 U+0020 (空格) 到 U+007E (~)
	// 3. 允许其他有效的 Unicode 字符：从 U+00A0 到 U+10FFFF
	return !/[\u0000-\u0007\u000B\u000E-\u001F\uD800-\uDFFF]/.test(str);
}
/**
 * 隐藏手机号中间4位
 * @deprecated 已废弃，请使用{@link limit}
 * @param {string} phone
 * @returns {string}
 */
export function hidePhone(phone) {
	return (
		phone &&
		phone.replace(/^([1-9]{1,3}-)?1[3-9][0-9]{9}$/, (x) => `${x.slice(0, 3)}****${x.slice(7)}`)
	);
}

const console_waitUntil = cacheFirst((e) => console.error("waitUntil", e));
/**
 * 等待直到某个条件成立或者超时
 * @template T
 * @param {()=>T} fn 要检查的函数,返回值为真则结束等待
 * @param {number} [timeout=10e3]
 * @param {number} [freq=1e3]
 * @returns {Promise<Awaited<T>>} fn的返回值
 * @example
 * await waitUntil(()=>document.querySelector('#app'), 10e3);
 * console.log("app加载完成");
 */
export async function waitUntil(fn, timeout = 10e3, freq = 1e3) {
	let start = Date.now();
	while (true) {
		try {
			let ret = await fn();
			if (ret) return ret;
		} catch (err) {
			console_waitUntil(err);
		}
		if (Date.now() - start > timeout) break;
		await sleep(freq);
	}
}

/**
 * 简单加密数据,防麻瓜不防猴子
 * @param {string} text 文本
 * @param {string} key 密码
 * @returns {string}
 */
export function encrypto(text, key) {
	key += "";
	var i = 0;
	var j = 0;
	var list = Array.from(text);
	while (i < text.length) {
		list[i++] = String.fromCharCode(text.charCodeAt(i - 1) ^ key.charCodeAt(j++ % key.length));
	}
	return btoa(list.join(""));
}

/**
 * 解密简单加密的数据
 * @param {string} text 文本
 * @param {string} key 密码
 * @returns {string}
 */
export function decrypto(text, key) {
	return atob(encrypto(atob(text), key));
}

/**
 * 生成svg图片的DataURL
 * @param {string} svg svg内容,可以是<svg>标签或者<svg>的内容
 * @param {Size} [size] svg的尺寸,当svg是<svg>的内容时生效
 * @returns {string}
 * @example
 * const svg = `<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"/></svg>`;
 * const image = document.createElement('img');
 * image.src = svgToDataURL(svg);
 * document.body.appendChild(image);
 */
export function svg2dataurl(svg, size) {
	if (!/^<svg/.test(svg)) {
		size = Object.assign({width: 1000, height: 1000}, size);
		svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${
			size.w || size.width
		}" height="${size.h || size.height}" viewBox="0 0 ${size.width} ${size.height}">${svg}</svg>`;
	}
	return `data:image/svg+xml;utf8,${svg
		.replace(/>\s+</g, "><")
		.replace(/\r?\n/g, "")
		.replace(/%/g, "%25")
		.replace(/#/g, "%23")}`;
}

/**
 * 从数组中随机抽取一个元素
 * @template T
 * @param {T[]} list
 * @returns {T} 抽取的元素,如果没有元素则返回undefined
 */
export function randPick(list) {
	return list[Math.floor(Math.random() * list.length)];
}

/**
 * 获取向量(a,b)逆时针旋转的角度
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 * @example
 * getAngle({x:0,y:0}, {x:1,y:0}) //=> 0
 * getAngle({x:0,y:0}, {x:1,y:1}) //=> 45
 * getAngle({x:0,y:0}, {x:0,y:1}) //=> 90
 * getAngle({x:0,y:0}, {x:-1,y:1}) //=> 135
 * getAngle({x:0,y:0}, {x:-1,y:0}) //=> 180
 * getAngle({x:0,y:0}, {x:-1,y:-1}) //=> 225
 * getAngle({x:0,y:0}, {x:0,y:-1}) //=> 270
 * getAngle({x:0,y:0}, {x:1,y:-1}) //=> 315
 */
export function getAngle(a, b) {
	let angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
	return angle < 0 ? angle + 360 : angle;
}

/**
 * 获取a,b两点之间的距离
 * @param {Point} a 点a
 * @param {Point} b 点b
 * @returns {number}
 */
export function getDistance(a, b) {
	if (!a && !b) return 0;
	if (!b) return Math.sqrt(a.x * a.x + a.y * a.y);
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * 获取touch状态
 * @param {TouchList} touches
 */
export function touchStatus(touches) {
	if (touches.length < 1)
		return {
			x: 0,
			y: 0,
			angle: 0,
			distance: 0,
			length: touches.length,
		};
	if (touches.length < 2) {
		return {
			x: touches[0].clientX,
			y: touches[0].clientY,
			angle: 0,
			distance: 0,
			length: touches.length,
		};
	}
	let a = touches[0];
	let b = touches[1];
	return {
		x: (a.clientX + b.clientX) / 2,
		y: (a.clientY + b.clientY) / 2,
		angle: getAngle(a, b),
		distance: Math.sqrt(Math.pow(b.clientX - a.clientX, 2) + Math.pow(b.clientY - a.clientY, 2)),
		length: 2,
	};
}

/**
 * 通过svg字符串获取svg大小
 * @param {string} svg
 * @returns {Size}
 * @example
 * getSvgSize(`<svg width="100" height="100"></svg>`) //=> {width: 100, height: 100}
 */
export function getSvgSize(svg) {
	let m = /<svg[^>]+>/.exec(svg);
	svg = m && m[0];
	m = /width=['"]([^'"]+)['"]/.exec(svg);
	let width, height, viewBox;
	if (m) {
		width = parseFloat(m[1]);
	} else {
		width = 0;
	}
	m = /height=['"]([^'"]+)['"]/.exec(svg);
	if (m) {
		height = parseFloat(m[1]);
	} else {
		height = 0;
	}
	if (width && height) return {width, height};
	m = /viewBox=['"]([^'"]+)['"]/.exec(svg);
	if (m) {
		viewBox = m[1].split(/\s+/).map((x) => parseFloat(x));
		if (viewBox.length === 4) {
			if (width) {
				height = (viewBox[3] * width) / viewBox[2];
			} else if (height) {
				width = (viewBox[2] * height) / viewBox[3];
			} else {
				width = viewBox[2];
				height = viewBox[3];
			}
		}
	}
	return {width, height};
}

/**
 * 修改svg大小
 * @param {string} svg
 * @param {Size} size
 * @returns {string}
 * @example
 * setSvgSize(`<svg width="100" height="100"></svg>`, {width: 200, height: 200}) //=> `<svg width="200" height="200"></svg>`
 */
export function setSvgSize(svg, size) {
	return svg.replace(/<svg([^>]+)>/, function (x0, attrs) {
		let flag = false;
		attrs = attrs.replace(/width=['"]([^'"]+)['"]/, function (w) {
			flag = true;
			return `width="${size.width}"`;
		});
		if (!flag) attrs += ` width="${size.width}"`;
		flag = false;
		attrs = attrs.replace(/height=['"]([^'"]+)['"]/, function (h) {
			flag = true;
			return `height="${size.height}"`;
		});
		if (!flag) {
			attrs += ` height="${size.height}"`;
		}
		return `<svg${attrs}>`;
	});
}

/**
 * 将数值限制在 [min, max] 之间
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @example
 * clamp(0, 1, 2) //=> 1
 * clamp(1, 1, 2) //=> 1
 * clamp(2, 1, 2) //=> 2
 * clamp(3, 1, 2) //=> 2
 * clamp(1.5, 1, 2) //=> 1.5
 */
export function clamp(value, min, max) {
	return min < max
		? value < min
			? min
			: value > max
			? max
			: value
		: value < max
		? max
		: value > min
		? min
		: value;
}

/**
 * 创建一个速度计算器,通常用于计算最近一段时间的速度
 * @param {number} [ms=300] 时间间隔
 * @example
 * let speed = newSpeedCounter();
 * setInterval(() => {
 * 	// 每下载到一些数据,就push到speed中
 *  speed.push(Math.random()*10);
 * 	console.log(speed.get());
 * }, 5);
 */
export function newSpeedCounter(ms = 1e3) {
	/** @type {{v:number;t:number}[]} */
	let list = [];
	function clear() {
		let now = Date.now();
		while (list.length > 0 && now - list[0].t > ms) list.shift();
	}
	/**
	 * @param {number} v
	 */
	function push(v) {
		clear();
		if (v) list.push({v, t: Date.now()});
	}
	/**
	 * 计算ms时间内已有的总流量
	 */
	function sum() {
		clear();
		return list.reduce((a, b) => a + b.v, 0);
	}
	/**
	 * 预计ms的速度
	 */
	function speed() {
		clear();
		let duration = list.length > 0 ? list[list.length - 1].t - list[0].t : 0;
		duration = duration > 0 ? duration : ms;
		let s = (sum() * ms) / duration;
		return s;
	}
	/**
	 * 超出限制的等待时间
	 */
	function waitTime() {
		let t = list.length > 0 ? list[list.length - 1].t : Date.now();
		return ms - (Date.now() - t);
	}
	return {push, speed, sum, waitTime};
}

/**
 * 传入一个返回Promise的函数fn,生成一个带缓存的函数
 * - 如果没有缓存或缓存过期，则调用fn获取数据
 * - 如果有缓存则返回缓存
 * - 调用新函数时第一个参数会作为缓存的key
 * - 调用新函数时传入参数大于1则禁用缓存,直接调用fn
 * - 注意fn的第一个参数必须是string或number,否则可能导致缓存错乱
 * @template {(...args:any[])=>any} T
 * @param {T} fn 缓存目标函数
 * @param {number} [maxAge=5e3] 最大缓存时间
 * @param {boolean} [autoExtend=true] 是否在访问缓存时自动延长过期时间
 * @returns {T&{reset:(key:any)=>void}} 返回一个带缓存功能的新函数
 * @example
 * const getOrders = cacheFirst((user_id) => axios.get(`/api/orders/${user_id}`));
 * getOrders(1); // 调用接口并生成缓存,缓存key为 1
 * getOrders(1); // 找到key为1的缓存,不调用接口直接返回缓存
 * getOrders(2); // 由于没有key为2的缓存,调用接口并生成缓存,缓存key为 2
 * getOrders(2, 'payed'); // 由于有两个参数,不查找缓存直接调用接口,不会生成缓存
 */
export function cacheFirst(fn, maxAge = 5e3, autoExtend = true) {
	let cache = new Map();
	let expire = new Map();
	const fn1 = function (key) {
		if (
			Array.from(arguments)
				.slice(1)
				.filter((x) => x != null).length
		)
			return fn.apply(this, arguments);
		let t = expire.get(key) || 0;
		if (t < Date.now()) {
			let pms = fn.call(this, key);
			if (pms && typeof pms.catch === "function")
				pms.catch(() => {
					if (cache.get(key) == pms) {
						cache.delete(key);
						expire.delete(key);
					}
				});
			cache.set(key, pms);
			expire.set(key, Date.now() + maxAge);
			return pms;
		}
		if (autoExtend) {
			expire.set(key, Date.now() + maxAge);
		}
		return cache.get(key);
	};
	return Object.assign(fn1, {
		reset(key) {
			expire.delete(key);
			cache.delete(key);
		},
	});
}

/**
 * 判断一个浮点数是否为0
 * - 如果 float 的绝对值小于 1e-10，则返回 true。
 * @param float - 要检查的数字。
 */
export function isZero(float) {
	return Math.abs(float) < 1e-10;
}

/**
 * 深度优先遍历对象
 * @param {string} [key]
 * @returns
 */
export function makeDFS(key = "children") {
	/**
	 * @template T
	 * @param {T|T[]} node
	 * @param {(node:T,pnode:T)=>void} fn
	 * @param {T} [parent]
	 * @returns
	 */
	return function dfs(node, fn, parent) {
		if (!node) return;
		if (Array.isArray(node)) {
			node.forEach((item) => {
				dfs(item, fn, parent);
			});
		} else {
			fn(node, parent);
			dfs(node[key], fn, node);
		}
	};
}

/**
 * 类似 string.replace, 但支持Promise
 * @param {string} str
 * @param {RegExp} regex
 * @param {(...args:string[])=>Promise<string>} fn
 * @returns
 */
export function asyncReplace(str, regex, fn) {
	let all = [];
	let cache = new Map();
	str.replace(regex, function (x0) {
		if (cache.has(x0)) return;
		cache.set(x0, true);
		all.push(
			Promise.resolve()
				.then(() => fn.apply(null, arguments))
				.then((x) => cache.set(x0, x))
		);
	});
	return Promise.all(all).then(function () {
		return str.replace(regex, function (x0) {
			return cache.get(x0);
		});
	});
}

/**
 * https://medium.com/@andrew.buntsev/javascript-string-memory-leak-48681fb39c0b
 * 通过生成新的string, 修复 sliced string 导致的内存泄漏
 * @param {string} s
 * @returns {string}
 */
export function copyString(s) {
	if (s.length < 128) return s;
	return s[0] + s.slice(1);
}

/**
 * 解析xml字符串
 * @typedef {{nodeName:string;attrs:{[key:string]:string};childNodes:(parseXMLNode|string)[]}} parseXMLNode
 *
 * @param {string} xml
 * @returns {parseXMLNode}
 * @example
 * parseXML('<a src="124" type="txt"><b mode="123">1</b><b mode="456">2</b></a>')
 * // [{nodeName:'a',attrs:{src:'124',type:'txt'},childNodes:[{nodeName:'b',attrs:{mode:'123'},childNodes:['1']},{nodeName:'b',attrs:{mode:'456'},childNodes:['2']}]}]
 **/
export function parseXML(xml) {
	let tree = [];
	let reg = /<([^\s>]+)([^>]*)>/g;
	let m = reg.exec(xml);
	let prev;
	let stack = [];
	while (m) {
		let value = xml.slice(prev ? prev.index + prev[0].length : 0, m.index);
		if (!(stack.length && stack[stack.length - 1].isPre)) value = value.trim();
		if (value) {
			let node = copyString(value);
			if (stack.length === 0) tree.push(node);
			else stack[stack.length - 1].childNodes.push(node);
		}
		let [, nodeName, text] = m;
		if (nodeName.endsWith("/") && !text) {
			nodeName = nodeName.slice(0, -1);
			text = "/";
		}
		if (nodeName[0] === "/") {
			while (stack.length) {
				let node = stack.pop();
				if (stack.length === 0) tree.push(node);
				else stack[stack.length - 1].childNodes.push(node);
				if (node.nodeName == nodeName.slice(1)) break;
				console.warn(`xml格式错误,${node.nodeName}与${nodeName}不匹配`);
			}
		} else {
			let attrs = decodeAttribute(text, true);
			for (let key in attrs) {
				attrs[key] = copyString(attrs[key]);
			}
			nodeName = copyString(nodeName);
			if (text[text.length - 1] === "/" || nodeName.toLowerCase() == "br") {
				let node = {nodeName, attrs, childNodes: []};
				if (stack.length === 0) tree.push(node);
				else stack[stack.length - 1].childNodes.push(node);
			} else {
				let isPre = false;
				if (/white-space:\s*pre/.test(attrs.style)) isPre = true;
				if (!/white-space:/.test(attrs.style) && stack.length && stack[stack.length - 1].isPre)
					isPre = true;
				stack.push({nodeName, attrs, childNodes: [], isPre});
			}
		}
		prev = m;
		m = reg.exec(xml);
	}
	let value = xml.slice(prev ? prev.index + prev[0].length : 0).trim();
	if (value) {
		let node = copyString(value);
		if (stack.length === 0) tree.push(node);
		else stack[stack.length - 1].childNodes.push(node);
	}
	while (stack.length) {
		let node = stack.pop();
		if (stack.length === 0) tree.push(node);
		else stack[stack.length - 1].childNodes.push(node);
	}
	return tree;
}

/**
 * 生成xml字符串
 * @param {parseXMLNode} xml
 **/
export function stringifyXML(xml) {
	if (!xml) return "";
	if (typeof xml === "string") return xml;
	if (Array.isArray(xml)) return xml.map(stringifyXML).join("");
	let {nodeName, attrs, childNodes} = xml;
	if (!nodeName) return stringifyXML(childNodes);
	let str = `<${nodeName}`;
	for (let key in attrs) {
		str += ` ${key}="${encodeHTML(attrs[key])}"`;
	}
	str += ">";
	str += stringifyXML(childNodes);
	str += `</${nodeName}>`;
	return str;
}

/**
 * @param {Uint8Array} buf
 * @param {number} offset
 */
export function getDWORD(buf, offset) {
	return buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16) | (buf[offset + 3] << 24);
}

/**
 * @param {Uint8Array} buf
 * @param {number} offset
 * @param {number} value
 */
export function setDWORD(buf, offset, value) {
	buf[offset] = value & 0xff;
	buf[offset + 1] = (value >> 8) & 0xff;
	buf[offset + 2] = (value >> 16) & 0xff;
	buf[offset + 3] = (value >> 24) & 0xff;
}

/**
 * 修复错误的bmp图片
 * @param {Uint8Array} buf
 */
export function fixBMP(buf) {
	if (!buf || buf.length < 54) return;
	if (buf[0] === 0x42 && buf[1] === 0x4d) {
		let out;
		let offset = getDWORD(buf, 10);
		let dibSize = getDWORD(buf, 14);
		let len = 14 + dibSize;
		if (offset < len) {
			if (getDWORD(buf, 30) == 3) {
				out = new Uint8Array(buf.length - 12);
				out.set(buf.slice(0, len), 0);
				out.set(buf.slice(len + 12), len);
				setDWORD(out, 30, 0);
			} else {
				out = buf;
			}
			setDWORD(out, 2, out.length);
			setDWORD(out, 10, len);
		}
		return out;
	}
}

export function formatError(obj) {
	if (!obj) return obj;
	if (obj.stack) obj = obj.stack;
	let tmp = obj + "";
	if (typeof obj != "object" || !/\[object \w+\]/.test(obj)) obj = tmp;
	else {
		try {
			obj = JSON.stringify(obj);
		} catch (error) {
			if (typeof obj.msg === "string") return obj.msg;
			if (typeof obj.message === "string") return obj.message;
			if (typeof obj.error === "string") return obj.error;
			for (let k in obj) {
				let v = obj[k];
				if (typeof v === "string") return v;
			}
			for (let k in obj) {
				let v = obj[k];
				if (v && typeof v === "object") return formatError(v);
			}
		}
	}
	return obj + "";
}

/**
 * 匹配字符串
 * @param {string} str
 * @param {string[]} globs
 * @example
 * globMatch("chat.xxx.cn",["*.xxx.cn"]) // true
 * globMatch("chat.xxx.xxx.cn",["*.xxx.cn"]) // false
 * globMatch("xxx.chat.xxx.cn",["*.xxx.cn"]) // false
 * globMatch("xxx.chat.xxx.cn",["*.*.xxx.cn"]) // false
 */
export function globMatch(str, globs) {
	if (typeof globs === "string") globs = globs.split("|");
	let reg = globs.map((g) => g.replace(/\./g, "\\.").replace(/\*/g, "[^./]*")).join("|");
	return new RegExp(`^(${reg})$`).test(str);
}

/**
 * @template K
 * @template R
 */
export class CacheFunction {
	/**
	 * @param {{
	 * maxSize?:number;
	 * maxAge?:number;
	 * get?:(k:K)=>Promise<R>;
	 * set?:((k:K,v:R)=>Promise<void>);
	 * force?:boolean; // 即使value一样,set也会被调用
	 * }} [opt]
	 */
	constructor(opt) {
		this.map = new Map();
		this.opt = Object.assign({maxAge: 300e3, maxSize: 1000}, opt);
	}

	/**
	 * 获取缓存数据
	 * @param {K} key
	 * @returns {Promise<R>}
	 */
	get(key) {
		let cache = this.map.get(key);
		if (cache) {
			this.update0(key, cache);
			return Promise.resolve(cache.value);
		}
		let value = this.opt.get && this.opt.get(key);
		cache = this.set0(key, value);
		if (value && typeof value.then === "function")
			value.then((v) => {
				if (cache.value == value) cache.value = v;
			});
		return value;
	}

	/**
	 * 延长缓存时间
	 * @protected
	 */
	update0(key, cache) {
		if (!this.opt.maxAge) return;
		cache.time = Date.now();
		clearTimeout(cache.timer);
		cache.timer = setTimeout(() => {
			this.remove0(key);
		}, this.opt.maxAge);
	}

	/**
	 * 已知没有的情况下,设置缓存数据
	 * @protected
	 */
	set0(key, value) {
		if (this.map.size >= this.opt.maxSize) {
			let oldest = {time: Date.now()};
			for (let cache of this.map.values()) {
				if (cache.time < oldest.time) oldest = cache;
			}
			this.remove0(oldest.key);
		}
		let cache = {
			time: Date.now(),
			value,
			timer:
				this.opt.maxAge &&
				setTimeout(() => {
					this.map.delete(key);
				}, this.opt.maxAge),
		};
		this.map.set(key, cache);
		return cache;
	}

	/**
	 * 设置缓存数据
	 * @param {K} key
	 * @param {R} value
	 */
	async set(key, value) {
		let cache = this.map.get(key);
		if (cache) {
			// 缓存已存在
			if (this.opt.force || cache.value != value) {
				if (this.opt.set) await this.opt.set(key, value);
				cache.value = value;
			}
			this.update0(key, cache);
			return;
		}
		if (this.opt.set) await this.opt.set(key, value);
		this.set0(key, value);
	}

	/**
	 * 删除缓存数据
	 * @param {K} key
	 * @returns {Promise<R>}
	 */
	async remove(key) {
		if (this.opt.set) await this.opt.set(key);
		return this.remove0(key);
	}

	/**
	 * @protected
	 * @param {string} key
	 */
	async remove0(key) {
		let cache = this.map.get(key);
		if (!cache) return;
		clearTimeout(cache.timer);
		this.map.delete(key);
		return cache.value;
	}

	clear() {
		this.map.clear();
	}
}

/**
 * 将 1,3,5-8,10,12-15 转换为 [1,3,5,6,7,8,10,12,13,14,15]
 * @param {string} str
 * @returns {number[]}
 */
export function decodePage(str) {
	let arr = [];
	if (!str) return arr;
	str.split(",").forEach((item) => {
		let [start, end] = item.split("-");
		if (end) {
			for (let i = parseInt(start); i <= parseInt(end); i++) {
				arr.push(i);
			}
		} else {
			arr.push(parseInt(start));
		}
	});
	return arr;
}

/**
 * 将 [1,3,5,6,7,8,10,12,13,14,15] 转换为 1,3,5-8,10,12-15
 * @param {number[]} arr
 * @returns {string}
 */
export function encodePage(arr) {
	if (!arr || !arr.length) return "";
	arr = arr.sort((a, b) => a - b);
	let str = "";
	let start = arr[0];
	let end = start;
	for (let i = 1; i < arr.length; i++) {
		if (arr[i] === end + 1) {
			end = arr[i];
		} else {
			if (start === end) {
				str += start + ",";
			} else {
				str += start + "-" + end + ",";
			}
			start = arr[i];
			end = start;
		}
	}
	if (start === end) {
		str += start;
	} else {
		str += start + "-" + end;
	}
	return str;
}

/**
 * 将ocr识别的结果从上到下从左到右排序
 * @param {{rect:Point[]}[]} rects
 */
export function orderOcrLines(rects) {
	rects.forEach((x) => {
		x.height = x.rect[2].y - x.rect[1].y;
	});
	let lines = [];
	while (rects.length) {
		rects = rects.sort((a, b) => a.rect[0].y - b.rect[0].y || a.rect[0].x - b.rect[0].x);
		let prev = rects.shift();
		let line = [prev];
		while (rects.length) {
			let lefts = rects.filter(
				(l) =>
					// 在左侧
					prev.rect[0].x + Math.max(l.height, prev.height) / 2 > l.rect[1].x &&
					// 在同一行 (高度占比0.5以上)
					(Math.min(prev.rect[3].y, l.rect[2].y) - Math.max(prev.rect[0].y, l.rect[1].y)) /
						l.height >
						0.5
			);
			if (!lefts.length) break;
			lefts.sort((a, b) => a.rect[0].x - b.rect[0].x);
			let next = lefts.pop();
			let idx = rects.indexOf(next);
			if (idx >= 0) rects.splice(idx, 1);
			line.unshift(next);
			prev = next;
		}
		prev = line[line.length - 1];
		while (rects.length) {
			let rights = rects.filter(
				(r) =>
					// 在右侧
					r.rect[0].x + Math.max(r.height, prev.height) / 2 > prev.rect[1].x &&
					// 在同一行 (高度占比0.5以上)
					(Math.min(r.rect[3].y, prev.rect[2].y) - Math.max(r.rect[0].y, prev.rect[1].y)) /
						prev.height >
						0.5
			);
			if (!rights.length) break;
			rights.sort((a, b) => a.rect[0].x - b.rect[0].x);
			let next = rights.shift();
			let idx = rects.indexOf(next);
			if (idx >= 0) rects.splice(idx, 1);
			line.push(next);
			prev = next;
		}
		lines.push(line);
	}
	return lines;
}

export function strHash(s) {
	let hash = 0;
	for (let i = 0; i < s.length; i++) {
		hash += s.charCodeAt(i);
	}
	return hash;
}

export function getDayHour(ms, fixed = 0) {
	let year = ms / 365 / 86400e3;
	ms -= ~~year * 365 * 86400e3;
	let day = ms / 86400e3;
	ms -= ~~day * 86400e3;
	let hour = ms / 3600e3;
	ms -= ~~hour * 3600e3;
	let minute = ms / 60e3;
	ms -= ~~minute * 60e3;
	let second = ms / 1e3;
	let list = [];
	if (year >= 1) list.push((list.length ? +year.toFixed(fixed) : Math.floor(year)) + "年");
	if (day >= 1) list.push((list.length ? +day.toFixed(fixed) : Math.floor(day)) + "天");
	if (hour >= 1) list.push((list.length ? +hour.toFixed(fixed) : Math.floor(hour)) + "小时");
	if (minute >= 1) list.push((list.length ? +minute.toFixed(fixed) : Math.floor(minute)) + "分");
	if (second >= 1) list.push((list.length ? +second.toFixed(fixed) : Math.floor(second)) + "秒");
	return list.slice(0, 2).join("");
}

/**
 * 尝试将字符串转换为JSON对象
 * @param {string} str
 */
export function tryJSON(str) {
	if (typeof str === "string") {
		try {
			return JSON.parse(str);
		} catch (e) {}
	}
	return str;
}

/**
 * 匹配后面的字符串,支持普通字符串和引号转义的字符串
 * @param {string} s
 * @param {string} [quotation='"']
 * @returns {{value:string;next:string}}
 */
export function matchString(s, rules = [{c: '"', t: "\\"}]) {
	s = s.trimStart();
	if (!s) return {value: "", next: ""};
	let c = s[0];
	for (let rule of rules) {
		if (rule.c == c) {
			s = s.slice(1);
			const reg = new RegExp(`(${rule.t.replace(/\\/, "\\\\")}*)${c}`, "g");
			let value = s;
			let next = "";
			while (true) {
				let m = reg.exec(value);
				if (!m) break;
				if ((m[1].length & 1) == 0) {
					value = s.slice(0, m.index).replaceAll(rule.t + rule.c, rule.c);
					next = s.slice(m.index + 1);
					break;
				}
			}
			return {value, next};
		}
	}
	// 不是引号开头
	let m = /\s/.exec(s);
	if (m) {
		return {value: s.slice(0, m.index), next: s.slice(m.index)};
	}
	return {value: s, next: ""};
}

/**
 * 大驼峰
 * @param {string} name
 */
export function CamelCase(name) {
	return name.replace(/^(\w)|[_-](\w)/g, (x0, x1, x2) => (x1 || x2).toUpperCase());
}

/**
 * 小驼峰
 * @param {string} name
 */
export function camelCase(name) {
	return name.replace(/[_-](\w)/g, (x0, x1) => x1.toUpperCase());
}

/**
 * 转换为str
 * @param {any} x
 * @param {string} [def]
 */
export function str(x, def) {
	return x == null ? def : x + "";
}

/**
 * 将字符串转换为search对象
 * @param {string} s
 * @returns {any}
 */
export function decodeSearch(s) {
	let next = s.trim();
	let obj = {};
	while (next) {
		let m = /^([^\s=]+)=/.exec(next);
		if (!m) break;
		let [all, key] = m;
		next = next.slice(all.length);
		let r = next[0] == " " ? {value: "", next} : matchString(next);
		obj[key] = r.value;
		next = r.next.trim();
	}
	if (next) {
		obj.keyword = next.trim();
	}
	return obj;
}

/**
 * 将search对象转换为字符串
 * @param {any} obj
 */
export function encodeSearch(obj) {
	if (!obj) return "";
	let s = "";
	let {keyword, ...rest} = obj;
	for (let key in rest) {
		let value = obj[key];
		if (value.indexOf(" ") >= 0) value = JSON.stringify(value);
		s += `${key}=${value} `;
	}
	if (keyword) s += keyword;
	return s.trim();
}

export function decodeVersion(version) {
	if (typeof version === "number") return version;
	let [major, minor, patch] = version.split(".");
	return parseInt(major) * 1000000 + parseInt(minor) * 1000 + parseInt(patch);
}

export function encodeVersion(x) {
	return Math.floor(x / 1000000) + "." + Math.floor((x % 1000000) / 1000) + "." + (x % 1000);
}

/**
 * 计算签名
 * @param {any} data
 * @param {string} key
 * @returns
 */
export function signStr(data, key) {
	var keys = Object.keys(data).sort();
	var s = "";
	for (let k of keys) {
		if (k == "sign") continue; // 签名不参与签名计算
		let v = data[k];
		if (v == null || typeof v === "function") continue;
		v = typeof v === "object" ? JSON.stringify(v) : v + ""; // 转换为字符串
		if (v) s += k + "=" + v + "&";
	}
	s += "key=" + key;
	// console.log(s);
	return s;
}

/**
 * 去重
 * @template T
 * @param {T[]} arr
 * @returns {T[]}
 */
export function distinct(arr) {
	return Array.from(new Set(arr));
}

export function isColor(str) {
	return /^(#[\da-fA-F]{3,8}|rgba?\(\d+(\s*,\s*[\d\.]+){2,3}\))$/.test(str);
}

/**
 * 按比例随机选取
 * @param {any[]} list
 * @param {string|(item:any)=>number} [key] null表示直接使用item, string表示使用item[key], function表示使用key(item)
 */
export function randomPick(list, key) {
	let fn = key == null ? (item) => item : typeof key === "string" ? (item) => item[key] : key;
	let total = 0;
	for (let item of list) {
		total += fn(item);
	}
	let r = Math.random() * total;
	for (let item of list) {
		let v = fn(item);
		if (r < v) return item;
		r -= v;
	}
	return list[list.length - 1];
}

/**
 * 解析URL
 * @param {string} url
 */
export function parseURL(url) {
	let m = /^(\w+:)\/\/([^@]+@)?([^:/]+|\[[0-9a-fA-F:]+\])(:\d+)?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/.exec(
		url.trim()
	);
	if (!m) return null;
	let [href, protocol, password, host, port, path, search, hash] = m;
	// 处理IPv6
	if (host.startsWith("[") && host.endsWith("]")) host = host.slice(1, -1);
	if (password) password = password.slice(0, -1);
	if (port) port = port.slice(1);
	if (!search) search = "";
	if (!hash) hash = "";
	if (!path) path = "";
	return {href, protocol, password, host, port, path, search, hash};
}

/**
 * 将 1,4~8 转换为 [1,4,5,6,7,8]
 * @param {string} str
 */
export function parseRange(str) {
	let list = [];
	if (!str) return list;
	for (let s of str.split(/[^\d~-]+/)) {
		let m = /(\d+)(?:[~|-](\d+))?/.exec(s);
		if (!m) continue;
		let [, start, end] = m;
		start = parseInt(start);
		end = end ? parseInt(end) : start;
		for (let i = start; i <= end; i++) {
			list.push(i);
		}
	}
	return list;
}

/**
 * 合并运行
 * @template T
 * @template R
 */
export class MergeRunner {
	/**
	 * @param {(list:T[],map:Map<T,R>)=>Promise<any>} fn
	 */
	constructor(fn) {
		this.cache = new Map();
		this.set = new Set();
		this.fn = fn;
		this.waitRun = newPromise();
	}

	/**
	 * @param {T} param
	 * @returns {Promise<R>}
	 */
	run(param) {
		if (this.cache.has(param)) return Promise.resolve(this.cache.get(param));
		if (this.running?.has(param)) return this.pms.then(() => this.cache.get(param));
		this.set.add(param);
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			let running = this.set;
			this.running = running;
			this.set = new Set();
			this.pms = this.fn(Array.from(running), this.cache).finally(() => {
				running.clear();
			});
			this.waitRun.resolve();
			this.waitRun = newPromise();
		}, 500);
		return this.waitRun.then(() => this.pms).then(() => this.cache.get(param));
	}
}

/**
 * 随机生成一个字的拼音
 */
export function randPinyin() {
	const shen = [
		"b",
		"p",
		"m",
		"f",
		"d",
		"t",
		"n",
		"l",
		"g",
		"k",
		"h",
		"j",
		"q",
		"x",
		"zh",
		"ch",
		"sh",
		"r",
		"z",
		"c",
		"s",
	];
	const yun = [
		"a",
		"o",
		"e",
		"i",
		"u",
		"ai",
		"ei",
		"ui",
		"ao",
		"ou",
		"iu",
		"ie",
		"an",
		"en",
		"in",
		"un",
		"ang",
		"eng",
		"ing",
		"ong",
	];
	return shen[randN(shen.length)] + yun[randN(yun.length)];
}

/**
 * 计算编辑距离的函数
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
export function levenshteinDistance(str1, str2) {
	const len1 = str1.length;
	const len2 = str2.length;

	// 初始化一个二维数组来存储编辑距离
	const dp = Array.from(Array(len1 + 1), () => Array(len2 + 1).fill(0));

	// 边界情况：空字符串到另一个字符串的编辑距离
	for (let i = 0; i <= len1; i++) {
		dp[i][0] = i;
	}
	for (let j = 0; j <= len2; j++) {
		dp[0][j] = j;
	}

	// 动态规划计算编辑距离
	for (let i = 1; i <= len1; i++) {
		for (let j = 1; j <= len2; j++) {
			if (str1[i - 1] === str2[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1]; // 如果字符相同，编辑距离不变
			} else {
				dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
			}
		}
	}

	return dp[len1][len2]; // 返回编辑距离
}

/**
 * 计算相似度的函数
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
export function stringSimilarity(str1, str2) {
	str1 = str1.trim().replace(/\d+/g, "#");
	str2 = str2.trim().replace(/\d+/g, "#");
	const distance = levenshteinDistance(str1, str2);
	const maxLength = Math.max(str1.length, str2.length);

	// 如果两个字符串都为空，相似度定义为 1
	if (maxLength === 0) return 1;

	// 相似度 = 1 - (编辑距离 / 最大长度)
	return 1 - distance / maxLength;
}

/**
 * 将字符串转换为正则完全匹配格式
 * @param {string} text
 */
export function text2regex(text) {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/(?<!\\)\./g, "\\.")
		.replace(/(?<!\\)\*/g, ".*")
		.replace(/(?<!\\)\?/g, ".")
		.replace(/(?<!\\)\(/g, "\\(")
		.replace(/(?<!\\)\)/g, "\\)")
		.replace(/(?<!\\)\[/g, "\\[")
		.replace(/(?<!\\)\]/g, "\\]")
		.replace(/(?<!\\)\{/g, "\\{")
		.replace(/(?<!\\)\}/g, "\\}")
		.replace(/(?<!\\)\|/g, "\\|")
		.replace(/(?<!\\)\^/g, "\\^")
		.replace(/(?<!\\)\$/g, "\\$");
}

/**
 * @template T
 * @param {()=>T} fn
 * @returns {T}
 */
export function lazy(fn) {
	let obj;
	return new Proxy(function () {}, {
		get(target, name) {
			if (!obj) obj = fn();
			return obj[name];
		},
		set(target, p, newValue, receiver) {
			if (!obj) obj = fn();
			obj[p] = newValue;
			return true;
		},
		apply(target, thisArg, argArray) {
			if (!obj) obj = fn();
			return obj.apply(thisArg, argArray);
		},
		deleteProperty(target, p) {
			if (!obj) obj = fn();
			delete obj[p];
			return true;
		},
	});
}

const watchMap = new WeakMap();

export function unwatch(data, fn) {
	let watchs = watchMap.get(data);
	if (watchs) {
		watchs.delete(fn);
		if (!watchs.size) watchMap.delete(data);
	}
}

export function watchWait(data) {
	let watchs = watchMap.get(data);
	return Promise.resolve(watchs && watchs.pms);
}

/**
 * 监听数据变化
 * @template T
 * @param {T} data
 * @param {number} delay 延迟时间，-1表示立即执行
 * @param {(changes:{data:ArrayItem<T>,changed:Partial<ArrayItem<T>>}[])=>void} fn
 * @returns {T}
 */
export function watch(data, fn, delay = 0) {
	if (data == null || typeof data != "object") return data;
	let watchs = watchMap.get(data);
	if (watchs) {
		watchs.add(fn);
		return data;
	}
	watchs = new Set();
	watchs.add(fn);
	watchMap.set(data, watchs);
	function emit(data, changed) {
		return Promise.all(Array.from(watchs).map((fn) => fn(data, changed)));
	}
	function delayFunction(fn) {
		fn = delay < 0 ? fn : debounce(fn, delay);
		return function () {
			let pms = fn();
			if (!watchs.pms) watchs.pms = pms;
			else watchs.pms = watchs.pms.then(() => pms);
			return pms;
		};
	}
	if (Array.isArray(data)) {
		let changes = [];
		const delayEmit = delayFunction(() => {
			let pms = emit(changes);
			changes = [];
			return pms;
		});
		function add(changed) {
			changes.push({changed}); // 添加元素
			delayEmit();
		}
		function remove(data) {
			unwatch(data, fn);
			let idx = changes.findIndex((x) => x.changed == data);
			if (idx >= 0) {
				changes.splice(idx, 1); // 删除添加记录
			} else {
				changes.push({data}); // 删除元素
			}
			delayEmit();
		}
		data.forEach((v, i) => {
			v = watch(v, fn, delay);
			data[i] = v;
		});
		data.splice = function (index, deleteCount, ...items) {
			items.forEach((v, i) => {
				v = watch(v, fn, delay);
				items[i] = v;
				add(v);
			});
			let result = Array.prototype.splice.call(data, index, deleteCount, ...items);
			result.forEach((v, i) => {
				remove(v);
			});
			return result;
		};
		data.push = function (...items) {
			items.forEach((v, i) => {
				v = watch(v, fn, delay);
				items[i] = v;
				add(v);
			});
			return Array.prototype.push.apply(data, items);
		};
		data.pop = function () {
			let v = Array.prototype.pop.call(data);
			if (v != null) remove(v);
			return v;
		};
		data.shift = function () {
			let v = Array.prototype.shift.call(data);
			if (v != null) remove(v);
			return v;
		};
		data.unshift = function (...items) {
			items.forEach((v, i) => {
				v = watch(v, fn, delay);
				items[i] = v;
				add(v);
			});
			return Array.prototype.unshift.apply(data, items);
		};
	} else {
		let changed = {};
		const delayEmit = delayFunction(() => {
			let pms = emit([{data, changed}]);
			changed = {};
			return pms;
		});
		for (let k in data) {
			if (k[0] === "_") continue;
			let v = data[k];
			if (typeof v === "undefined" || typeof v === "function") continue;
			function onchange() {
				changed[k] = v;
				delayEmit();
			}
			v = watch(v, onchange, -1);
			Object.defineProperty(data, k, {
				enumerable: true,
				get() {
					return v;
				},
				set(newValue) {
					if (newValue === v) return;
					v = watch(newValue, onchange, -1);
					onchange();
				},
			});
		}
	}
	return data;
}

/**
 * 将函数转换为字符串
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {Parameters<T>} [args]
 * @returns {string}
 */
export function makeCode(fn, args) {
	let s = fn.toString();
	if (s.startsWith("async ")) {
		if (!s.startsWith("async (") && !s.startsWith("async function("))
			s = `async function ` + s.slice(6);
	} else {
		if (!s.startsWith("(") && !s.startsWith("function(")) s = "function " + s;
	}
	if (!args) return `(${s})()`;
	return `(${s})(${args.map((x) => JSON.stringify(x)).join(",")})`;
}
