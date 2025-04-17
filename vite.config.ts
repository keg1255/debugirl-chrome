import {defineConfig} from "vite";
import {crx} from "@crxjs/vite-plugin";
import vue from "@vitejs/plugin-vue";
import manifest from "./src/manifest";
import {resolve} from "path";
import Components from "unplugin-vue-components/vite";
import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
	const production = mode === "production";

	return {
		build: {
			cssCodeSplit: true,
			emptyOutDir: true,
			outDir: "build",
			rollupOptions: {
				output: {
					chunkFileNames: "assets/chunk-[hash].js",
				},
			},
		},
		resolve: {
			alias: {
				"~": resolve(__dirname, "src"),
				"@": resolve(__dirname, "src"),
				"~@": resolve(__dirname, "src"),
			},
		},
		plugins: [
			crx({manifest}),
			vue({
				template: {
					transformAssetUrls: {
						"i-svg": ["src"],
					},
				},
			}),
			svgLoader({
				defaultImport: "raw",
			}),
			Components({
				resolvers: [
					(name) => {
						if (name.startsWith("HdAdmin")) {
							return "@/hd/admin/" + name.slice(7) + ".vue";
						}
						if (name.startsWith("Hd")) {
							return "@/hd/" + name.slice(2) + ".vue";
						}
					},
				],
			}),
		],
		legacy: {
			skipWebSocketTokenCheck: true,
		},
	};
});

function toCamelCase(str: string) {
	return str.replace(/(-|^)([a-z])/g, (_, h, char) => char.toUpperCase());
}
