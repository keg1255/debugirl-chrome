import {formatError, pushIndex} from "@/common/utils";
import {ref} from "vue";

interface ToastMsg {
	text?: string;
	timeout?: number;
	remove?: () => void;
	id?: number;
}

export const toast_list = ref<ToastMsg[]>([]);

class Toast {
	private _prev_end_at: number;
	constructor() {
		this._prev_end_at = 0; // 上个消息关闭时间，不考虑主动关闭情况
	}

	push(msg: ToastMsg) {
		let last_msg = toast_list.value[toast_list.value.length - 1];
		if (last_msg && last_msg.text == msg.text) return;
		var now = Date.now();
		msg.text = formatError(msg.text);
		if (typeof msg.timeout != "number")
			// 默认停留时间与消息长度相关
			msg.timeout = 1e3 + msg.text.length * 200;
		if (this._prev_end_at > now)
			// 如果上个消息还没结束
			msg.timeout += this._prev_end_at - now;
		this._prev_end_at = now + msg.timeout;
		msg.remove = () => this.remove(msg);
		msg.id = pushIndex();
		setTimeout(msg.remove, msg.timeout);
		toast_list.value.push(msg);
		return msg;
	}

	remove(msg: ToastMsg) {
		var idx = toast_list.value.indexOf(msg);
		if (idx >= 0) {
			toast_list.value.splice(idx, 1);
		}
	}

	clearAll() {
		toast_list.value = [];
	}

	show(text: any, opt?: ToastMsg) {
		return this.push(Object.assign({text, status: "normal"}, opt));
	}

	success(text: any, opt?: ToastMsg) {
		return this.push(Object.assign({text, status: "success"}, opt));
	}

	error(text: any, opt?: ToastMsg) {
		if (text instanceof Error) console.error(text);
		return this.push(Object.assign({text, status: "error"}, opt));
	}
}

export default new Toast();
