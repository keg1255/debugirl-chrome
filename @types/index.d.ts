type Diff<T, U> = T extends U ? never : T;
type Filter<T, U> = T extends U ? T : never;

interface IPromise<T> extends Promise<T> {
	resolve(x?: T): void;
	reject(e: any): void;
	pending: boolean;
	resolved: boolean;
	rejected: boolean;
}

interface Point {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Clipboard extends EventTarget {
	read(): Promise<ClipboardItem[]>;
	write(items: ClipboardItem[]);
	readText(): Promise<string>;
	writeText(data: string): Promise<void>;
}

interface Blob {
	name?: string;
	path?: string;
	lastModified?: number;
}

type SimpleKey =
	| "Left"
	| "Right"
	| "Up"
	| "Down"
	| "Enter"
	| "Space"
	| "Backspace"
	| "Delete"
	| "Tab"
	| "Home"
	| "End"
	| "PageUp"
	| "PageDown"
	| "Esc"
	| "F1"
	| "F2"
	| "F3"
	| "F4"
	| "F5"
	| "F6"
	| "F7"
	| "F8"
	| "F9"
	| "F10"
	| "F11"
	| "F12";
type WordKey =
	| "0"
	| "1"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "A"
	| "B"
	| "C"
	| "D"
	| "E"
	| "F"
	| "G"
	| "H"
	| "I"
	| "J"
	| "K"
	| "L"
	| "M"
	| "N"
	| "O"
	| "P"
	| "Q"
	| "R"
	| "S"
	| "T"
	| "U"
	| "V"
	| "W"
	| "X"
	| "Y"
	| "Z";
type SymbalKey = "," | "." | "/" | ";" | "'" | "[" | "]" | "\\" | "-" | "=" | "`";
type AllKeys = SimpleKey | WordKey | SymbalKey;
type Prefix =
	| "Meta+"
	| "Ctrl+"
	| "Alt+"
	| "Shift+"
	| "Ctrl+Shift+"
	| "Ctrl+Alt+"
	| "Meta+Shift+"
	| "Meta+Alt+"
	| "";
type HotKey = `${Prefix}${AllKeys}`;

type Split<T, K extends string = ","> = T extends `${infer A}${K}${infer B}`
	? Split<A, K> | Split<B, K>
	: T;

interface CancelToken {
	reason?: {message: string};
	throwIfRequested(): void;
	promise: Promise<{message: string}>;
}

declare const process: {env: {NODE_ENV: string}};