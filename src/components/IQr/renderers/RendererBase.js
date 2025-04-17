export const QRPointType = {
	DATA: 0,
	POS_CENTER: 1,
	POS_OTHER: 2,
	ALIGN_CENTER: 3,
	ALIGN_OTHER: 4,
	TIMING: 5,
	FORMAT: 6,
	VERSION: 7,
};
let seed = 0;

let idNum = 0;

function rand(min, max) {
	seed = (seed * 9301 + 49297) % 233280;
	return min + (seed / 233280.0) * (max - min);
}

function getIdNum() {
	idNum += 1;
	return idNum.toString();
}

function getTypeTable(qrcode) {
	const nCount = qrcode.getModuleCount();
	const position = qrcode.getPositionTable();
	const PD = [
		[3, 3],
		[3, nCount - 4],
		[nCount - 4, 3],
	];

	let typeTable = new Array(nCount);
	for (let i = 0; i < nCount; i++) typeTable[i] = new Array(nCount);

	for (let i = 8; i < nCount - 7; i++) {
		typeTable[i][6] = typeTable[6][i] = QRPointType.TIMING;
	}

	for (let i = 0; i < position.length; i++) {
		typeTable[position[i][0]][position[i][1]] = QRPointType.ALIGN_CENTER;
		for (let r = -2; r <= 2; r++) {
			for (let c = -2; c <= 2; c++) {
				if (!(r === 0 && c === 0))
					typeTable[position[i][0] + r][position[i][1] + c] = QRPointType.ALIGN_OTHER;
			}
		}
	}

	for (let i = 0; i < PD.length; i++) {
		typeTable[PD[i][0]][PD[i][1]] = QRPointType.POS_CENTER;
		for (let r = -4; r <= 4; r++) {
			for (let c = -4; c <= 4; c++) {
				if (
					PD[i][0] + r >= 0 &&
					PD[i][0] + r < nCount &&
					PD[i][1] + c >= 0 &&
					PD[i][1] + c < nCount
				)
					if (!(r === 0 && c === 0)) typeTable[PD[i][0] + r][PD[i][1] + c] = QRPointType.POS_OTHER;
			}
		}
	}

	for (let i = 0; i <= 8; i++) {
		if (i !== 6) typeTable[i][8] = typeTable[8][i] = QRPointType.FORMAT;
		if (i < 7) typeTable[nCount - i - 1][8] = QRPointType.FORMAT;
		if (i < 8) typeTable[8][nCount - i - 1] = QRPointType.FORMAT;
	}

	for (let i = nCount - 11; i <= nCount - 9; i++) {
		for (let j = 0; j <= 5; j++) {
			typeTable[i][j] = typeTable[j][i] = QRPointType.VERSION;
		}
	}

	for (let i = 0; i < nCount; i++) {
		for (let j = 0; j < nCount; j++) {
			if (!typeTable[i][j]) typeTable[i][j] = QRPointType.DATA;
		}
	}
	return typeTable;
}

export default class RendererBase {
	/**
	 * @param {object} params
	 * @param {string} params.type 信息点样式 [矩形,圆形,随机]
	 * @param {number} params.size 信息点缩放 0~1
	 * @param {number} params.opacity 信息点不透明度 0~1
	 * @param {string} params.posOpacity 定位点不透明度 0~1
	 * @param {string} params.posType 定位点样式 [矩形,圆形,行星,圆角矩形]
	 * @param {string} params.otherColor 信息点颜色, 默认黑色
	 * @param {string} params.posColor 定位点颜色, 默认黑色
	 */
	constructor(params) {
		this.params = {
			type: 0,
			size: 1,
			opacity: 1,
			posOpacity: 1,
			posType: 0,
			otherColor: "#000",
			posColor: "#000",
		};
		for (let k in this.params) {
			if (params[k] != null) this.params[k] = params[k];
		}
	}

	beginRendering(qrcode) {}

	beforeListing(qrcode) {}

	render(qrcode) {
		this.beginRendering(qrcode);
		let s = "";
		const n = qrcode ? qrcode.getModuleCount() : 0;
		s += `<svg width="${n}" height="${n}" viewBox="0 0 ${n} ${n}" fill="white" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">`;
		this.beforeListing(qrcode);
		s += this.listPoints(qrcode);
		s += `</svg>`;
		return s;
	}

	listPoints(qrcode) {
		if (!qrcode) return "";
		const nCount = qrcode.getModuleCount();
		let {type, size, opacity, posOpacity, posType, otherColor, posColor} = this.params;

		const typeTable = getTypeTable(qrcode);
		const pointList = new Array(nCount);

		let id = 0;

		const vw = [3, -3];
		const vh = [3, -3];

		const sq25 =
			"M32.048565,-1.29480038e-15 L67.951435,1.29480038e-15 C79.0954192,-7.52316311e-16 83.1364972,1.16032014 87.2105713,3.3391588 C91.2846454,5.51799746 94.4820025,8.71535463 96.6608412,12.7894287 C98.8396799,16.8635028 100,20.9045808 100,32.048565 L100,67.951435 C100,79.0954192 98.8396799,83.1364972 96.6608412,87.2105713 C94.4820025,91.2846454 91.2846454,94.4820025 87.2105713,96.6608412 C83.1364972,98.8396799 79.0954192,100 67.951435,100 L32.048565,100 C20.9045808,100 16.8635028,98.8396799 12.7894287,96.6608412 C8.71535463,94.4820025 5.51799746,91.2846454 3.3391588,87.2105713 C1.16032014,83.1364972 5.01544207e-16,79.0954192 -8.63200256e-16,67.951435 L8.63200256e-16,32.048565 C-5.01544207e-16,20.9045808 1.16032014,16.8635028 3.3391588,12.7894287 C5.51799746,8.71535463 8.71535463,5.51799746 12.7894287,3.3391588 C16.8635028,1.16032014 20.9045808,7.52316311e-16 32.048565,-1.29480038e-15 Z";

		if (size <= 0) size = 1.0;

		for (let x = 0; x < nCount; x++) {
			for (let y = 0; y < nCount; y++) {
				if (qrcode.isDark(x, y) === false) continue;

				if (
					typeTable[x][y] === QRPointType.ALIGN_CENTER ||
					typeTable[x][y] === QRPointType.ALIGN_OTHER ||
					typeTable[x][y] === QRPointType.TIMING
				) {
					if (type === 0)
						pointList.push(
							`<rect opacity="${opacity}" width="${size}" height="${size}" key="${id++}" fill="${otherColor}" x="${
								x + (1 - size) / 2
							}" y="${y + (1 - size) / 2}"/>`
						);
					else if (type === 1)
						pointList.push(
							`<circle opacity="${opacity}" r="${
								size / 2
							}" key="${id++}" fill="${otherColor}" cx="${x + 0.5}" cy="${y + 0.5}"/>`
						);
					else if (type === 2)
						pointList.push(
							`<circle key="${id++}" opacity="${opacity}" fill="${otherColor}" cx="${
								x + 0.5
							}" cy="${y + 0.5}" r="${size / 2}" />`
						);
				} else if (typeTable[x][y] === QRPointType.POS_CENTER) {
					if (posType === 0) {
						pointList.push(
							`<rect width="${1}" height="${1}" key="${id++}" fill="${posColor}" opacity="${posOpacity}" x="${x}" y="${y}"/>`
						);
					} else if (posType === 1) {
						pointList.push(
							`<circle key="${id++}" fill="${posColor}" opacity="${posOpacity}" cx="${
								x + 0.5
							}" cy="${y + 0.5}" r="${1.5}" />`
						);
						pointList.push(
							`<circle key="${id++}" fill="none" strokeWidth="1" stroke="${posColor}" opacity="${posOpacity}"  cx="${
								x + 0.5
							}" cy="${y + 0.5}" r="${3}" />`
						);
					} else if (posType === 2) {
						pointList.push(
							`<circle key="${id++}" fill="${posColor}" opacity="${posOpacity}" cx="${
								x + 0.5
							}" cy="${y + 0.5}" r="${1.5}" />`
						);
						pointList.push(
							`<circle key="${id++}" fill="none" strokeWidth="0.15" strokeDasharray="0.5,0.5" stroke="${posColor}" opacity="${posOpacity}"  cx="${
								x + 0.5
							}" cy="${y + 0.5}" r="${3}" />`
						);
						for (let w = 0; w < vw.length; w++) {
							pointList.push(
								`<circle key="${id++}" fill="${posColor}" opacity="${posOpacity}" cx="${
									x + vw[w] + 0.5
								}" cy="${y + 0.5}" r="${0.5}" />`
							);
						}
						for (let h = 0; h < vh.length; h++) {
							pointList.push(
								`<circle key="${id++}" fill="${posColor}" opacity="${posOpacity}" cx="${
									x + 0.5
								}" cy="${y + vh[h] + 0.5}" r="${0.5}" />`
							);
						}
					} else if (posType === 3) {
						pointList.push(
							`<circle key="${id++}" fill="${posColor}" opacity="${posOpacity}" cx="${
								x + 0.5
							}" cy="${y + 0.5}" r="${1.5}" />`
						);
						pointList.push(
							`<path key="${id++}" d="${sq25}" stroke="${posColor}" opacity="${posOpacity}" strokeWidth="${
								(100 / 6) * (1 - (1 - size) * 0.75)
							}" fill="none" transform="${`translate(${x - 2.5},${y - 2.5}) scale(${6 / 100},${
								6 / 100
							})`}" />`
						);
					}
				} else if (typeTable[x][y] === QRPointType.POS_OTHER) {
					if (posType === 0) {
						pointList.push(
							`<rect width="${1}" height="${1}" key="${id++}" fill="${posColor}" opacity="${posOpacity}" x="${x}" y="${y}"/>`
						);
					}
				} else if (type === 0) {
					pointList.push(
						`<rect opacity="${opacity}" width="${size}" height="${size}" key="${id++}" fill="${otherColor}" x="${
							x + (1 - size) / 2
						}" y="${y + (1 - size) / 2}"/>`
					);
				} else if (type === 1) {
					pointList.push(
						`<circle opacity="${opacity}" r="${size / 2}" key="${id++}" fill="${otherColor}" cx="${
							x + 0.5
						}" cy="${y + 0.5}"/>`
					);
				} else if (type === 2) {
					pointList.push(
						`<circle opacity="${opacity}" key="${id++}" fill="${otherColor}" cx="${x + 0.5}" cy="${
							y + 0.5
						}" r="${0.5 * rand(0.33, 1.0)}" />`
					);
				}
			}
		}

		return pointList.join("");
	}
}
