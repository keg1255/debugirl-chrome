interface TaskInfo {
	id: number;
	name: string;
	store?: any;
	autorun?: boolean;
	freq: number;
	run_at?: number;
	next_at?: number;
	result?: {text: string; class: string};
}

const storages = {
	"chrome.user": {
		user: null,
	},
	"chrome.app": {
		version: 1,
		uuid: "",
		list: [] as {id: number; url: string; status: string; timeout: number}[],
		mouse_api: "",
		allow_hosts: [],
	},
	"chrome.scripts": {
		list: [] as TaskInfo[],
	},
};

export default storages;
