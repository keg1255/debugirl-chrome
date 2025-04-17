# debugirl-chrome

> 调姬 - 远程浏览器脚本/定时浏览器脚本

## 安装

1. 到 [release](https://github.com/keg1255/debugirl-chrome/releases) 页面下载 `build.zip` 文件
2. 解压文件
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 打开开发者模式
5. 点击 `加载已解压的扩展程序`
6. 选择解压后的文件夹

## 使用

需要登录后使用，登录后可以管理所有浏览器的脚本

### 我的脚本

在"我的脚本"页面中，你可以管理所有浏览器的脚本：

- **创建脚本**：点击右上角的"添加"按钮添加新脚本
- **显示本地存储**：点击可以切换显示本地存储的数据
- **云端状态**：ID、名称、路由、公开状态、是否启用、脚本代码这些属性会同步到云端
- **本地状态**：自动运行、运行间隔、下次运行、运行结果这些属性保存在本地
- **脚本控制**：
  - 名称：点击名称可以重命名
  - 路由：点击路由可以修改
  - 公开状态：公开脚本会出现在脚本广场可以被其他用户使用
  - 是否启用：设置路由并启用后可以通过远程接口执行脚本并获取执行结果
  - 自动运行：设置自动运行后，脚本会按照设置的运行间隔自动执行
  - 运行间隔：点击可以修改，控制自动运行频率，脚本可以通过代码控制下次运行时间但不能超过运行间隔设置
  - 下次运行：显示下次自动执行时间
  - 运行结果：显示最近一次的执行结果
  - 本地存储: 点击可以修改本地存储的数据, 本地存储保存在本地，可以保存一些敏感数据，脚本可以读取和修改本地存储
- **操作按钮**：
  - 运行：立即执行脚本
  - 修改：编辑脚本内容
  - 删除：移除脚本
  - 复制 curl: 设置了路由后可以快捷复制 curl 命令用于测试远程执行脚本

脚本支持自动定时执行，默认间隔为 5 分钟，可通过修改进行自定义设置。

### 脚本广场

在"脚本广场"页面中，你可以查看所有公开的脚本：

- **搜索**：输入关键词搜索脚本名称, 支持 uid=1 搜索指定用户脚本
- **排序**：点击排序按钮可以切换排序方式
- **查看代码**：点击代码按钮可以查看脚本代码
- **fork**：点击 fork 按钮可以复制脚本到我的脚本

### 接口令牌

接口令牌用于远程执行脚本，每次执行脚本时需要携带接口令牌。

- **创建令牌**：点击右上角的"添加"按钮添加新令牌
- **操作按钮**：
  - 连接：连接后可以通过该令牌的 token 调用远程脚本
  - 重置：重置后会生成新的 token

## 脚本接口文档

脚本默认 5 分钟超时，运行过程中可以调用`keepAlive`方法续命，避免超时被杀。

脚本运行在特殊 Worker 环境中，并提供以下全局方法和对象：

### 全局方法

- `keepAlive(timeout: number)`: 续命一定时长，避免超时被杀
- `getStore<T>(def: T)`: 获取存储的数据, 获取的结果会与`def`进行浅拷贝合并
- `setStore(value: any)`: 设置存储的数据
- `makeCode<T>(fn: T, args?: Parameters<T>)`: 将函数和参数转换为代码字符串, 通常配合 `tab.eval5` 和 `tab.runjs` 使用
- `waitUntil<T>(fn: () => T, timeout?: number, freq?: number)`: 等待直到某个条件成立或超时, 默认10s超时, 每1s检查一次
- `sleep(ms: number)`: 等待指定毫秒数
- `setNextAt(time: number)`: 设置下次执行时间（超过运行间隔等于按照运行间隔执行）
- `md5(str: string)`: 计算字符串的 md5 值
- `fetch(url: string, options: RequestInit)`: 发送网络请求

### win 对象 (ChromeClient)

全局变量 `win` 是 ChromeClient 类的实例，提供以下主要方法：

- `win.newTab(opt: chrome.tabs.CreateProperties)`: 创建新标签页, 通常 `{url: '', active: false}` 静默创建
- `win.getAllCookie(url: string)`: 获取指定 URL 的所有 cookie
- `win.getCookie(name: string, url: string)`: 获取指定 URL 的特定 cookie
- `win.setCookie(details: chrome.cookies.SetDetails)`: 设置 cookie
- `win.clearCookies(url: string)`: 清除指定 URL 的 cookie
- `win.notify(msg: string)`: 显示通知
- `win.getCurrent()`: 获取当前活跃的标签页, 注意只能获取由调姬创建的标签页
- `win.tabs`: 所有标签页, 注意只能获取由调姬创建的标签页

### ChromeTab 方法

标签页对象（通过 `win.newTab()` / `win.tabs` / `win.getCurrent()` 获取）提供以下主要方法：

- `tab.eval5(fn: string | Function)`: 在隔离环境运行 JS 代码（仅支持 ES5 语法）
- `tab.runjs(fn: string | Function)`: 在主环境运行 JS 代码
- `tab.waitSelector(selector: string, timeout?: number)`: 等待元素出现, 默认不等待
- `tab.waitText(text: string, timeout?: number)`: 等待文字出现, 默认不等待
- `tab.waitURL(fn: (url: string) => boolean, timeout?: number)`: 等待页面加载完成且 URL 满足条件, 默认不等待
- `tab.input(selector: string, value: string | number)`: 设置元素 value 属性
- `tab.click(selector: string)`: 点击元素
- `tab.clickAll(selector: string)`: 点击所有匹配的元素
- `tab.trigger(selector: string, event: string)`: 触发元素事件, 通常 `tab.trigger('#username', 'input')` 用于触发输入框的 input 事件
- `tab.focus(selector: string)`: 聚焦元素
- `tab.getText(selector: string)`: 获取元素文本
- `tab.fetchJson(options: {...})`: 在网页中发送 fetch 请求并返回 JSON, 通常用于需要校验 `referer` 的请求
- `tab.loadURL(url: string, preload?: string)`: 加载 URL, 并立即运行`preload`脚本，通常用户 hook 一些函数
- `tab.newTab(opt?: chrome.tabs.CreateProperties)`: 创建新标签页, 同 `win.newTab`
- `tab.close()`: 关闭标签页
- `tab.reload()`: 刷新页面
- `tab.loop(list?: {...}[])`: 定义并循环执行状态机, 循环执行所有条件，直到一个条件的 `handler` 返回 为真 则退出循环, 普通的异常不会中断循环
- `tab.breakLoop()`: 中断循环状态机, 并抛出异常
- `tab.getURL()`: 获取当前 URL, 同步
- `tab.getTitle()`: 获取当前页面标题, 同步
- `tab.active()`: 激活当前标签页, 部分页面功能需要前台运行

### 示例

```javascript
// 示例：访问百度并搜索内容
async function main(params = {}) {
	// 创建一个新标签页
	const tab = await win.newTab({url: "https://www.baidu.com", active: false});

	// 等待搜索框出现
	await tab.waitSelector("#kw", 10e3);

	// 输入搜索内容
	await tab.input("#kw", params.search || "debugirl chrome");

	// 点击搜索按钮
	await tab.click("#su");

	// 等待搜索结果
	await tab.waitSelector(".result", 10e3);

	// 获取第一个结果的文本
	const firstResult = await tab.getText(".result h3:first-child");

	// 保存结果
	await setStore({lastSearch: firstResult});

	debugger;

	// 关闭标签页
	await tab.close();

	// 返回结果
	return firstResult;
}
```
