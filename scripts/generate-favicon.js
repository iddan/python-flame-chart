const os = require("os");
const fs = require("fs");
const { promisify } = require("util");
const { convert } = require("convert-svg-to-png");
const toIco = require("to-ico");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const SIZES = [16, 24, 32, 64];
const svgIconPath = "assets/icon.svg";
const icoPath = "public/favicon.ico";

const svgIcon = readFile(svgIconPath);

Promise.all(
  SIZES.map(async size =>
    convert(await svgIcon, {
      height: size,
      width: size
    })
  )
)
  .then(toIco)
  .then(buffer => writeFile(icoPath, buffer))
  .catch(console.error);
