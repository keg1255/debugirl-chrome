<template>
	<router-view></router-view>
	<i-loading
		:hide="!(app.loading > 0 || (app.loading = 0))"
		class="nuxt-loading"
		:msg="app.loading_msg"
		:cancel-token="app.loading_cancel"
	></i-loading>
	<UiDialog></UiDialog>
	<UiToast></UiToast>
</template>
<script setup>
import UiToast from "./views/UiToast.vue";
import UiDialog from "./views/UiDialog.vue";
import app from "~/stores/app";
</script>
