import {distinct, MergeRunner, sleep} from "@/common/utils";
import axios from "@/lib/axios";
class TableReader {
	constructor(name, fields) {
		this.name = name;
		this.fields = fields;
		this.key = fields.split(",")[0].trim();
		this.map = {};
	}

	get(id) {
		if (!id) return Promise.resolve(null);
		if (id in this.map) return Promise.resolve(this.map[id]);
		if (this.pms) return this.pms.then(() => this.get(id));
		this.ids = this.ids || [];
		this.ids.push(id);
		return sleep(500).then(() => {
			if (!this.ids) return this.get(id);
			if (!this.pms) {
				let ids = distinct(this.ids);
				this.ids = null;
				this.pms = axios
					.apiGet(
						/admin-kefu/.test(location.pathname) ? `/${this.name}/list` : `/${this.name}/list`,
						{
							[this.key]: ids,
							fields: this.fields,
							pageSize: ids.length,
						}
					)
					.then((res) => {
						ids.forEach((id) => {
							if (!this.map[id]) this.map[id] = null;
						});
						res.list.forEach((x) => (this.map[x[this.key]] = x));
					})
					.finally(() => {
						this.pms = null;
					});
			}
			return this.pms.then(() => this.get(id));
		});
	}
}
const tables = [
	new TableReader("users", "id,nickname,avatar"),
	new TableReader("ipinfos", "ip,country,region,city,isp"),
];
export default tables;
