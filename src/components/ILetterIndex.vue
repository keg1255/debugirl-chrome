<template>
	<div class="i-letter-index">
		<div class="__scroll" :style="{paddingTop: height + 'px'}" @scroll="onScroll">
			<div v-if="tops && tops.length" class="__group __tops">
				<div class="__list">
					<div v-for="(item, i) in tops" :key="i" class="__item" @click="input(item)">
						{{ item.label }}
					</div>
				</div>
			</div>
			<div v-for="(list1, i) in list" :key="i" class="__group">
				<div class="__title">{{ list1.label }}</div>
				<div class="__list">
					<div v-for="(item, j) in list1.children" :key="j" class="__item" @click="input(item)">
						{{ item.label }}
					</div>
				</div>
			</div>
		</div>
		<div class="__letters">
			<div
				v-for="(item, i) in list"
				:key="i"
				class="__item"
				:class="{active: letter == item.label}"
				@click="onClick(item)"
			>
				{{ item.label }}
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "ILetterIndex",
	components: {},
	props: {
		list: {type: Array, required: true},
		tops: Array,
		value: String,
	},
	data() {
		return {
			letter: "A",
			height: 0,
		};
	},
	computed: {
		group() {
			let v = this.value;
			for (let group of this.list.filter((x) => x && x.children)) {
				for (let item of group.children) {
					if (item.value === v) {
						return group;
					}
				}
			}
			return null;
		},
		letter0() {
			let group = this.group;
			return group ? group.children.find((x) => x.value === this.value).label : "A";
		},
	},
	watch: {
		letter0(v) {
			this.letter = v;
		},
	},
	mounted() {
		let el = this.$el.querySelector(".__tops");
		this.height = el ? el.offsetHeight : 0;
	},
	methods: {
		onScroll(e) {
			console.log("onScroll");
			let els = this.$el.querySelectorAll(".__title");
			let p = this.$el.getBoundingClientRect();
			for (let i = 0; i < els.length; i++) {
				let el = els[i];
				let rect = el.getBoundingClientRect();
				if (rect.top >= p.top && rect.top <= p.bottom) {
					this.letter = el.innerText;
					break;
				}
			}
		},
		onClick(group) {
			let els = this.$el.querySelectorAll(".__title");
			let scroll = this.$el.querySelector(".__scroll");
			for (let i = 0; i < els.length; i++) {
				let el = els[i];
				if (el.innerText === group.label) {
					scroll.scroll({
						top: el.offsetTop - this.height - 12,
						behavior: "smooth",
					});
					break;
				}
			}
			setTimeout(() => {
				this.letter = group.label;
			});
		},
		input(item) {
			this.$emit("input", item.value);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-letter-index {
	background: #fff;
	border: 1px solid #dce2ec;
	border-radius: 4px;
	box-shadow: 0 4px 10px rgba(132, 148, 189, 0.251);
	position: relative;
	font-size: 14px;
	line-height: 1.2;
	> .__scroll {
		padding: 0 23px 0 17px;
		height: 430px;
		font-size: 14px;
		.scroll-y;
		> .__group {
			> .__title {
				line-height: 17px;
				width: 11px;
				height: 14px;
				margin-top: 12px;
				font-family: Microsoft YaHei UI-Bold, Microsoft YaHei UI;
				font-weight: 700;
				color: #c5ccd5;
			}
			> .__list {
				display: flex;
				flex-wrap: wrap;
				> .__item {
					width: 33%;
					margin: 10px 0 8px;
					cursor: pointer;
					&:hover {
						color: #409eff;
					}
				}
			}
		}
		> .__tops {
			margin-bottom: 10px;
			padding-bottom: 10px;
			border-bottom: 1px solid #ebeef5;
			position: absolute;
			top: 0;
			left: 17px;
			right: 23px;
			background-color: #fff;
			> .__list {
				> .__item {
					margin: 12px 0 0;
					font-size: 13px;
				}
			}
		}
	}
	> .__letters {
		position: absolute;
		right: 7px;
		top: 7px;
		color: #c5c5c5;
		> .__item {
			width: 20px;
			height: 20px;
			line-height: 20px;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-weight: 400;
			font-size: 12px;
			cursor: pointer;
			&.active {
				background: rgba(1, 136, 255, 0.2);
				color: #0188ff;
			}
		}
	}
}
</style>
