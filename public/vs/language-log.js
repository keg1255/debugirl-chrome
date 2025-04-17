function extendDefaults() {
	for (let i = 1; i < arguments.length; i++) {
		if (!arguments[i]) {
			continue;
		}
		for (const key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key)) {
				arguments[0][key] = arguments[i][key];
			}
		}
	}
	return arguments[0];
}

monaco.languages.register({id: "log"});
monaco.languages.setMonarchTokensProvider("log", {
	defaultToken: "",
	tokenPostfix: ".log",
	tokenizer: {
		root: [
			[
				/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})( \[access\])( info:)( \d+\.\d+\.\d+\.\d+)(#?\d*)( ?\d*)( \w+)( \S+)( \d+)( \d+ms)( [^\n]+)/,
				[
					"date",
					"label",
					"level",
					"ip",
					"error",
					"uid",
					{
						cases: {
							" $7 == GET": "get_method",
							" $7 == POST": "post_method",
							"@default": "method",
						},
					},
					"url",
					"code",
					"time",
					"ua",
				],
			],
			[
				/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})( \[\w+\] )(\w+)(:)/,
				["date", "label", {token: "$3", next: "$3:message"}, "normal"],
			],
		],
		"debug:message": [[/[^\n]+/, "debug", "@pop"]],
		"info:message": [[/[^\n]+/, "info", "@pop"]],
		"warn:message": [[/[^\n]+/, "warn", "@pop"]],
		"error:message": [[/[^\n]+/, "error", "@pop"]],
	},
});

monaco.editor.defineTheme("logview", {
	base: "vs",
	inherit: true,
	rules: [
		{token: "date.log", foreground: "#999D9B"},
		{token: "label.log", foreground: "#3CB3C2", fontStyle: "bold"},
		{token: "debug.log", foreground: "#918E97"},
		{token: "info.log", foreground: "#8cc265"},
		{token: "warn.log", foreground: "#FFA500"},
		{token: "error.log", foreground: "#ff0000", fontStyle: "bold"},
		{token: "level.log", foreground: "#8CC265"},
		{token: "ip.log", foreground: "#2C7BE4"},
		{token: "uid.log", foreground: "#5F4CD7", fontStyle: "bold"},
		{token: "method.log", foreground: "#f56c6c"}, // 未匹配的method
		{token: "get_method.log", foreground: "#e6a23c"},
		{token: "post_method.log", foreground: "#0431fa"},
		{token: "url.log", foreground: "#409eff", fontStyle: "bold"},
		{token: "code.log", foreground: "#9EB2BF"},
		{token: "time.log", foreground: "#9EB2BF"},
		{token: "ua.log", foreground: "#918E97"},
		{token: "message.log", foreground: "#ABB2BF"},
	],
	colors: {
		"editor.lineHighlightBackground": "#ffffff",
		"editorGutter.background": "#f7f7f7",
	},
});
