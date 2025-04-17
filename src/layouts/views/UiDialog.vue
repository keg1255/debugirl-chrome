<template>
	<div v-show="data.length" class="ui-dialog">
		<transition v-for="item in data" :key="item.id" :name="item.transition">
			<component
				:is="item.name"
				v-bind="item.props"
				:style="{zIndex: item.id}"
				@close="item.close($event)"
			></component>
		</transition>
	</div>
</template>

<script lang="ts">
import {dialog_list, getDialogs} from "~/dialogs";
export default {
	components: getDialogs(),
	data() {
		return {
			data: dialog_list,
		};
	},
};
</script>
<style lang="less">
@import "~@/styles/define.less";
.ui-dialog {
}
</style>
