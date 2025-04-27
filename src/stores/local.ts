import {watchLocal} from "@/common/utils";
import storages from "~/common/storages";

export const shareLocal = watchLocal("chrome.user", storages["chrome.user"]);
(window as any).shareLocal = shareLocal;

export const local = watchLocal("chrome.app", storages["chrome.app"]);

export const scriptsLocal = watchLocal("chrome.scripts", storages["chrome.scripts"]);
(window as any).scriptsLocal = scriptsLocal;
