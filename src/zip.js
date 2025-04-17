const AdmZip = require("adm-zip");
const fs = require("fs");

function zipDir(dir) {
	const zip = new AdmZip();
	zip.addLocalFolder(dir, "");
	return zip.toBuffer();
}

fs.writeFileSync("build.zip", zipDir("build"));
