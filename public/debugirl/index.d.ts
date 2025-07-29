import ChromeClient from "./ChromeClient";
declare global {
    const win: ChromeClient;
    /**
     * 续命一定时长, 避免超时被杀
     * @param {number} timeout
     */
    function keepAlive(timeout: number): Promise<void>;
    /**
     * 定义存储
     */
    function defineStore<T>(def: T): Promise<T>;
    /**
     * @deprecated 请使用 defineStore 代替
     * 获取存储
     */
    function getStore<T>(def: T): Promise<T>;
    /**
     * @deprecated 请使用 defineStore 代替
     * 设置存储
     * @param {any} value
     */
    function setStore(value: any): Promise<void>;
    /**
     * 将函数和参数转换为代码字符串
     */
    function makeCode<T extends (...args: any[]) => any>(fn: T, args?: Parameters<T>): string;
    /**
     * 等待直到某个条件成立或者超时
     * @template T
     * @param {()=>T} fn 要检查的函数,返回值为真则结束等待
     * @param {number} [timeout=10e3]
     * @param {number} [freq=1e3]
     * @returns {Promise<Awaited<T>>} fn的返回值
     */
    function waitUntil<T>(fn: () => T, timeout?: number, freq?: number): Promise<Awaited<T>>;
    /**
     * 等待 ms 毫秒
     * @param {number} ms
     */
    function sleep(ms: number): Promise<void>;
    /**
     * 设置下次执行时间
     * 如果小于 脚本运行时间 + 运行间隔, 则不生效
     * @param {number} time
     */
    function setNextAt(time: number): Promise<void>;
    /**
     * 计算 md5 值
     * @param {string} str
     * @returns {string}
     */
    function md5(str: string): string;
}
