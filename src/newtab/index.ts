import {createPage} from "~/plugins/init";

createPage([{path: "/", component: () => import("~/pages/index.vue")}]);
