import {createPage} from "~/plugins/init";
import "./runner_rpc";

createPage([
	{path: "/", component: () => import("~/pages/index.vue")},
	{path: "/my-scripts/", component: () => import("~/pages/my-scripts.vue")},
	{path: "/scripts/", component: () => import("~/pages/scripts.vue")},
]);
