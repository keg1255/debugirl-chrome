import ChromeTab from "./ChromeTab";
interface RequestResponse {
    status: number;
    headers: {
        [key: string]: any;
    };
    data: ReadableStream;
}
export default class ChromeClient {
    /** 只能获取debugirl创建的tab */
    tabs: ChromeTab[];
    private closes;
    private onCreated;
    /**
     * 处理消息
     * @deprecated 内部调用
     * @param data
     */
    onMessage(data: any): void;
    /**
     * 初始化 tabs
     * @deprecated 内部调用
     */
    init(): Promise<void>;
    private hack;
    /**
     * 创建新 tab
     * @param {chrome.tabs.CreateProperties} [opt]
     */
    newTab(opt: chrome.tabs.CreateProperties): Promise<ChromeTab>;
    /**
     * 获取指定 url 的所有 cookie
     * @param {string} url
     */
    getAllCookie(url: string): Promise<chrome.cookies.Cookie[]>;
    /**
     * 获取指定 url 的指定 cookie
     * @param {string} name
     * @param {string} url
     */
    getCookie(name: string, url: string): Promise<string>;
    /**
     * 设置 cookie
     * @param {chrome.cookies.SetDetails} details
     */
    setCookie(details: chrome.cookies.SetDetails): Promise<void>;
    /**
     * 清除指定 url 的 cookie
     * @param {string} url
     */
    clearCookies(url: string): Promise<void>;
    /**
     * 发送请求
     * @param {{method?:string;url:string;headers?:any;data?:any;cookieJar?:any;proxy?:string;cancelToken?:CancelToken;timeout?:number;}} req
     */
    request(req: {
        method?: string;
        url: string;
        headers?: any;
        data?: any;
        cookieJar?: any;
        proxy?: string;
        cancelToken?: CancelToken;
        timeout?: number;
    }): Promise<RequestResponse>;
    /**
     * 显示通知
     * @param {string} msg
     */
    notify(msg: string): Promise<void>;
    /**
     * 获取当前活跃的 tab
     * @returns {ChromeTab}
     */
    getCurrent(): ChromeTab;
    /**
     * 添加关闭回调
     * @param {(err?:string)=>any} closer
     */
    addCloser(closer: (err?: string) => any): void;
    /**
     * 关闭所有 tab, 等待关闭完成
     * @param {string} [err]
     */
    close(err?: string): Promise<any[]>;
}
export {};
