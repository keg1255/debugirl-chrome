<template>
	<div class="i-gradient" :style="textGradient">
		<div v-for="(item, i) in colors" :key="i" class="i-gradient-stop" :style="stopStyle(item)">
			<div v-move="move.bind(null, i)" class="pointer">
				<div class="rect" :style="{background: item.v}" @click="clickItem(item, $event)"></div>
			</div>
			<i-popup :aim="$el" pos="left-top" :open="item.picker" @update:open="close(item)">
				<i-color :value="item.v" @input="setColor(item, $event.hex)"></i-color>
			</i-popup>
		</div>
	</div>
</template>
<script>
import IPopup from "./IPopup";

export default {
	name: "IGradient",
	components: {
		IPopup,
	},
	props: {
		value: {required: true},
	},
	data: function () {
		return {
			colors: [],
			width: 0,
		};
	},
	computed: {
		textGradient: function () {
			var s = "";
			for (let {k, v} of this.colors) {
				s += `,${v} ${+k * 100}%`;
			}
			return `background:linear-gradient(90deg${s});`;
		},
	},
	watch: {
		value: {
			immediate: true,
			handler: function () {
				if (this.editing) return;
				this.updateColors();
			},
		},
	},
	mounted: function () {
		this.width = this.$el.clientWidth;
	},
	methods: {
		close(item) {
			this.editing = false;
			item.picker = false;
			this.updateColors();
		},
		clickItem(item, e) {
			if (e.target.dxy < 5) {
				item.picker = e;
				this.editing = true;
			}
		},
		updateColors() {
			var colors = [];
			for (let k in this.value) {
				let v = this.value[k];
				colors.push({k: k, v: v, picker: false});
			}
			colors.sort(function (a, b) {
				return a.k - b.k;
			});
			this.colors = colors;
		},
		stopStyle: function (item) {
			return "left:" + item.k * this.width + "px;";
		},
		move: function (i, type, e) {
			var item = this.colors[i];
			if (type == "start") {
				item.bl = +item.k;
			} else {
				if (!e.dx) return;
				item.k = item.bl + e.dx / this.width;
				if (item.k < 0) item.k = 0;
				if (item.k > 1) item.k = 1;
			}
			if (type == "end") {
				console.log(e.dy);
				if (e.dy > Math.abs(e.dx) && e.dy > 30) this.del(i);
				else this.$emit("input", this.getData());
			}
		},
		del: function (i) {
			this.colors.splice(i, 1);
			this.$emit("input", this.getData());
		},
		setColor(item, color) {
			if (!item.picker) return;
			item.v = color;
			this.$emit("input", this.getData());
		},
		getData() {
			var data = {};
			for (let {k, v} of this.colors) {
				data[+k || 0] = v;
			}
			return data;
		},
	},
};
</script>
<style lang="less">
.i-gradient {
	position: relative;
	border: 1px solid #666;
	> .i-gradient-stop {
		position: absolute;
		top: 100%;
		> .pointer {
			margin-top: 0.1rem;
			width: 0.43rem;
			height: 0.43rem;
			border: 1px solid #666;
			margin-left: 0.3rem;
			transform: translateX(-0.5rem) rotate(45deg);
			> .rect {
				cursor: move;
				user-select: none;
				width: 0.6rem;
				height: 0.6rem;
				border: 1px solid #000;
				position: relative;
				z-index: 1;
				transform: translate(0.1rem, 0.1rem) rotate(45deg);
			}
		}
	}
}
</style>
