<template>
	<VipBuyMobile v-if="ua.mobile" @close="$emit('close', $event)"></VipBuyMobile>
	<VipBuyPC v-else @close="$emit('close', $event)"></VipBuyPC>
</template>
<script>
import {sendViewEvent} from "@/common/userevent";
import VipBuyMobile from "./VipBuyMobile.vue";
import VipBuyPC from "./VipBuyPC.vue";
export default {
	name: "VipBuy",
	components: {
		VipBuyMobile,
		VipBuyPC,
	},
	props: {},
	emits: ["close"],
	data() {
		return {};
	},
	computed: {
		ua() {
			return app.ua;
		},
	},
	watch: {},
	async mounted() {
		sendViewEvent("收银台");
	},
	methods: {},
};
</script>
