/// <reference types="@types/chrome" />
import ChromeClient from "./ChromeClient";
export declare class BreakError extends Error {
    msg: string;
    constructor(msg: string);
}
export default class ChromeTab {
    private client;
    private frame?;
    /** @deprecated 内部使用 */
    wait_close: IPromise<void>;
    tab?: chrome.tabs.Tab;
    name?: string;
    constructor(opt: {
        client: ChromeClient;
        tab: chrome.tabs.Tab;
        frame?: chrome.webNavigation.GetAllFrameResultDetails;
    });
    get id(): number;
    /**
     * 在隔离环境运行js代码, 只支持es5语法
     * @param fn 代码或函数
     */
    eval5(fn: string | ((...args: any[]) => any)): Promise<any>;
    /**
     * 在主环境运行js代码
     * @param fn 代码或函数
     */
    runjs(fn: string | Function): Promise<any>;
    /**
     * 等待第一个匹配的元素出现, 有高度则认为出现
     * @param {string} selector
     * @param {number} [timeout=0] 等待超时时间
     */
    waitSelector(selector: string, timeout?: number): Promise<any>;
    /**
     * 获取元素 value 属性
     * @param {string} selector
     */
    getValue(selector: string): Promise<any>;
    /**
     * 判断元素 value 属性是否为空
     * @param {string} selector
     */
    isEmptyValue(selector: string): Promise<any>;
    /**
     * 判断元素是否未选中
     * @param {string} selector
     */
    isNotChecked(selector: string): Promise<any>;
    /**
     * 等待文字出现
     * @param {string} text
     * @param {number} [timeout=0]
     */
    waitText(text: string, timeout?: number): Promise<any>;
    /**
     * 等待元素出现, 有文本则认为出现
     * @param {string} selector
     * @param {number} [timeout=0]
     */
    waitSelectorText(selector: string, timeout?: number): Promise<any>;
    /**
     * 等待任意一个匹配的元素出现, 有宽度则认为出现
     * @param {string} selector
     * @param {number} [timeout=0]
     */
    waitSelectorAny(selector: string, timeout?: number): Promise<any>;
    /**
     * 等待页面加载完成且 url 满足条件
     * @param {(url:string)=>boolean} fn
     * @param {number} [timeout=0]
     */
    waitURL(fn: (url: string) => boolean, timeout?: number): Promise<boolean>;
    /**
     * 设置元素 value 属性
     * @param {string} selector
     * @param {string|number} value
     */
    input(selector: string, value: string | number): Promise<any>;
    /**
     * 用键盘输入
     * @param {string} selector
     * @param {string|number} value
     */
    keyboardInput(selector: string, value: string | number): Promise<void>;
    /**
     * 点击元素
     * @param {string} selector
     */
    click(selector: string): Promise<any>;
    /**
     * 用鼠标点击坐标
     * @param {Point} point
     */
    clickPoint(point: Point): Promise<void>;
    /**
     * 点击所有匹配的元素
     * @param {string} selector
     */
    clickAll(selector: string): Promise<any>;
    /**
     * 触发事件
     * @param {string} selector
     * @param {string} event 事件名
     */
    trigger(selector: string, event: string): Promise<any>;
    /**
     * 聚焦元素
     * @param {string} selector
     */
    focus(selector: string): Promise<any>;
    /**
     * 获取元素文本
     * @param {string} selector
     */
    getText(selector: string): Promise<any>;
    /**
     * 在网页中 fetch 请求, 并返回 json
     * @param {RequestInit} options
     */
    fetchJson(options: RequestInit & {
        url: string;
    }): Promise<any>;
    /**
     * 获取指定 url 的所有 cookie
     * @param {string} url
     */
    getAllCookie(url: string): Promise<chrome.cookies.Cookie[]>;
    /**
     * 获取指定 url 的指定 cookie
     * @param {string} name
     * @param {string} [url] 未指定则使用当前 url
     */
    getCookie(name: string, url?: string): Promise<string>;
    /**
     * 设置 cookie
     * @param {chrome.cookies.SetDetails} details
     */
    setCookie(details: chrome.cookies.SetDetails): Promise<void>;
    /**
     * 清除指定 url 的 cookie
     * @param {string} [url] 未指定则使用当前 url
     */
    clearCookies(url?: string): Promise<void>;
    /**
     * 获取所有 frame, 默认只获取子页面且 url 不为 about:blank 的 frame
     * @param {boolean} [all] 是否获取所有 frame
     */
    getFrames(all?: boolean): Promise<ChromeTab[]>;
    /**
     * 查找第一个满足条件的 frame
     * @template T
     * @param {(x: ChromeTab) => Promise<T>} fn
     * @returns {Promise<T>}
     */
    findFrame<T>(fn: (x: ChromeTab) => Promise<T>): Promise<T>;
    /**
     * 加载 url
     * @param {string} url
     * @param {string} [preload] 预先执行的 js 代码
     */
    loadURL(url: string, preload?: string): Promise<void>;
    /**
     * 创建新 tab
     */
    newTab(opt?: chrome.tabs.CreateProperties): Promise<ChromeTab>;
    /**
     * 关闭 tab, 等待关闭完成
     */
    close(): Promise<void>;
    /**
     * 刷新页面
     */
    reload(): Promise<void>;
    /**
     * 中断循环并抛出错误
     * @param {string} msg
     */
    breakLoop(msg: string): void;
    /**
     * 循环流程
     * - 返回 pass 跳过当前流程
     * - 返回 if判断为真的值 则停止循环并返回这个值
     * - 使用 tab.breakLoop 停止循环并抛出错误
     * @param {{name?:string;limit?:number;check:()=>Promise<boolean>;handler:()=>Promise<any>}[]} list
     */
    loop(list?: {
        /** 流程名称 */
        name?: string;
        /** 限制该流程执行次数 */
        limit?: number;
        /** 检查函数 */
        check: () => any;
        /** 处理函数 */
        handler: () => Promise<any>;
    }[]): Promise<any>;
    /**
     * 获取当前 url
     * @returns {string}
     */
    getURL(): string;
    /**
     * 获取当前页面标题
     * @returns {string}
     */
    getTitle(): string;
    /**
     * 判断 tab 是否被销毁
     * @returns {boolean}
     */
    isDestroyed(): boolean;
    /**
     * 激活当前tab
     */
    active(): Promise<chrome.tabs.Tab>;
}
