const TS_RULES = {
	"no-undef": 0,
	"no-use-before-define": 0,
};
const RULES = {
	"no-var": 0,
	"no-undef": 2,
	camelcase: 0,
	eqeqeq: 0,
	"no-unreachable": 0,
	"no-console": 0,
	"no-lonely-if": 0,
	"no-constant-condition": 0,
	"object-shorthand": 0,
	"rules/prefer-includes": 0,
	"no-empty": 0,
	"no-redeclare": 0,
	"prefer-spread": 0,
	"prefer-const": 0,
	"no-prototype-builtins": 0,
	"no-new-func": 0,
	"no-control-regex": 0,
	"no-useless-escape": 0,
	"prefer-promise-reject-errors": 0,
	"require-await": 0,
	"no-throw-literal": 0,
	"prefer-rest-params": 0,
	"no-template-curly-in-string": 0,
	"no-use-before-define": ["error", {functions: false, classes: false}],
	"no-else-return": ["error", {allowElseIf: false}],
	"import/order": 0,
	"new-cap": 0,
	"no-inner-declarations": 0,
	// typescript
	"@typescript-eslint/explicit-module-boundary-types": 0,
	"@typescript-eslint/no-explicit-any": 0,
	"@typescript-eslint/no-use-before-define": [
		"error",
		{functions: false, classes: false, typedefs: false},
	],
	"@typescript-eslint/no-unused-vars": ["warn", {args: "none", varsIgnorePattern: "^_"}],
	"@typescript-eslint/no-empty-function": [1, {allow: ["methods"]}],
	"@typescript-eslint/no-namespace": 0,
	"@typescript-eslint/ban-types": 0,
	// vue
	"vue/html-self-closing": 0,
	"vue/html-indent": 0,
	"vue/max-attributes-per-line": 0,
	"vue/singleline-html-element-content-newline": 0,
	"vue/require-default-prop": 0,
	"vue/multi-word-component-names": 0,
	"vue/html-closing-bracket-newline": 0,
	"vue/require-prop-types": 0,
	"vue/prop-name-casing": 0,
	"vue/v-on-event-hyphenation": 0,
	"vue/no-v-html": 1,
	"vue/no-v-text-v-html-on-component": 0,
	"vue/html-quotes": [1, "double", {avoidEscape: true}],
	"vue/no-mutating-props": [
		"error",
		{
			shallowOnly: true,
		},
	],
};

module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 12, // 设置 ECMAScript 版本为 2021
		sourceType: "module", // 支持 ES 模块
	},
	extends: [
		"eslint:recommended", // 使用 ESLint 推荐的规则
		"plugin:@typescript-eslint/recommended", // 使用 TypeScript 推荐的规则
		"plugin:prettier/recommended", // 加入 Prettier 配置
		"plugin:vue/vue3-recommended", // 启用 Vue 3 推荐规则
		"@vue/typescript/recommended",
	],
	plugins: ["@typescript-eslint", "prettier", "vue"],
	globals: {
		chrome: "readonly",
		win: "readonly",
		keepAlive: "readonly",
		makeCode: "readonly",
		getStore: "readonly",
		setStore: "readonly",
		setNextAt: "readonly",
		waitUntil: "readonly",
		sleep: "readonly",
	},
	// add your custom rules here
	rules: RULES,
	overrides: [
		{
			files: ["*.ts"],
			parser: "@typescript-eslint/parser", // 使用 TypeScript 解析器
			extends: [],
			rules: Object.assign({}, RULES, TS_RULES),
		},
		{
			files: ["*.vue"],
			rules: Object.assign({}, RULES, TS_RULES),
		},
	],
};
