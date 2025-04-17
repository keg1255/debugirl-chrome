import axios from "~/lib/axios";

interface SendSmsOpt {
	phone: string;
	imgcode: string;
	getImageCode: () => Promise<any>;
}
interface SubmitOpt {
	phone: string;
	smscode: string;
}

export interface PhoneLoginBase {
	sendSms(opt: SendSmsOpt): Promise<any>;
	getCaptchaImage(): Promise<string>;
	submit(body: SubmitOpt): Promise<any>;
}

export class PhoneLogin implements PhoneLoginBase {
	private imageToken: string;
	private smsToken: string;

	getCaptchaImage(): Promise<string> {
		return axios.apiGet("/sys/captcha", {scene: "send-sms-code", base64: 1}).then((result) => {
			this.imageToken = result.token;
			return result.url;
		});
	}

	sendSms(opt: SendSmsOpt): Promise<any> {
		return axios
			.apiGet("/sys/sms", {
				appid: "__UNI__017A32C",
				template_id: "17996", //  "uni_sms_test",
				phone: opt.phone,
				scene: "phone-login",
				code: opt.imgcode,
				token: this.imageToken,
			})
			.then((result) => {
				this.smsToken = result.token;
			})
			.catch(async (e) => {
				if (/已过期|请输入/.test(e.msg)) {
					await opt.getImageCode();
				}
				throw e;
			});
	}

	submit(opt: SubmitOpt): Promise<any> {
		return axios.apiPost("/users/phone-login", {
			phone: opt.phone,
			token: this.smsToken,
			code: opt.smscode,
		});
	}
}
