<template>
	<div
		role="application"
		aria-label="Chrome color picker"
		class="i-color"
		:class="{'i-color__disable-alpha': disableAlpha}"
	>
		<div class="i-color-saturation-wrap">
			<saturation :value="colors" @change="childChange"></saturation>
		</div>
		<div class="i-color-body">
			<div class="i-color-controls">
				<button
					v-if="!disableEyedropper"
					class="straw-picker"
					:class="{active: imgPicker}"
					@click="showStrawPicker"
				>
					eyedropper
				</button>
				<div v-if="imgPicker" class="color-straw">
					<img
						ref="imgPicker"
						:src="imgPicker"
						alt=""
						tabindex="-1"
						@mousemove="pickColor"
						@click="setColor"
						@keypress.esc="setColor"
					/>
					<canvas id="cs" ref="colorSelect" class="color-select"></canvas>
				</div>
				<div class="i-color-color-wrap">
					<div
						:aria-label="`current color is ${colors.hex}`"
						class="i-color-active-color"
						:style="{background: activeColor}"
					></div>
					<checkboard v-if="!disableAlpha"></checkboard>
				</div>

				<div class="i-color-sliders">
					<div class="i-color-hue-wrap">
						<hue :value="colors" @change="childChange"></hue>
					</div>
					<div v-if="!disableAlpha" class="i-color-alpha-wrap">
						<alpha :value="colors" @change="childChange"></alpha>
					</div>
				</div>
			</div>

			<div v-if="!disableFields" class="i-color-fields-wrap">
				<div v-show="fieldsIndex === 0" class="i-color-fields">
					<!-- hex -->
					<div class="i-color-field">
						<ed-in v-if="!hasAlpha" label="hex" :value="colors.hex" @change="inputChange"></ed-in>
						<ed-in v-if="hasAlpha" label="hex" :value="colors.hex8" @change="inputChange"></ed-in>
					</div>
				</div>
				<div v-show="fieldsIndex === 1" class="i-color-fields">
					<!-- rgba -->
					<div class="i-color-field">
						<ed-in label="r" :value="colors.rgba.r" @change="inputChange"></ed-in>
					</div>
					<div class="i-color-field">
						<ed-in label="g" :value="colors.rgba.g" @change="inputChange"></ed-in>
					</div>
					<div class="i-color-field">
						<ed-in label="b" :value="colors.rgba.b" @change="inputChange"></ed-in>
					</div>
					<div v-if="!disableAlpha" class="i-color-field">
						<ed-in
							label="a"
							:value="colors.a"
							:arrow-offset="0.01"
							:max="1"
							@change="inputChange"
						></ed-in>
					</div>
				</div>
				<div v-show="fieldsIndex === 2" class="i-color-fields">
					<!-- hsla -->
					<div class="i-color-field">
						<ed-in label="h" :value="hsl.h" @change="inputChange"></ed-in>
					</div>
					<div class="i-color-field">
						<ed-in label="s" :value="hsl.s" @change="inputChange"></ed-in>
					</div>
					<div class="i-color-field">
						<ed-in label="l" :value="hsl.l" @change="inputChange"></ed-in>
					</div>
					<div v-if="!disableAlpha" class="i-color-field">
						<ed-in
							label="a"
							:value="colors.a"
							:arrow-offset="0.01"
							:max="1"
							@change="inputChange"
						></ed-in>
					</div>
				</div>
				<!-- btn -->
				<div
					class="i-color-toggle-btn"
					role="button"
					aria-label="Change another color definition"
					@click="toggleViews"
				>
					<div class="i-color-toggle-icon">
						<svg
							style="width: 36px; height: 36px"
							viewBox="0 0 24 24"
							@mouseover="showHighlight"
							@mouseenter="showHighlight"
							@mouseout="hideHighlight"
						>
							<path
								fill="#333"
								d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z"
							/>
						</svg>
					</div>
					<div v-show="highlight" class="i-color-toggle-icon-highlight"></div>
				</div>
				<!-- btn -->
			</div>
			<div class="i-color-presets">
				<template v-for="c in presetColors">
					<div
						v-if="!isTransparent(c)"
						:key="c"
						class="i-color-presets-color"
						:aria-label="'Color:' + c"
						:style="{background: c}"
						@click="handlePreset(c)"
					></div>
					<div
						v-else
						:key="c + '1'"
						:aria-label="'Color:' + c"
						class="i-color-presets-color"
						@click="handlePreset(c)"
					>
						<checkboard />
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
import colorMixin from "./color";
import editableInput from "./common/EditableInput.vue";
import saturation from "./common/Saturation.vue";
import hue from "./common/Hue.vue";
import alpha from "./common/Alpha.vue";
import checkboard from "./common/Checkboard.vue";
const presetColors = [
	"#D0021B",
	"#F5A623",
	"#F8E71C",
	"#8B572A",
	"#7ED321",
	"#417505",
	"#BD10E0",
	"#9013FE",
	"#4A90E2",
	"#50E3C2",
	"#B8E986",
	"#000000",
	"#4A4A4A",
	"#9B9B9B",
	"#FFFFFF",
	"rgba(0,0,0,0)",
];
export default {
	name: "IColor",
	components: {
		saturation,
		hue,
		alpha,
		"ed-in": editableInput,
		checkboard,
	},
	mixins: [colorMixin],
	props: {
		disableEyedropper: Boolean,
		disableAlpha: Boolean,
		disableFields: Boolean,
		presetColors: {
			type: Array,
			default() {
				return presetColors;
			},
		},
	},
	emits: ["input", "update:modelValue"],
	data() {
		return {
			fieldsIndex: 0,
			highlight: false,
			imgPicker: "",
			color: "",
		};
	},
	computed: {
		hsl() {
			const {h, s, l} = this.colors.hsl;
			return {
				h: h.toFixed(),
				s: `${(s * 100).toFixed()}%`,
				l: `${(l * 100).toFixed()}%`,
			};
		},
		activeColor() {
			const rgba = this.colors.rgba;
			return "rgba(" + [rgba.r, rgba.g, rgba.b, rgba.a].join(",") + ")";
		},
		hasAlpha() {
			return this.colors.a < 1;
		},
	},
	methods: {
		handlePreset(c) {
			this.colorChange({
				hex: c,
				source: "hex",
			});
		},
		childChange(data) {
			this.colorChange(data);
		},
		inputChange(data) {
			if (!data) {
				return;
			}
			if (data.hex) {
				this.isValidHex(data.hex) &&
					this.colorChange({
						hex: data.hex,
						source: "hex",
					});
			} else if (data.r || data.g || data.b || data.a) {
				this.colorChange({
					r: data.r || this.colors.rgba.r,
					g: data.g || this.colors.rgba.g,
					b: data.b || this.colors.rgba.b,
					a: data.a || this.colors.rgba.a,
					source: "rgba",
				});
			} else if (data.h || data.s || data.l) {
				const s = data.s ? data.s.replace("%", "") / 100 : this.colors.hsl.s;
				const l = data.l ? data.l.replace("%", "") / 100 : this.colors.hsl.l;

				this.colorChange({
					h: data.h || this.colors.hsl.h,
					s,
					l,
					source: "hsl",
				});
			}
		},
		toggleViews() {
			if (this.fieldsIndex >= 2) {
				this.fieldsIndex = 0;
				return;
			}
			this.fieldsIndex++;
		},
		showHighlight() {
			this.highlight = true;
		},
		hideHighlight() {
			this.highlight = false;
		},
		async showStrawPicker() {
			if ("EyeDropper" in window) {
				const eyeDropper = new window.EyeDropper();
				try {
					const color = await eyeDropper.open();
					this.colorChange({
						hex: color.sRGBHex,
						source: "hex",
					});
				} catch (err) {}
				return;
			}
			const html2canvas = await import("html2canvas").then((x) => x.default);
			html2canvas(document.body).then((canvas) => {
				this.imgPicker = canvas.toDataURL();
				this.$nextTick(() => {
					this.$refs.imgPicker.focus();
				});
			});
		},
		setColor() {
			this.imgPicker = "";
		},
		useCanvas(el, image, callback) {
			el.width = image.width;
			el.height = image.height;
			el.getContext("2d").drawImage(image, 0, 0, image.width, image.height);
			return callback();
		},
		componentToHex(c) {
			let hex = c.toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		},
		rgbToHex(r, g, b) {
			return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
		},
		findPos(obj) {
			let curLeft = 0;
			let curTop = 0;
			if (obj.offsetParent) {
				do {
					curLeft += obj.offsetLeft;
					curTop += obj.offsetTop;
				} while ((obj = obj.offsetParent));
				return {
					x: curLeft,
					y: curTop,
				};
			}
			return undefined;
		},
		pickColor(e) {
			let x = "";
			let y = "";
			if (e.offsetX) {
				x = e.offsetX;
				y = e.offsetY;
			} else if (e.layerX) {
				x = e.layerX;
				y = e.layerY;
			}

			let img = this.$refs.imgPicker;
			let canvas = this.$refs.colorSelect;
			this.useCanvas(canvas, img, () => {
				let p = canvas.getContext("2d").getImageData(x, y, 1, 1).data;
				this.color = this.rgbToHex(p[0], p[1], p[2]);
				this.colorChange({
					hex: this.color,
					source: "hex",
				});
			});
		},
	},
};
</script>

<style>
.i-color {
	border-radius: 2px;
	box-shadow: 0 0 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3);
	box-sizing: initial;
	width: 225px;
	background-color: #fff;
}

.i-color-controls {
	display: flex;
}

.i-color-color-wrap {
	position: relative;
	width: 36px;
}

.i-color-active-color {
	position: relative;
	width: 30px;
	height: 30px;
	border-radius: 15px;
	overflow: hidden;
	z-index: 1;
}

.i-color-color-wrap .vc-checkerboard {
	width: 30px;
	height: 30px;
	border-radius: 15px;
	background-size: auto;
}

.i-color-sliders {
	flex: 1;
}

.i-color-fields-wrap {
	display: flex;
	padding-top: 16px;
}

.i-color-fields {
	display: flex;
	margin-left: -6px;
	flex: 1;
}

.i-color-field {
	padding-left: 6px;
	width: 100%;
}

.i-color-toggle-btn {
	width: 32px;
	text-align: right;
	position: relative;
}

.i-color-toggle-icon {
	margin-right: -4px;
	margin-top: 12px;
	cursor: pointer;
	position: relative;
	z-index: 2;
	top: 2px;
}

.i-color-toggle-icon-highlight {
	position: absolute;
	width: 28px;
	height: 50px;
	background: #eee;
	border-radius: 4px;
	top: 5px;
	left: 4px;
}

.i-color-hue-wrap {
	position: relative;
	height: 10px;
	margin-bottom: 8px;
}

.i-color-alpha-wrap {
	position: relative;
	height: 10px;
}

.i-color-hue-wrap .vc-hue {
	border-radius: 2px;
}

.i-color-alpha-wrap .vc-alpha-gradient {
	border-radius: 2px;
}

.i-color-hue-wrap .vc-hue-picker,
.i-color-alpha-wrap .vc-alpha-picker {
	width: 12px;
	height: 12px;
	border-radius: 6px;
	transform: translate(-6px, -2px);
	background-color: rgb(248, 248, 248);
	box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.37);
}

.i-color-body {
	padding: 16px 16px 12px;
	background-color: #fff;
}

.i-color-saturation-wrap {
	width: 100%;
	padding-bottom: 55%;
	position: relative;
	border-radius: 2px 2px 0 0;
	overflow: hidden;
}

.i-color-saturation-wrap .vc-saturation-circle {
	width: 12px;
	height: 12px;
}

.i-color-fields .vc-input__input {
	font-size: 11px;
	color: #333;
	width: 100%;
	border-radius: 2px;
	border: none;
	box-shadow: inset 0 0 0 1px #dadada;
	height: 21px;
	text-align: center;
}

.i-color-fields .vc-input__label {
	text-transform: uppercase;
	font-size: 11px;
	line-height: 11px;
	color: #969696;
	text-align: center;
	display: block;
	margin-top: 12px;
}

.i-color__disable-alpha .i-color-active-color {
	width: 18px;
	height: 18px;
}

.i-color__disable-alpha .i-color-color-wrap {
	width: 30px;
}

.i-color__disable-alpha .i-color-hue-wrap {
	margin-top: 4px;
	margin-bottom: 4px;
}

.i-color-controls .straw-picker {
	width: 30px;
	height: 30px;
	border-radius: 30px;
	box-sizing: border-box;
	margin-right: 10px;
	font-size: 0;
	background: url("./icons/icon_straw_picker.svg") center no-repeat;
}

.i-color-controls .straw-picker.active,
.i-color-controls .straw-picker:hover {
	background: url("./icons/icon_strwa_picker_active.svg") center no-repeat;
}

.i-color-controls .color-straw {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	top: 0;
	background-color: rgba(0, 0, 0, 0.55);
	z-index: 9999;
}

.i-color-controls .color-straw img {
	cursor: crosshair;
}

.i-color-controls .color-straw .color-select {
	display: none;
}

.i-color-field--double {
	flex: 2;
}

.i-color-presets {
	margin-right: -10px;
	margin-left: -10px;
	padding-left: 5px;
	padding-top: 10px;
	border-top: 1px solid #eee;
	margin-top: 10px;
}

.i-color-presets-color {
	border-radius: 3px;
	overflow: hidden;
	position: relative;
	display: inline-block;
	margin: 0 10px 10px 0;
	vertical-align: top;
	cursor: pointer;
	width: 16px;
	height: 16px;
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
}

.i-color-presets-color .vc-checkerboard {
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
	border-radius: 3px;
}
</style>
