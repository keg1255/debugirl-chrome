<template>
	<div class="i-code" :style="style">
		<div class="i-code__editor"></div>
	</div>
</template>
<script>
import {debounce, loadjs} from "@/common/utils";
export default {
	name: "ICode",
	components: {},
	props: {
		modelValue: String,
		value: String,
		language: String,
		theme: String,
		readonly: {
			type: Boolean,
			default: false,
		},
	},
	emits: ["input", "update:modelValue", "load", "scroll"],
	data() {
		return {
			style: "",
		};
	},
	computed: {
		language1() {
			if (this.language === "js") return "javascript";
			if (this.language === "ts") return "typescript";
			return this.language;
		},
	},
	watch: {
		language() {
			if (this.editor) {
				this.refresh();
			}
		},
		value(val) {
			if (this.editor && this._prev !== val) {
				this.editor.setValue(val);
			}
		},
		modelValue(val) {
			if (this.editor && this._prev !== val) {
				this.editor.setValue(val);
			}
		},
	},
	mounted() {
		window.MonacoEnvironment = {
			getWorkerUrl: function (moduleId, label) {
				if (label === "json") {
					return "js/monaco/jsonWorker.js";
				}
				if (label === "css") {
					return "js/monaco/cssWorker.js";
				}
				if (label === "html") {
					return "js/monaco/htmlWorker.js";
				}
				if (label === "typescript" || label === "javascript") {
					return "js/monaco/tsWorker.js";
				}
				return "js/monaco/editorWorker.js";
			},
		};
		this.refresh();
	},
	beforeUnmount() {
		if (this.editor) {
			this.editor.dispose();
		}
	},
	methods: {
		refresh: debounce(function () {
			let parent = this.$el.parentElement;
			if (parent) this.style = `height: ${parent.clientHeight}px;`;
			loadjs("vs/loader.js")
				.then(
					() =>
						new Promise(function (resolve, reject) {
							window.require(["vs/editor/editor.main"], function () {
								loadjs("vs/language-log.js").then(() => resolve(window.monaco));
							});
						})
				)
				.then(async (monaco) => {
					if (this.editor) this.editor.dispose();
					let el = this.$el.querySelector(".i-code__editor");
					monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
						validate: true,
						allowComments: true,
						schemaValidation: "error",
					});
					let all = [
						"debugirl/index.d.ts",
						"debugirl/ChromeClient.d.ts",
						"debugirl/ChromeTab.d.ts",
					].map(async (x) => {
						let text = await fetch(x).then((x) => x.text());
						monaco.languages.typescript.javascriptDefaults.addExtraLib(text, x);
					});
					await Promise.all(all);
					const editor = monaco.editor.create(el, {
						value: this.value || this.modelValue,
						wordWrap: "on",
						theme: this.theme || "vs",
						language: this.language1 || "javascript",
						automaticLayout: true,
					});
					this.addFormatCommand(monaco, editor);
					editor.onDidChangeModelContent((e) => {
						this._prev = editor.getValue();
						this.$emit("input", this._prev);
						this.$emit("update:modelValue", this._prev);
					});
					editor.onDidScrollChange((e) => {
						this.$emit("scroll", e);
					});
					this.editor = editor;
					this.$emit("load", editor);
				});
		}),
		addFormatCommand(/** @type {import("monaco-editor")} */ monaco, editor) {
			let parser = "";
			switch (this.language1) {
				case "typescript":
					parser = "typescript";
					break;
				case "css":
					parser = "css";
					break;
				case "html":
					parser = "html";
					break;
				case "json":
					parser = "json";
					break;
				case "javascript":
					parser = "babel";
					break;
			}
			if (!parser) return;
			editor.addAction({
				id: "format-with-prettier",
				label: "Format with Prettier",
				keybindings: [
					monaco.KeyMod.chord(
						monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
						monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF
					),
				],
				precondition: null,
				keybindingContext: null,
				contextMenuGroupId: "navigation",
				contextMenuOrder: 1.5,
				run: (ed) => {
					Promise.all([
						import("prettier/esm/standalone.mjs"),
						import("prettier/esm/parser-babel.mjs"),
						import("prettier/esm/parser-postcss.mjs"),
						import("prettier/esm/parser-html.mjs"),
					])
						.then((list) => list.map((x) => x.default))
						.then(([prettier, babel, postcss, html]) => {
							let formatted = prettier.format(ed.getValue(), {
								parser: parser,
								printWidth: 100,
								tabWidth: 2,
								useTabs: true,
								semi: true,
								singleQuote: false,
								bracketSpacing: false,
								arrowParens: "always",
								endOfLine: "lf",
								plugins: [babel, postcss, html],
							});
							ed.setValue(formatted);
						});
				},
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-code {
	width: 100%;
	height: 100%;
	> div {
		width: 100%;
		height: 100%;
	}
}
</style>
