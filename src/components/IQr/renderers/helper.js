import {clamp} from "@/common/utils";

export async function draw(that) {
	/** @type {HTMLCanvasElement} */
	let canvas = that.$el.cloneNode();
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	let scale = canvas.width / 100;
	ctx.scale(scale, scale);
	// 背景
	let bg_canvas = canvas.cloneNode();
	let bg_ctx = ctx;
	if (that.gradient) {
		bg_ctx = bg_canvas.getContext("2d");
		bg_ctx.scale(scale, scale);
	}
	if (that.border) {
		ctx.strokeStyle = that.borderColor;
		ctx.storkeWidth = that.border;
		if (that.borderRadius) {
			ctx.beginPath();
			let r = clamp(that.borderRadius, 0, 50);
			function line(ctx) {
				ctx.moveTo(r, 0);
				ctx.lineTo(100 - r, 0);
				ctx.arc(100 - r, r, r, -Math.PI / 2, 0);
				ctx.lineTo(100, 100 - r);
				ctx.arc(100 - r, 100 - r, r, 0, Math.PI / 2);
				ctx.lineTo(r, 100);
				ctx.arc(r, 100 - r, r, Math.PI / 2, Math.PI);
				ctx.lineTo(0, r);
				ctx.arc(r, r, r, Math.PI, (Math.PI * 3) / 2);
				ctx.closePath();
			}
			line(ctx);
			ctx.stroke();
			if (that.backgroundColor) {
				line(bg_ctx);
				bg_ctx.clip();
			}
		} else {
			ctx.strokeRect(0, 0, 100, 100);
		}
		ctx.translate(that.border, that.border);
		let scale = (100 - that.border * 2) / 100;
		ctx.scale(scale, scale);
	}
	if (that.backgroundColor) {
		if (that.borderRadius) {
			ctx.strokeStyle = that.backgroundColor;
			ctx.storkeWidth = that.backgroundColor;
			ctx.beginPath();
			let r = clamp(that.borderRadius, 0, 50);
			function line(ctx) {
				ctx.moveTo(r, 0);
				ctx.lineTo(100 - r, 0);
				ctx.arc(100 - r, r, r, -Math.PI / 2, 0);
				ctx.lineTo(100, 100 - r);
				ctx.arc(100 - r, 100 - r, r, 0, Math.PI / 2);
				ctx.lineTo(r, 100);
				ctx.arc(r, 100 - r, r, Math.PI / 2, Math.PI);
				ctx.lineTo(0, r);
				ctx.arc(r, r, r, Math.PI, (Math.PI * 3) / 2);
				ctx.closePath();
			}
			line(ctx);
			ctx.stroke();
			bg_ctx.fillStyle = that.backgroundColor;
			line(bg_ctx);
			bg_ctx.clip();
			bg_ctx.fillRect(0, 0, 100, 100);
		} else {
			bg_ctx.fillStyle = that.backgroundColor;
			bg_ctx.fillRect(0, 0, 100, 100);
		}
	}
	if (that.padding) {
		ctx.translate(that.padding, that.padding);
		let scale = (100 - that.padding * 2) / 100;
		ctx.scale(scale, scale);
	}
	ctx.drawImage(that.qrImg, 0, 0, 100, 100);
	if (that.gradient) {
		let qr_canvas = canvas.cloneNode();
		{
			let qr_ctx = qr_canvas.getContext("2d");
			qr_ctx.scale(canvas.width / 100, canvas.height / 100);
			let ss = that.gradient.split("/");
			if (ss.length > 1) {
				// 左右
				let g = qr_ctx.createLinearGradient(0, 0, 0, 100);
				switch (ss[0]) {
					case "1":
						// 上下
						g = qr_ctx.createLinearGradient(0, 0, 100, 0);
						ss.shift();
						break;
					case "2":
						// 右下
						g = qr_ctx.createLinearGradient(0, 0, 100, 100);
						ss.shift();
						break;
					case "3":
						// 右上
						g = qr_ctx.createLinearGradient(0, 100, 100, 0);
						ss.shift();
						break;
					case "4":
						// 中心
						g = qr_ctx.createRadialGradient(50, 50, 0, 50, 50, 50);
						ss.shift();
						break;
				}
				for (let i = 0; i < ss.length; i++) {
					g.addColorStop(i / (ss.length - 1), ss[i]);
				}
				qr_ctx.fillStyle = g;
			} else {
				qr_ctx.fillStyle = that.gradient;
			}
			qr_ctx.fillRect(0, 0, 100, 100);
			qr_ctx.globalCompositeOperation = "destination-in";
			qr_ctx.drawImage(canvas, 0, 0, 100, 100);
		}
		ctx.restore();
		ctx.save();
		ctx.scale(canvas.width / 100, canvas.height / 100);
		ctx.drawImage(bg_canvas, 0, 0, 100, 100);
		ctx.drawImage(qr_canvas, 0, 0, 100, 100);
	}
	if (that.iconPMS) {
		ctx.save();
		try {
			let icon = await that.iconPMS;
			let w = 33 * that.iconScale;
			let w2 = w / 2;
			if (that.iconRadius) {
				let r = (w2 * that.iconRadius) / 50;
				ctx.beginPath();
				ctx.moveTo(50 - w2, 50 - w2 + r);
				ctx.arcTo(50 - w2, 50 - w2, 50 - w2 + r, 50 - w2, r);
				ctx.arcTo(50 + w2, 50 - w2, 50 + w2, 50 - w2 + r, r);
				ctx.arcTo(50 + w2, 50 + w2, 50 + w2 - r, 50 + w2, r);
				ctx.arcTo(50 - w2, 50 + w2, 50 - w2, 50 + w2 - r, r);
				ctx.closePath();
				ctx.clip();
			}
			if (that.iconBackgroundColor) {
				ctx.fillStyle = that.iconBackgroundColor;
				ctx.fillRect(50 - w2, 50 - w2, w, w);
			}
			ctx.drawImage(icon, 50 - w2, 50 - w2, w, w);
		} catch (error) {}
		ctx.restore();
	}
	ctx.restore();
	return canvas;
}
