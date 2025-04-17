<template>
	<hd-dialog-center>
		<div class="dialogs-upgrade">
			<div class="title">
				<span class="title-name">检查新版本</span>
				<i-svg class="title-close" name="close" @click="$emit('close')"></i-svg>
			</div>
			<div v-if="updating" class="updating">
				<div class="updateicon">
					<img :src="`images/loading1.png`" alt="" />
				</div>
				<div class="updateText">新版本下载中...</div>
			</div>
			<div v-else>
				<div class="content">
					<div class="d_1st">
						<img :src="`icon.png`" alt="" />
					</div>
					<div class="d_2nd">{{ softname }}</div>
					<div class="d_3rd">版本号 {{ softversion }}</div>
				</div>
				<div class="bottom">
					<div v-if="!checked" class="updateChecking">版本检测中，请稍后...</div>
					<div v-else-if="!success" class="updateFail">检测失败</div>
					<div v-else-if="compare >= 0" class="isNew">当前已是最新版本</div>
					<div v-else class="updateTo" @click="updateVersion">更新至{{ newV }}</div>
				</div>
			</div>
		</div>
	</hd-dialog-center>
</template>
<script>
import config from "~/lib/config";

export default {
	name: "Upgrade",
	components: {},
	props: {
		name: String,
	},
	emits: ["close"],
	data() {
		return {
			version: config.version,
			softname: config.productName,
			softversion: config.softversion,
			updating: false, // 更新中
			checked: false, // 已检查
			success: false,
			isNew: false,
			newV: "",
		};
	},
	computed: {
		compare() {
			let old = this.version.split(".");
			let newV = this.newV.split(".");
			for (let i = 0; i < old.length; i++) {
				let v = old[i] - newV[i];
				if (v) return v;
			}
			return 0;
		},
	},
	mounted() {
		this.check();
	},
	methods: {
		check() {
			return getversioninfo()
				.then((res) => {
					this.checked = true;
					this.success = true;
					this.newV = res.version;
				})
				.catch((err) => {
					this.checked = true;
					this.success = false;
					console.error(err);
				});
		},
		updateVersion() {
			if (window.process.platform == "win32") {
				this.updating = true;
				this.upgradeWin();
			}
		},
		async upgradeWin() {
			const userData = remote.app.getPath("userData");
			const updateExe = userData + "/upgrade.exe";
			const updateBat = userData + "/upgrade.bat";
			const child_process = window.require("child_process");
			if (!(await fs.pathExists(updateExe))) {
				let buf = await fetch("https://tj2.sjhfrj.com/software/410?s=1").then((x) =>
					x.arrayBuffer()
				);
				await fs.writeFile(updateExe, Buffer.from(buf));
			}
			const spa = child_process.exec(`${updateBat}`, {
				cwd: userData,
			});
			spa.on("error", (err) => {
				console.error("Failed to start subprocess.", err);
			});
			spa.unref();
			setTimeout(() => {
				remote.app.quit();
			}, 1200);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.dialogs-upgrade {
	height: 281px;
	width: 380px;
	position: relative;
	color: #333333;
	background-color: #fff;
	border-radius: 4px;
	> .title {
		font-family: "Microsoft YaHei UI";
		font-style: normal;
		font-weight: 400;
		font-size: 12px;
		color: #333333;
		position: relative;
		height: 45px;
		line-height: 45px;
		.title-name {
			padding-left: 15px;
		}
		.title-close {
			position: absolute;
			right: 10px;
			top: 14px;
			font-size: 16px;
			cursor: pointer;
			display: inline-block;
			width: 16px;
			height: 16px;
			color: #999;
			&:hover {
				color: #fa5e5e;
			}
			&:active {
				color: #ec1e1e;
			}
		}
	}
	> .updating {
		text-align: center;
		.updateicon {
			margin-top: 40px;
			> img {
				width: 64px;
				height: 64px;
				animation: rotating 1s linear infinite;
			}
		}
		.updateText {
			font-family: "Microsoft YaHei UI";
			font-style: normal;
			font-weight: 700;
			font-size: 16px;
			color: #333333;
			margin-top: 25px;
		}
		@keyframes rotating {
			0% {
				transform: rotate(0);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	}
	.content {
		text-align: center;
		.d_1st {
			> img {
				width: 55px;
				height: 55px;
			}
			margin-top: 26px;
		}
		.d_2nd {
			margin-top: 18px;
			font-family: "Microsoft YaHei UI";
			font-style: normal;
			font-weight: 700;
			font-size: 16px;
		}
		.d_3rd {
			margin-top: 16px;
			color: #2f71ff;
		}
	}
	.bottom {
		text-align: center;
		position: absolute;
		bottom: 26px;
		left: 0;
		right: 0;

		.isNew {
			font-size: 14px;
			color: #2f71ff;
		}
		.updateTo {
			width: 120px;
			height: 40px;
			line-height: 40px;
			font-size: 14px;
			display: inline-block;
			text-align: center;
			background: #399aef;
			border-radius: 4px;
			font-size: 16px;
			font-family: Microsoft YaHei-Regular, Microsoft YaHei;
			font-weight: 400;
			color: #fff;
			cursor: pointer;
			&:hover {
				background: #7abffc;
			}
			&:active {
				background: #1e76de;
			}
		}
		.updateChecking {
			font-size: 14px;
			color: #2f71ff;
		}
		.updating {
			font-size: 14px;
			color: #2f71ff;
		}
		.updateFail {
			font-size: 14px;
			color: #ec1e1e;
		}
	}
}
</style>
