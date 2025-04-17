<template>
	<div class="i-post-catalog">
		<div class="catalog-title">目录</div>
		<div class="catalog-body">
			<ul class="catalog-list">
				<li v-for="(item, i) in tree" :key="i" class="item d1" :class="{active: item.id == hash}">
					<div v-if="item.text" class="a-container">
						<NuxtLink
							:to="toHash(item.id)"
							:title="item.tag + ':' + item.text"
							class="catalog-aTag"
						>
							{{ d(item.text) }}
						</NuxtLink>
					</div>
					<ul v-if="item.children" class="sub-list">
						<li
							v-for="(sub, j) in item.children"
							:key="j"
							class="item d2"
							:class="{active: sub.id == hash}"
						>
							<div v-if="sub.text" class="a-container">
								<NuxtLink
									:to="toHash(sub.id)"
									:title="sub.tag + ':' + sub.text"
									class="catalog-aTag"
								>
									{{ d(sub.text) }}
								</NuxtLink>
							</div>
							<ul v-if="sub.children" class="sub-list">
								<li
									v-for="(sub3, k) in sub.children"
									:key="k"
									class="item d3"
									:class="{active: sub3.id == hash}"
								>
									<div class="a-container">
										<NuxtLink
											:to="toHash(sub3.id)"
											:title="sub3.tag + ':' + sub3.text"
											class="catalog-aTag"
										>
											{{ d(sub3.text) }}
										</NuxtLink>
									</div>
								</li>
							</ul>
						</li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
import {decodeHTML} from "@/common/utils";
export default {
	name: "IPostCatalog",
	components: {},
	props: {
		html: {type: String, default: ""},
	},
	data() {
		return {
			hash: "",
		};
	},
	computed: {
		list() {
			let list = [];
			if (this.html)
				this.html.replace(/<(h[\d])(\s[^>]*>|>)([^]+?)<\/\1>/gi, function (x0, tag, x2, text) {
					tag = tag.toLowerCase();
					let m = /\sid=("[^"]+"|'[^']+'|\S+)/.exec(x2);
					let id = m ? m[1].replace(/['"]/g, "") : "";
					text = text.replace(/<[^>]+>/g, "");
					list.push({tag, id, text});
				});
			return list;
		},
		tree() {
			let tree = [];
			let h = [{children: tree}];
			this.list.forEach(({tag, id, text}) => {
				let n = parseInt(tag[1]);
				for (let i = 1; i < n; i++) {
					if (!h[i]) {
						h[i] = {id, text: "", tag: "h1", children: []};
						h[i - 1].children.push(h[i]);
					}
				}
				h[n] = {id, text, tag};
				h[n - 1].children = h[n - 1].children || [];
				h[n - 1].children.push(h[n]);
			});
			while (tree.length == 1 && !tree[0].text) tree = tree[0].children;
			return tree;
		},
	},
	mounted() {
		document.addEventListener("scroll", this.refresh);
		this.refresh();
	},
	beforeUnmount() {
		document.removeEventListener("scroll", this.refresh);
	},
	methods: {
		toHash(hash) {
			return {query: this.$route.query, hash: "#" + hash};
		},
		refresh(e) {
			e && e.preventDefault();
			let id = "";
			let i = 0;
			for (; i < this.list.length; i++) {
				let item = this.list[i];
				if (!item.id) continue;
				let el = document.getElementById(item.id);
				let rect = el.getBoundingClientRect();
				if (rect.top > window.innerHeight) {
					break;
				}
				if (rect.top >= 0) {
					id = item.id;
					break;
				}
				id = item.id;
			}
			let el = this.$el.querySelector(".catalog-body");
			el.scroll({
				top: (i - 4) * 44,
				behavior: "smooth",
			});
			this.hash = id;
		},
		d(html) {
			return decodeHTML(html);
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-post-catalog {
	.catalog-title {
		font-weight: 500;
		padding: 16px 0;
		margin: 0 20px;
		font-size: 16px;
		line-height: 2;
		color: #1d2129;
		border-bottom: 1px solid #e4e6eb;
	}
	.catalog-body {
		position: relative;
		max-height: 440px;
		margin: 8px 4px 0 0;
		.scroll-y;
	}
	.catalog-list {
		position: relative;
		line-height: 22px;
		padding: 0 0 12px;
		.item {
			margin: 0;
			padding: 0;
			font-size: 14px;
			font-weight: 400;
			line-height: 22px;
			color: #333;
			list-style: none;
			> .a-container {
				display: block;
				position: relative;
				padding: 0 0 0 12px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				&:hover {
					.catalog-aTag {
						background-color: #f7f8fa;
						border-radius: 4px;
					}
				}
			}
			&.active {
				> .a-container {
					color: #007fff;
					&::before {
						content: "";
						position: absolute;
						top: 4px;
						left: 0;
						margin-top: 7px;
						width: 4px;
						height: 16px;
						background: #1e80ff;
						border-radius: 0 4px 4px 0;
					}
				}
			}
			&.d2 > .a-container {
				padding-left: 26px;
			}
			&.d3 > .a-container {
				padding-left: 41px;
			}
		}
		.catalog-aTag {
			color: inherit;
			display: inline-block;
			padding: 8px;
			width: 90%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}
</style>
