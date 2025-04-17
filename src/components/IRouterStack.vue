<template>
	<div class="i-router-stack">
		<component
			:is="item.component"
			v-for="(item, i) in stacks"
			:key="i"
			:kk="i"
			v-bind="item.props"
		></component>
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "IRouterStack",
	components: {},
	props: {
		hash: Boolean, // 是否把堆栈深度记录在url中 (当使用浏览器输入地址或者浏览器返回键时比较有用)
	},
	data() {
		return {
			list: [],
		};
	},
	computed: {
		stacks() {
			let {state, params, path, query} = this.$route;
			let list = this.list.concat([{state, params, path, query}]).map((props) => {
				let route = this.$router.resolve(props);
				let component = route.matched[0];
				component = component && component.components.default;
				return {props, component};
			});
			return list;
		},
	},
	mounted() {
		const hash = this.hash;
		const router = this.$router;
		let list = [];
		// try {
		// 	list = JSON.parse(sessionStorage.getItem("i-router-stack")) || [];
		// } catch (error) {}
		function makeLocation(location) {
			if (!hash) return location;
			if (typeof location === "string") location = {path: location};
			if (location.query) location.query.h_ = list.length;
			else location.query = {h_: list.length};
			return location;
		}
		function saveStack() {
			try {
				sessionStorage.setItem("i-router-stack", JSON.stringify(list));
			} catch (error) {
				console.error(error);
			}
		}
		router.push = (function (_push) {
			return function (location) {
				let {state, params, path, query} = router.currentRoute;
				// 防止触发数据变化
				list[list.length] = {state, params, path, query};
				saveStack();
				arguments[0] = makeLocation(location);
				return _push.apply(this, arguments);
			};
		})(router.push);
		router.replace = (function (_replace) {
			return function (location) {
				arguments[0] = makeLocation(location);
				return _replace.apply(this, arguments);
			};
		})(router.replace);
		router.back = function () {
			if (list.length) {
				// 防止触发数据变化
				let props = list[list.length - 1];
				list.length--;
				saveStack();
				this.replace(props);
			} else {
				this.replace("/");
			}
		};
		if (hash) {
			if (router.currentRoute.query.h_ < list.length) list.length = +router.currentRoute.query.h_;
			if (router.currentRoute.query.h_ != list.length) {
				let {params, path, query} = router.currentRoute;
				router.replace({params, path, query});
			}
		}
		this.list = list;
	},
	methods: {},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-router-stack {
	> :first-child {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		.scroll-y;
	}
}
</style>
