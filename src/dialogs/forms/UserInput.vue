<template>
	<div class="forms-user-input normal-input">
		<input
			v-model="keyword"
			class="form-input"
			type="text"
			:placeholder="placeholder"
			@focus="open = true"
			@blur="open = false"
			@click="open = true"
			@keypress.up.prevent="open && index--"
			@keypress.down.prevent="open && index++"
			@keypress.enter.prevent="open && submit(index)"
		/>
		<i-popup :open="open" full-width aim="parent">
			<ul>
				<li v-for="(item, i) in users" :key="i" :class="{active: i == idx}" @click="submit(i)">
					<img :src="item.avatar" alt="" referrerpolicy="no-referrer" />
					{{ item.nickname }}
				</li>
			</ul>
		</i-popup>
	</div>
</template>
<script>
import axios from "~/lib/axios";
import {addUsers} from "~/stores/actions";
export default {
	name: "UserInput",
	components: {},
	props: {
		label: String,
		value: {},
		modelValue: {},
	},
	emits: ["input", "update:modelValue"],
	data() {
		let val = this.value == null ? this.modelValue : this.value;
		return {
			keyword: val,
			value0: val,
			open: false,
			placeholder: "",
			index: 0,
		};
	},
	computed: {
		idx() {
			return this.index % this.users.length;
		},
		users() {
			return Object.values(app.userMap);
		},
	},
	watch: {
		keyword(val) {
			if (isNaN(+val)) {
				if (this.val != this.value0) {
					console.log("input", this.value0);
					this.onInput(this.value0);
				}
			} else {
				console.log("input", +val);
				this.onInput(+val);
			}
		},
		value() {
			this.refresh();
		},
	},
	async mounted() {
		if (!this.users.length)
			await axios.apiGet("/users/list").then(({list}) => {
				addUsers(list);
			});
		this.refresh();
	},
	methods: {
		onInput(v) {
			this.$emit("input", v);
			this.$emit("update:modelValue", v);
		},
		refresh() {
			let idx = this.users.findIndex((item) => item.id == this.value);
			if (idx >= 0) {
				this.index = idx;
				this.placeholder = this.users[idx].nickname;
			} else {
				this.placeholder = this.value;
			}
		},
		submit(i) {
			this.open = false;
			let user = this.users[i];
			if (user) {
				this.index = i;
				this.keyword = user.id;
				this.placeholder = user.nickname;
				this.onInput(user.id);
			}
		},
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.forms-user-input {
	.i-popup {
		z-index: 1;
		ul {
			min-width: 80px;
			min-height: 60px;
			max-height: 45vh;
			.scroll-y;
			li {
				padding: 3px 12px !important;
				display: flex;
				align-items: center;
				&.active {
					background-color: #f5f5f5;
				}
			}
		}
		img {
			width: 24px;
			height: 24px;
			border-radius: 50%;
			margin-right: 3px;
		}
	}
}
</style>
