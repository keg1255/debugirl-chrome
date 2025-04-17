<template>
	<div class="i-address-bar">
		<i-svg
			class="btn"
			name="home"
			hover="#077eff"
			:title="$t('returnToRootDirectory')"
			@click="setPath('')"
		/>
		<i-svg
			class="btn"
			name="arrow-left"
			:disabled="!history.length"
			hover="#077eff"
			:title="$t('return')"
			@click="goBack()"
		/>
		<i-svg
			class="btn"
			name="arrow-up"
			hover="#077eff"
			:disabled="!value"
			:title="$t('returnToSuperior')"
			@click="goUp()"
		/>
		<div class="address-input" @click.self="edit()">
			<input
				v-show="path != null"
				ref="input"
				v-model="path"
				type="text"
				@keypress.enter="setPath(path)"
				@blur="onBlur()"
				@focus="showPaths = true"
			/>
			<div v-show="path == null" class="paths">
				<div
					v-for="(item, i) in curPaths"
					:key="i"
					class="path"
					:title="item.path"
					@click="setPath(item.path)"
				>
					{{ $util.limit(item.name, 10) + sep }}
				</div>
			</div>
			<i-svg
				v-show="path == null"
				class="dropdown"
				hover="#077eff"
				name="trangle-down"
				@click="showPaths = true"
			/>
			<i-svg
				v-show="path != null"
				:rotate="180"
				class="small"
				name="arrow-left"
				hover="#077eff"
				:title="$t('goTo')"
				@click="setPath(path)"
			/>
			<i-popup :open.sync="showPaths" close-content>
				<ul>
					<li v-for="(item, i) in paths" :key="i" @click="setPath(item)">{{ item }}</li>
				</ul>
			</i-popup>
		</div>
		<i-svg
			class="btn"
			name="refresh"
			hover="#077eff"
			:title="$t('refresh')"
			@click="setPath(value)"
		/>
	</div>
</template>
<script>
import {dirname} from "@/common/utils";
export default {
	name: "IAddressBar",
	components: {},
	props: {
		name: String,
		value: String,
		paths: Array,
	},
	data() {
		return {
			path: null,
			history: [],
			redo: [],
			showPaths: 0,
		};
	},
	computed: {
		sep() {
			if (/^\w:/.test(this.value)) return "\\";
			return "/";
		},
		curPaths() {
			if (!this.value) return [];
			let s = "";
			let list = [];
			for (let item of this.value.split(/\\|\//)) {
				if (!item) continue;
				s += item + this.sep;
				list.push({
					name: item,
					path: s,
				});
			}
			return list;
		},
	},
	watch: {
		value(n, o) {
			if (this.redo[this.redo.length - 1] != o) this.history.push(o);
		},
	},
	mounted() {},
	methods: {
		onBlur() {
			setTimeout(() => {
				this.path = null;
			}, 300);
		},
		goBack() {
			this.redo.push(this.value);
			this.$emit("change", this.history.pop());
		},
		goForward() {
			this.$emit("change", this.redo.pop());
		},
		goUp() {
			this.$emit("change", dirname(this.value));
		},
		setPath(path) {
			this.$emit("change", path);
		},
		edit() {
			this.path = this.value || "";
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";

.i-address-bar {
	line-height: 22px;
	position: relative;
	display: flex;
	align-items: center;
	.i-svg {
		width: 22px;
		height: 22px;
		margin: 0 8px;
		&.small {
			width: 12px;
			height: 12px;
		}
	}
	> .iconfont {
		float: left;
	}
	.iconfont {
		margin-right: 6px;
		.magic-link(@primary);
	}
	.address-input {
		font-family: monospace;
		position: relative;
		border: 1px solid #e2e8f0;
		height: 28px;
		line-height: 28px;
		padding-left: 12px;
		display: flex;
		align-items: center;
		flex: 1;
		input {
			flex: 1;
			outline: none;
			border: 0;
			background-color: transparent;
			padding-left: 1px;
		}
		.paths {
			margin-right: 4em;
			white-space: nowrap;
			.scroll-x();
			> .path {
				display: inline-block;
				min-width: 23px;
				text-align: center;
				.magic-bg-link(#E5F3FF,#E5F3FF);
			}
		}
		.dropdown {
			position: absolute;
			right: 0;
			width: 12px;
			height: 12px;
		}
		.i-popup {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			li {
				text-align: left;
				.magic-bg-link(@bglink);
			}
		}
	}
}
</style>
