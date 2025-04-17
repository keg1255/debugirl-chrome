import {pushIndex} from "@/common/utils";
import {defineAsyncComponent, ref} from "vue";

const dialogs = import.meta.glob("./*.vue", {import: "default"});
export function getDialogs() {
	let map = {};
	for (let key in dialogs) {
		map[key.slice(2, -4)] = defineAsyncComponent(dialogs[key]);
	}
	return map;
}

interface MessageOptions {
	btns: string[];
	idx?: number;
	msg: string;
	value?: string;
	size?: number;
	icon?: string;
	name?: string;
	title: string;
	timeout?: number;
}

interface MessageItem {
	id?: number;
	transition?: string;
	name: string;
	props: MessageOptions;
	single?: boolean;
	onclose?: (e?) => void;
	close?: (e?) => void;
}

export const dialog_list = ref<MessageItem[]>([]);

class Dialog {
	/**
	 * @private
	 */
	remove(msg: MessageItem) {
		var idx = dialog_list.value.indexOf(msg);
		if (idx >= 0) {
			dialog_list.value[idx].onclose();
			dialog_list.value.splice(idx, 1);
		}
	}

	removeAll(name?: string) {
		if (name)
			dialog_list.value = dialog_list.value.filter((item) =>
				item.name == name ? item.onclose() : true
			);
		else {
			dialog_list.value.forEach((item) => item.onclose());
			dialog_list.value = [];
		}
	}

	find(name) {
		if (name == null) return dialog_list.value[dialog_list.value.length - 1];
		return dialog_list.value.find((item) => item.name == name);
	}

	private push(item: MessageItem) {
		if (item.single) this.removeAll(item.name);
		const close = (e) => {
			item.onclose(e);
			this.remove(item);
		};
		if (!item.transition) item.transition = "it-fade";
		item.close = close;
		item.id = pushIndex();
		dialog_list.value.push(item);
		console.log(dialog_list.value);
		const update = (props) => (item.props = {...item.props, ...props});
		let waitClose = Object.assign(
			new Promise((resolve) => {
				item.onclose = function (v) {
					waitClose.closed = true;
					resolve(v);
				};
			}),
			{update, close, closed: false}
		);
		return waitClose;
	}

	show(name: string, props?: any) {
		return this.push({name, props, single: true});
	}

	open(name: string, props?: any) {
		return this.push({name, props, single: false});
	}

	openMessage(opts: MessageOptions) {
		return this.open("Message", opts);
	}

	alert(msg: string, opts?: Partial<MessageOptions>) {
		opts = Object.assign({msg, btns: ["知道了"], idx: 0}, opts);
		return this.openMessage(opts as MessageOptions);
	}

	confirm(msg: string, opts?: Partial<MessageOptions>) {
		opts = Object.assign({msg, btns: ["取消", "确定"]}, opts);
		return this.openMessage(opts as MessageOptions);
	}

	prompt(msg: string, value?: string | Partial<MessageOptions>, opts?: Partial<MessageOptions>) {
		if (typeof value != "string" && !opts) {
			opts = value;
			value = "";
		}
		opts = Object.assign({msg, value, btns: ["取消", "确定"]}, opts);
		return this.openMessage(opts as MessageOptions);
	}
}

export const dlg = new Dialog();

interface FormItem {
	key?: string;
	lbl?: string;
	label?: string;
	type?: string;
	placeholder?: string;
	is?: string;
	isprops?: Record<string, any>;
	rem?: string;
	opts?: string[];
	options?: {label: string; value: string}[];
	len?: number[];
	def?: any;
	need?: boolean;
	[key: string]: any;
}

interface FormOptions {
	title?: string;
	desc?: string;
	labelPosition?: "left" | "top";
	mode?: "fullscreen";
	params: FormItem[] | Record<string, FormItem>;
	default?: any;
	submit: (data: any) => void;
	buttons?: string[];
	actions?: {
		name: string;
		class?: string;
		style?: string;
		handler: (data: any) => void;
	}[];
}

export function showForm(opts: FormOptions) {
	return dlg.open("Form", opts);
}
