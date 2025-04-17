<template>
	<div class="i-chart"></div>
</template>
<script>
import {datetime, loadjs} from "@/common/utils";
export default {
	name: "IChart",
	components: {},
	props: {
		title: String,
		list: Array,
		round: Number, // 数据保留小数位数
	},
	emits: ["legendselectchanged", "showTip", "click", "selectchanged"],
	data() {
		return {};
	},
	computed: {
		option() {
			let category;
			let row = this.list[0];
			let legend = [];
			let isdate = "";
			for (let k in row) {
				let v;
				this.list.find((x) => (x[k] != null ? (v = x[k]) : false));
				if (!category) {
					category = k;
					if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
						isdate = v;
					}
				} else if (+v) {
					legend.push(k);
				}
			}
			let map = {};
			for (let item of this.list) {
				map[item[category]] = item;
			}
			let xAxis = {type: "category", data: []};
			if (isdate) {
				let min = isdate;
				let max = isdate;
				for (let i = 1; i < this.list.length; i++) {
					let v = this.list[i][category];
					if (v < min) min = v;
					if (v > max) max = v;
				}
				min = new Date(min);
				max = new Date(max);
				while (min <= max) {
					xAxis.data.push(datetime(min).slice(0, 10));
					min = new Date(min.getTime() + 24 * 60 * 60 * 1000);
				}
			} else {
				xAxis.data = Object.keys(map);
			}
			let option = {
				title: {
					text: this.title,
				},
				tooltip: {
					trigger: "axis",
				},
				toolbox: {
					show: true,
					feature: {
						dataView: {readOnly: false},
						magicType: {
							type: ["line", "bar", "stack"],
						},
						restore: {},
						saveAsImage: {},
					},
				},
				legend: {
					data: legend,
				},
				xAxis,
				yAxis: {
					type: "value",
				},
				series: legend.map((x) => {
					return {
						name: x,
						type: "line",
						data: xAxis.data.map((v) => {
							v = +(map[v] && map[v][x]) || 0;
							if (this.round != null) v = v.toFixed(this.round);
							return v;
						}),
					};
				}),
				dataZoom: [
					{
						type: "slider",
						show: true,
						xAxisIndex: [0],
						start: 0,
						end: 100,
					},
					{
						type: "inside",
						xAxisIndex: [0],
						start: 0,
						end: 100,
					},
				],
			};
			return option;
		},
	},
	watch: {
		option(val) {
			if (this.chart) this.chart.setOption(this.option);
		},
	},
	async mounted() {
		let echarts = await loadjs("js/echarts.min.js");
		var chart = echarts.init(this.$el);
		chart.setOption(this.option);
		this.chart = chart;
		this.resize();
		window.addEventListener("resize", this.resize);
		chart.on("legendselectchanged", (e) => this.$emit("legendselectchanged", e));
		chart.on("showTip", (e) => this.$emit("showTip", e));
		chart.on("click", (e) => this.$emit("click", e));
		chart.on("selectchanged", (e) => this.$emit("selectchanged", e));
	},
	beforeUnmount() {
		window.removeEventListener("resize", this.resize);
	},
	methods: {
		resize() {
			if (this.chart) {
				this.chart.resize({width: 1, height: 1});
				this.chart.resize({
					width: this.$el.clientWidth,
					height: this.$el.clientHeight,
				});
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-chart {
	width: 100%;
	height: 100%;
}
</style>
