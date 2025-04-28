/// <reference types="@types/chrome" />
/// <reference types="@types/chrome" />
export interface MouseEventParams {
    /** 鼠标事件类型 */
    type?: "mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel" | "click" | "path";
    /** 事件相对于主框架视口的 X 坐标（CSS 像素） */
    x?: number;
    /** 事件相对于主框架视口的 Y 坐标（CSS 像素）。0 表示视口顶部 */
    y?: number;
    /** 表示按下的修饰键的位字段。Alt=1, Ctrl=2, Meta/Command=4, Shift=8（默认：0） */
    modifiers?: number;
    /** 事件发生的时间 */
    timestamp?: number;
    /** 鼠标按钮（默认："none"） */
    button?: string;
    /** 鼠标上按下的按钮。左=1, 右=2, 中=4, 后退=8, 前进=16, 无=0 */
    buttons?: number;
    /** 鼠标按钮被点击的次数（默认：0） */
    clickCount?: number;
    /** 归一化压力，范围为 [0,1]（默认：0）。实验性 */
    force?: number;
    /** 归一化切向压力，范围为 [-1,1]（默认：0）。实验性 */
    tangentialPressure?: number;
    /** Y-Z 平面与包含触控笔轴和 Y 轴的平面之间的平面角度，范围 [-90,90] 度（默认：0） */
    tiltX?: number;
    /** X-Z 平面与包含触控笔轴和 X 轴的平面之间的平面角度，范围 [-90,90] 度（默认：0） */
    tiltY?: number;
    /** 触控笔围绕其主轴的顺时针旋转，范围 [0,359] 度（默认：0）。实验性 */
    twist?: number;
    /** 鼠标滚轮事件的 X 增量（CSS 像素）（默认：0） */
    deltaX?: number;
    /** 鼠标滚轮事件的 Y 增量（CSS 像素）（默认：0） */
    deltaY?: number;
    /** 指针类型（默认："mouse"） */
    pointerType?: "mouse" | "pen";
}
export interface KeyboardEventParams {
    /** 键盘事件类型 */
    type: "keyDown" | "keyUp" | "rawKeyDown" | "char";
    /** 表示按下的修饰键的位字段。Alt=1, Ctrl=2, Meta/Command=4, Shift=8（默认：0） */
    modifiers?: number;
    /** 事件发生的时间 */
    timestamp?: number;
    /** 通过使用键盘布局处理虚拟键码生成的文本。keyUp 和 rawKeyDown 事件不需要（默认：""） */
    text?: string;
    /** 如果没有按下修饰键（除了shift）时键盘本应生成的文本。用于快捷键（加速器）处理（默认：""） */
    unmodifiedText?: string;
    /** 唯一键标识符（例如，'U+0041'）（默认：""） */
    keyIdentifier?: string;
    /** 每个物理键的唯一 DOM 定义字符串值（例如，'KeyA'）（默认：""） */
    code?: string;
    /** 描述在活动修饰符、键盘布局等上下文中按键含义的唯一 DOM 定义字符串值（例如，'AltGr'）（默认：""） */
    key?: string;
    /** Windows 虚拟键码（默认：0） */
    windowsVirtualKeyCode?: number;
    /** 原生虚拟键码（默认：0） */
    nativeVirtualKeyCode?: number;
    /** 事件是否由自动重复生成（默认：false） */
    autoRepeat?: boolean;
    /** 事件是否由小键盘生成（默认：false） */
    isKeypad?: boolean;
    /** 事件是否为系统键事件（默认：false） */
    isSystemKey?: boolean;
    /** 事件是来自键盘的左侧还是右侧。1=左，2=右（默认：0） */
    location?: number;
    /** 与按键事件一起发送的编辑命令（例如，'selectAll'）（默认：[]）。实验性 */
    commands?: string[];
}
export type Chrome = typeof chrome & {
    notify(opt: {
        title: string;
        message: string;
        iconUrl?: string;
        url?: string;
    }): Promise<void>;
    request(req: {
        method?: string;
        url: string;
        headers?: any;
        body?: any;
        timeout?: number;
    }, abort?: AbortSignal): Promise<Response>;
    getUUID(): string;
    setUUID(uuid: string): Promise<void>;
    runScript(opt: {
        id: number;
        name: string;
        code: string;
        url: string;
        body: any;
    }, abort?: AbortSignal): Promise<any>;
    addTabListener(onMessage: (message: any) => void): void;
    dispatch(tabId: number, params: string | MouseEventParams | KeyboardEventParams): Promise<void>;
};
