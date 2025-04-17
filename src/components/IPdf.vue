<template>
	<div
		ref="root"
		class="i-pdf"
		:style="{
			'--scale-factor': scale,
		}"
	>
		<div class="i-pdf__toolbar">
			<button @click="downPdf">下载</button>
		</div>
		<div
			v-for="(item, i) in pages"
			:key="i"
			v-intersection-observer="onIntersectionObserver.bind(null, item)"
			class="i-pdg__page"
			:style="{width: item.width * scale + 'px', height: item.height * scale + 'px'}"
		>
			<canvas :width="item.width * scale" :height="item.height * scale"></canvas>
			<div class="textLayer"></div>
		</div>
	</div>
</template>
<script setup>
import {download, loadPDF, loadcss} from "@/common/utils";
import {vIntersectionObserver} from "@vueuse/components";
import {degrees, PDFDocument, rgb, StandardFonts} from "pdf-lib";
const props = defineProps({
	src: String,
});

const pages = ref([]);
const pageIdx = ref(1);
const root = ref(null);
const scale = ref(1);

onMounted(async () => {
	await loadcss("pdfjs/web/viewer.css");
	scale.value = window.devicePixelRatio;
	watchEffect(() => {
		refresh();
	});
});

let pdfDoc;
async function refresh() {
	pdfDoc = await loadPDF(props.src || "pdfjs/1.pdf");
	pages.value = [];
	for (let i = 0; i < pdfDoc.numPages; i++) {
		let id = i + 1;
		let page = await pdfDoc.getPage(id);
		let viewport = page.getViewport({scale: 1});
		let item = {
			id,
			page: markRaw(page),
			width: viewport.width,
			height: viewport.height,
		};
		pages.value.push(item);
		if (!i) {
			item.loading = true;
			nextTick().then(() => {
				readPage((pageIdx.value = 1))
					.then(() => {
						console.log(item);
						item.loaded = true;
					})
					.finally(() => {
						item.loading = false;
					});
			});
		}
	}
	window.pdfDoc = pdfDoc;
}

watch(pageIdx, (n) => {
	readPage(n);
});

function onIntersectionObserver(item, e) {
	if (!e[0].isIntersecting) return;
	console.log(item.id, e);
	if (item.loaded || item.loading) return;
	item.loading = true;
	readPage(item.id)
		.then(() => {
			item.loaded = true;
		})
		.finally(() => {
			item.loading = false;
		});
}

async function readPage(n) {
	const page = await pdfDoc.getPage(n);
	const el = root.value.children[n];
	const canvas = el.querySelector("canvas");
	const ctx = canvas.getContext("2d");
	const viewport = page.getViewport({scale: scale.value});
	canvas.height = viewport.height;
	canvas.width = viewport.width;
	el.style.height = viewport.height + "px";
	el.style.width = viewport.width + "px";

	// Render PDF page into canvas context
	var renderContext = {
		canvasContext: ctx,
		viewport: viewport,
	};
	var renderTask = page.render(renderContext);
	await renderTask.promise;

	const textContent = await page.getTextContent();
	var textLayer = el.querySelector(".textLayer");
	let renderTextTask = pdfjsLib.renderTextLayer({
		textContent: textContent,
		container: textLayer,
		viewport: viewport,
		textDivs: [],
	});
	await renderTextTask.promise;
}
async function downPdf() {
	let existingPdfBytes = await pdfDoc.getData();
	console.log(existingPdfBytes);
	const pdfEdit = await PDFDocument.load(existingPdfBytes);
	const helveticaFont = await pdfEdit.embedFont(StandardFonts.Helvetica);

	// Get the first page of the document
	const pages = pdfEdit.getPages();
	const firstPage = pages[0];

	// Get the width and height of the first page
	const {width, height} = firstPage.getSize();

	// Draw a string of text diagonally across the first page
	firstPage.drawText("This text was added with JavaScript!", {
		x: 5,
		y: height / 2 + 300,
		size: 50,
		font: helveticaFont,
		color: rgb(0.95, 0.1, 0.1),
		rotate: degrees(-45),
	});

	// Serialize the PDFDocument to bytes (a Uint8Array)
	const pdfBytes = await pdfEdit.save();
	download(pdfBytes, "pdf-lib_modification_example.pdf");
}
</script>
<style lang="less">
@import "~@/styles/define.less";
.i-pdf {
	> .i-pdg__page {
		position: relative;
		margin: 0 auto;
	}
}
</style>
