import {createPage} from "~/plugins/init";
import "./runner_rpc";
import {scriptsLocal, shareLocal} from "~/stores/local";

createPage([
	{path: "/", component: () => import("~/pages/index.vue")},
	{path: "/my-scripts/", component: () => import("~/pages/my-scripts.vue")},
	{path: "/scripts/", component: () => import("~/pages/scripts.vue")},
]);

(window as any).shareLocal = shareLocal;
(window as any).scriptsLocal = scriptsLocal;
