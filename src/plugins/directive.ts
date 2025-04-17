import {getPointByEvent} from "@/common/utils";
import type {DirectiveBinding, VNode} from "vue";

function listen(
	el: HTMLElement | Document,
	event: string,
	fn: (e: Event) => void,
	options?: boolean | AddEventListenerOptions
) {
	let ss = event.split(/\|/);
	ss.forEach((x) => {
		el.addEventListener(x, fn, options);
	});
	return function () {
		ss.forEach((x) => el.removeEventListener(x, fn, options));
	};
}

function addCls(el, cls) {
	let ss = el.className.split(/\s+/);
	let idx = ss.indexOf(cls);
	if (idx < 0) {
		el.className += " " + cls;
	}
}

function removeCls(el, cls) {
	let ss = el.className.split(/\s+/);
	let idx = ss.indexOf(cls);
	if (idx >= 0) {
		ss.splice(idx, 1);
	}
	el.className = ss.join(" ");
}

export function installDirective(vueApp) {
	function addDirective(
		key: string,
		fn: (el: HTMLElement, binding: DirectiveBinding, vnode: VNode) => any
	) {
		let name = "v-" + key;
		vueApp.directive(key, {
			mounted(el, binding, vnode) {
				el[name] = fn(el, binding, vnode);
			},
			unmounted(el) {
				if (Array.isArray(el[name])) {
					el[name].forEach((x) => x());
					delete el[name];
				}
			},
		});
	}

	["click", "input", "keydown", "contextmenu", "drop"].forEach((key) => {
		addDirective(key, function (el, binding) {
			return [
				listen(el, key, function (e: MouseEvent | TouchEvent) {
					if (binding.modifiers.stop) e.stopPropagation();
					if (binding.modifiers.prevent) e.preventDefault();
					if (typeof binding.value === "function") {
						binding.value(e);
					}
				}),
			];
		});
	});

	addDirective("click-outside", function (el, binding) {
		return [
			listen(
				document,
				"click",
				function (e: MouseEvent | TouchEvent) {
					if (el.contains(e.target as Node) || el == e.target) {
						return;
					}
					if (typeof binding.value === "function") {
						binding.value(e);
					}
				},
				true
			),
		];
	});

	addDirective("hover", function (el, binding) {
		let cls = binding.value || "hover";
		var h;
		return [
			listen(el, "mouseenter", () => {
				clearTimeout(h);
				addCls(el, cls);
			}),
			listen(el, "mouseleave", () => {
				h = setTimeout(() => {
					removeCls(el, cls);
				}, 500);
			}),
		];
	});

	addDirective("move", function (el, binding) {
		if (typeof binding.value === "function") {
			return [
				listen(el, "mousedown|touchstart", function (e: any) {
					let b = getPointByEvent(e);
					e.el = el;
					binding.value("start", e);
					let ss = [
						listen(document, "touchmove|mousemove", function (e: any) {
							let p = getPointByEvent(e);
							e.el = el;
							e.dx = p.x - b.x;
							e.dy = p.y - b.y;
							binding.value("move", e);
						}),
						listen(document, "touchend|mouseup", function (e: any) {
							let p = getPointByEvent(e);
							e.el = el;
							e.dx = p.x - b.x;
							e.dy = p.y - b.y;
							e.target.dxy = Math.sqrt(e.dx * e.dx + e.dy * e.dy);
							binding.value("end", e);
							ss.forEach((x) => x());
						}),
					];
				}),
			];
		}
		return [];
	});

	addDirective("slide", function (el, binding) {
		let m = binding.modifiers;
		if (typeof binding.value === "function") {
			return [
				listen(el, "mousedown|touchstart", function (e: MouseEvent | TouchEvent) {
					let b = getPointByEvent(e);
					let ss = [
						listen(
							document,
							"touchmove|mousemove",
							function (e: MouseEvent | TouchEvent) {
								let p = getPointByEvent(e);
								let x = m.x ? p.x - b.x : 0;
								let y = m.y ? p.y - b.y : 0;
								el.style.transform = `translate(${x}px, ${y}px)`;
								if (m.prevent) e.preventDefault();
							},
							{passive: !m.prevent}
						),
						listen(document, "touchend|mouseup", function (e: MouseEvent | TouchEvent) {
							let p = getPointByEvent(e);
							let x = p.x - b.x;
							let y = p.y - b.y;
							el.style.transform = ``;
							binding.value({x, y});
							ss.forEach((x) => x());
						}),
					];
				}),
			];
		}
		return [];
	});
}
