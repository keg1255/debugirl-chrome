class BorderRect {
	constructor(rect) {
		Object.assign(this, rect);
	}

	getRect(box, scale) {
		let x, y, width, height;
		if (this.x != null) x = this.x * scale;
		if (this.y != null) y = this.y * scale;
		if (this.width != null) width = this.width * scale;
		if (this.height != null) height = this.height * scale;
		if (x == null) x = box.width - width;
		if (y == null) y = box.height - height;
		if (width == null) width = box.width - x - this.right * scale;
		if (height == null) height = box.height - y - this.bottom * scale;
		return {x, y, width, height};
	}
}

/**
 *
 * @param {ImageData} imageData
 * @param {string} pos
 * @param {Rect} rect
 * @returns {Rect}
 */
function findLoopRect(imageData, pos, rect) {
	let data = imageData.data;
	let w = imageData.width;
	function compare(a, b) {
		return (
			Math.abs(data[a] - data[b]) < 10 &&
			Math.abs(data[a + 1] - data[b + 1]) < 10 &&
			Math.abs(data[a + 2] - data[b + 2]) < 10 &&
			Math.abs(data[a + 3] - data[b + 3]) < 10
		);
	}
	function compare1(a, b) {
		return (
			Math.abs(data[a] - data[b]) < 10 &&
			Math.abs(data[a + 1] - data[b + 1]) < 10 &&
			Math.abs(data[a + 2] - data[b + 2]) < 10
		);
	}
	let {x, y, width, height} = rect;
	let res = null;
	// 循环
	if (pos == "top" || pos == "bottom") {
		var cmp = (a, b) => {
			let r = y * w * 4;
			let ai = a * 4;
			let bi = b * 4;
			for (let i = 0; i < height; i++) {
				if (!compare(r + ai, r + bi)) return false;
				r += w * 4;
			}
			return true;
		};
		let b = x;
		let e = x + width - 1;
		while (b < e) {
			let i = e--;
			while (b < i) {
				if (cmp(b, i)) {
					let tmp = {type: 1, x: b, y, width: i - b + 1, height};
					if (!res) res = tmp;
					if (cmp(b + 1, i + 1)) {
						console.log(pos, b, i, e);
						return tmp;
					}
				}
				i--;
			}
			if (b >= e) break;
			i = b++;
			while (i < e) {
				if (cmp(i, e)) {
					let tmp = {type: 1, x: i, y, width: e - i + 1, height};
					if (!res) res = tmp;
					if (cmp(i - 1, e - 1)) {
						console.log(pos, b, i, e);
						return tmp;
					}
				}
				i++;
			}
		}
	} else {
		var cmp = (a, b) => {
			let ra = (w * a + x) * 4;
			let rb = (w * b + x) * 4;
			let limit = width * 4;
			for (let i = 0; i < limit; i += 4) {
				if (!compare(ra + i, rb + i)) return false;
			}
			return true;
		};
		let b = y;
		let e = y + height - 1;
		while (b < e) {
			let i = e--;
			while (b < i) {
				if (cmp(b, i)) {
					let tmp = {type: 1, x, y: b, width, height: i - b + 1};
					if (!res) res = tmp;
					if (cmp(b + 1, i + 1)) {
						console.log(pos, b, i, e);
						return tmp;
					}
				}
				i--;
			}
			if (b >= e) break;
			i = b++;
			while (i < e) {
				if (cmp(i, e) && cmp(i - 1, e - 1)) {
					let tmp = {type: 1, x, y: i, width, height: e - i + 1};
					if (!res) res = tmp;
					if (cmp(i - 1, e - 1)) {
						console.log(pos, b, i, e);
						return tmp;
					}
				}
				i++;
			}
		}
		if (res) return res;
	}
	// 逆向循环
	if (pos == "top" || pos == "bottom") {
		var singleColorr = (a) => {
			let r = y * w * 4;
			let ai = a * 4;
			let prev = -1;
			for (let i = 0; i < height; i++) {
				if (data[r + ai + 3] < 128) continue;
				if (prev < 0) prev = r + ai;
				else if (!compare1(prev, r + ai, 10)) {
					return false;
				}
				r += w * 4;
			}
			return true;
		};
		let b = x;
		let e = x + width - 1;
		while (b < e && !singleColorr(b)) b++;
		while (b < e && !singleColorr(e)) e--;
		if (b < e) {
			let i = b + 1;
			while (i < e && singleColorr(i)) i++;
			if (i < e) b = Math.floor((b + i) / 2);
			i = e - 1;
			while (b < i && singleColorr(i)) i--;
			if (b < i) e = Math.ceil((e + i) / 2);
			console.log(pos, "reverse", b, e);
			return {type: 2, x: b, y, width: e - b + 1, height};
		}
	} else {
		var singleColorc = (a) => {
			let ra = (w * a + x) * 4;
			let prev = -1;
			let limit = width * 4;
			for (let i = 0; i < limit; i += 4) {
				if (data[ra + i + 3] < 128) continue;
				if (prev < 0) prev = ra + i;
				else if (!compare1(prev, ra + i, 10)) {
					return false;
				}
			}
			return true;
		};
		let b = y;
		let e = y + height - 1;
		while (b < e && !singleColorc(b)) b++;
		if (b < e) {
		}
		while (b < e && !singleColorc(e)) e--;
		if (b < e) {
			let i = b + 1;
			while (i < e && singleColorc(i)) i++;
			if (i < e) b = Math.floor((b + i) / 2);
			i = e - 1;
			while (b < i && singleColorc(i)) i--;
			if (b < i) e = Math.ceil((e + i) / 2);
			console.log(pos, "reverse", b, e);
			return {type: 2, x, y: b, width, height: e - b + 1};
		}
	}
	console.log(pos, rect);
	// 拉伸
	rect.type = 0;
	return rect;
}

/**
 * 计算图片边框数据
 * @param {HTMLImageElement} img
 * @returns {{top:Rect,bottom:Rect,left:Rect,right:Rect}}
 */
export function calcImageBorder(img) {
	console.time("diff");
	let canvas = document.createElement("canvas");
	let w = (canvas.width = img.naturalWidth);
	let h = (canvas.height = img.naturalHeight);
	let ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	let imageData = ctx.getImageData(0, 0, w, h);
	let data = imageData.data;
	let point = {x: Math.floor(w / 2), y: Math.floor(h / 2)};
	let left = point.x;
	let top = point.y;
	let right = point.x;
	let bottom = point.y;
	let m;
	let limit = w * h;
	let centerRect = {left: -1, right: -1, top: -1, bottom: -1};
	let cnt = 4;
	// 中心点是白色,则去除白色
	let i = point.y * w + point.x;
	let alpha = data[i * 4 + 3];
	if (alpha > 0) {
		let i = 0;
		let n = limit * 4;
		while (i < n) {
			if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255) {
				data[i + 3] = 0;
			}
			i += 4;
		}
	}

	// if (document.body.lastChild.tagName === "CANVAS")
	// 	document.body.removeChild(document.body.lastChild);
	// document.body.appendChild(canvas);
	// canvas.style.position = "fixed";
	// canvas.style.left = "0";
	// canvas.style.top = "0";
	// canvas.style.zIndex = "999999";
	// canvas.style.width = "100%";
	// canvas.style.height = "100%";
	// canvas.style.pointerEvents = "none";
	// function test(color = "black", v) {
	// 	if (v) console.log(color, v);
	// 	ctx.fillStyle = color;
	// 	ctx.fillRect(point.x, point.y, 1, 1);
	// }
	// function test1(v) {
	// 	if (v == 1) return;
	// 	debugger;
	// }
	while (limit-- && cnt) {
		if (centerRect.left < 0) {
			m = centerRect.top < 0 ? point.y - (top - 1) : point.y - centerRect.top;
			// console.log("top", m);
			while (m-- && data[(point.y * w + point.x) * 4 + 3] < 1) point.y--;
			if (m >= 0) {
				// test("red", data[(point.y * w + point.x) * 4 + 3]);
				centerRect.left = ++point.x;
				point.y = top - 1;
				cnt--;
			}
			// centerRect.top < 0 && test1(top - point.y);
			left = point.x;
			if (centerRect.left < 0 && left < 1) centerRect.left = left;
		} else {
			point.y = top - 1;
		}
		// test();
		if (centerRect.top < 0) {
			m = centerRect.right < 0 ? right + 1 - point.x : centerRect.right - point.x;
			// console.log("right", m);
			while (m-- && data[(point.y * w + point.x) * 4 + 3] < 1) point.x++;
			if (m >= 0) {
				// test("green", data[(point.y * w + point.x) * 4 + 3]);
				centerRect.top = ++point.y;
				point.x = right + 1;
				cnt--;
			}
			// centerRect.right < 0 && test1(point.x - right);
			top = point.y;
			if (centerRect.top < 0 && top < 1) centerRect.top = top;
		} else {
			point.x = right + 1;
		}
		// test();
		if (centerRect.right < 0) {
			m = centerRect.bottom < 0 ? bottom + 1 - point.y : centerRect.bottom - point.y;
			// console.log("bottom", m);
			while (m-- && data[(point.y * w + point.x) * 4 + 3] < 1) point.y++;
			if (m >= 0) {
				// test("blue", data[(point.y * w + point.x) * 4 + 3]);
				centerRect.right = --point.x;
				point.y = bottom + 1;
				cnt--;
			}
			// centerRect.bottom < 0 && test1(point.y - bottom);
			right = point.x;
			if (centerRect.right < 0 && right > w - 2) centerRect.right = right;
		} else {
			point.y = bottom + 1;
		}
		// test();
		if (centerRect.bottom < 0) {
			m = centerRect.left < 0 ? point.x - (left - 1) : point.x - centerRect.left;
			// console.log("left", m);
			while (m-- && data[(point.y * w + point.x) * 4 + 3] < 1) point.x--;
			if (m >= 0) {
				// test("yellow", data[(point.y * w + point.x) * 4 + 3]);
				centerRect.bottom = --point.y;
				point.x = left - 1;
				cnt--;
			}
			// centerRect.left < 0 && test1(left - point.x);
			bottom = point.y;
			if (centerRect.bottom < 0 && bottom > h - 2) centerRect.bottom = bottom;
		} else {
			point.x = left - 1;
		}
		// test();
		// console.log(point.x, point.y);
	}
	console.log(limit, centerRect, w, h);
	console.timeEnd("diff");

	let top1 = findLoopRect(imageData, "top", {
		x: centerRect.left,
		y: 0,
		width: centerRect.right - centerRect.left,
		height: centerRect.top,
	});
	let right1 = findLoopRect(imageData, "right", {
		x: centerRect.right,
		y: centerRect.top,
		width: w - centerRect.right,
		height: centerRect.bottom - centerRect.top,
	});
	let bottom1 = findLoopRect(imageData, "bottom", {
		x: centerRect.left,
		y: centerRect.bottom,
		width: centerRect.right - centerRect.left,
		height: h - centerRect.bottom,
	});
	let left1 = findLoopRect(imageData, "left", {
		x: 0,
		y: centerRect.top,
		width: centerRect.left,
		height: centerRect.bottom - centerRect.top,
	});
	let rects = [
		new BorderRect({
			name: "top",
			type: top1.type,
			x: top1.x,
			y: top1.y,
			height: top1.height,
			right: w - top1.x - top1.width,
		}),
		new BorderRect({
			name: "bottom",
			type: bottom1.type,
			x: bottom1.x,
			height: bottom1.height,
			right: w - bottom1.x - bottom1.width,
		}),
		new BorderRect({
			name: "left",
			type: left1.type,
			x: left1.x,
			y: left1.y,
			width: left1.width,
			bottom: h - left1.y - left1.height,
		}),
		new BorderRect({
			name: "right",
			type: right1.type,
			y: right1.y,
			width: right1.width,
			bottom: h - right1.y - right1.height,
		}),
		new BorderRect({
			name: "topleft",
			x: 0,
			y: 0,
			width: top1.x,
			height: left1.y,
		}),
		new BorderRect({
			name: "topright",
			y: 0,
			width: w - top1.x - top1.width,
			height: right1.y,
		}),
		new BorderRect({
			name: "bottomleft",
			x: 0,
			width: bottom1.x,
			height: h - left1.y - left1.height,
		}),
		new BorderRect({
			name: "bottomright",
			width: w - bottom1.x - bottom1.width,
			height: h - right1.y - right1.height,
		}),
	];
	return rects;
}
