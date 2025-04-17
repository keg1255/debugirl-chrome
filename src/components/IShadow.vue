<template>
	<div class="i-shadow">
		<div :style="styl" @click="shadow_picker = $event"></div>
		<i-popup pos="left-top" :open="shadow_picker">
			<i-color :value="value.color" @input="setColor"></i-color>
			<div class="i-shadow-panel">
				<div style="position: absolute; left: 18px; top: 10px">
					X偏移<input
						style="margin-left: 8px; width: 48px; border: none; border-bottom: 1px solid #000"
						type="number"
						:value="value.offsetX"
						@input="limitX"
					/>
				</div>
				<div style="position: absolute; left: 18px; top: 36px">
					Y偏移<input
						style="margin-left: 8px; width: 48px; border: none; border-bottom: 1px solid #000"
						type="number"
						:value="value.offsetY"
						@input="limitY"
					/>
				</div>
				<div style="position: absolute; left: 18px; top: 108px">
					模糊<input
						style="margin-left: 17px; width: 48px; border: none; border-bottom: 1px solid #000"
						type="number"
						:value="value.blur"
						@input="limitBlur"
					/>
				</div>
				<svg
					style="position: absolute; right: 10px; top: 10px"
					width="88"
					height="88"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<line x1="0" y1="0" x2="88" y2="0" style="stroke: #cccccc; stroke-width: 1" />
					<line x1="0" y1="0" x2="0" y2="88" style="stroke: #cccccc; stroke-width: 1" />
					<line x1="88" y1="0" x2="88" y2="88" style="stroke: #cccccc; stroke-width: 1" />
					<line x1="0" y1="88" x2="88" y2="88" style="stroke: #cccccc; stroke-width: 1" />
					<line x1="44" y1="0" x2="44" y2="88" style="stroke: #cccccc; stroke-width: 1" />
					<line x1="0" y1="44" x2="88" y2="44" style="stroke: #cccccc; stroke-width: 1" />
					<line
						x1="44"
						y1="44"
						:x2="44 + value.offsetX * 2"
						:y2="44 + value.offsetY * 2"
						:style="{stroke: i_fillColor, strokeWidth: 1}"
					/>
					<circle
						v-move="moveOffset"
						:cx="44 + value.offsetX * 2"
						:cy="44 + value.offsetY * 2"
						r="5"
						stroke="black"
						stroke-width="0"
						:fill="i_fillColor"
						style="cursor: move"
					/>
				</svg>
				<svg
					style="position: absolute; right: 5px; top: 114px"
					width="98"
					height="10"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
				>
					<line x1="5" y1="5" x2="93" y2="5" style="stroke: #cccccc; stroke-width: 1" />
					<circle
						v-move="moveBlur"
						:cx="value.blur + 5"
						cy="5"
						r="5"
						stroke="black"
						stroke-width="0"
						:fill="i_fillColor"
						style="cursor: move"
					/>
				</svg>
			</div>
		</i-popup>
	</div>
</template>
<script>
import IPopup from "./IPopup";

export default {
	name: "IShadow",
	components: {
		IPopup,
	},
	props: {
		value: {require: true},
		fillColor: String,
	},
	data() {
		return {
			shadow_picker: false,
		};
	},
	computed: {
		styl: function () {
			var shadow = this.value;
			return `height:100%;border: 1px solid #666;box-shadow:${shadow.offsetX / 2}px ${
				shadow.offsetY / 2
			}px ${shadow.blur}px ${shadow.color};`;
		},
		i_fillColor() {
			return this.fillColor || (this.value && this.value.color);
		},
	},
	methods: {
		limit(k, min, max, v) {
			v = v - 0;
			if (v >= min && v <= max) this.value[k] = v;
			this.$emit("input", this.value);
		},
		limitX(e) {
			this.limit("offsetX", 0, 20, e.target.value);
		},
		limitY(e) {
			this.limit("offsetY", 0, 20, e.target.value);
		},
		limitBlur(e) {
			this.limit("blur", 0, 88, e.target.value);
		},
		setColor: function (e) {
			this.value.color = e.hex;
			this.$emit("input", this.value);
		},
		moveBlur: function (type, e) {
			if (type === "start") {
				this.bx = +this.value.blur;
			} else {
				this.value.blur = Math.min(Math.max(this.bx + e.dx, 0), 88);
				this.$emit("input", this.value);
			}
		},
		moveOffset: function (type, e) {
			if (type === "start") {
				this.ox = +this.value.offsetX;
				this.oy = +this.value.offsetY;
			} else {
				this.value.offsetX = Math.min(Math.max(Math.floor(this.ox + e.dx / 2), -20), 20);
				this.value.offsetY = Math.min(Math.max(Math.floor(this.oy + e.dy / 2), -20), 20);
				this.$emit("input", this.value);
			}
		},
	},
};
</script>
<style lang="less">
.i-shadow {
	.i-popup {
		box-shadow: 0 0 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3);
	}
	.i-color {
		box-shadow: none;
	}
	.i-shadow-panel {
		position: relative;
		padding: 10px 0;
		background: rgb(255, 255, 255);
		font-size: 14px;
		height: 160px;
		user-select: none;
		width: 100%;
	}
}
</style>
