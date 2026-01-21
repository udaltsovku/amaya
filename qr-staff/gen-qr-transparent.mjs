import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

const SVG_DIR = path.resolve("qr_out_svg_22");
const PNG_DIR = path.resolve("qr_out_png_22");

// Создаем папки
[SVG_DIR, PNG_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const baseUrl = "https://qr-landing.amayakids.com";
const from = 1;
const to = 100;

const canvasW = 432;
const canvasH = 424;
const qrW = 368;
const qrH = 360;
const badgeSize = 86;
const fontSize = 42;

console.log("🚀 Погнали! Генерю x2 прозрачные QR...");

for (let id = from; id <= to; id++) {
  const url = `${baseUrl}/${id}`;

  // 1. УБИРАЕМ ФОН В QR: ставим light: "#00000000" (прозрачный черный)
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 0,
    width: qrW,
    color: { 
      dark: "#000000", 
      light: "#00000000" // Вот тут была засада, теперь прозрачно
    }
  });

  const cx = canvasW / 2;
  const cy = canvasH / 2;

  // 2. УБИРАЕМ <rect> ИЗ SVG: оставляем только контент
const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="hole">
      <rect width="100%" height="100%" fill="white"/>
      <circle cx="${cx}" cy="${cy}" r="${badgeSize / 2}" fill="black"/>
    </mask>
  </defs>

  <image href="${qrDataUrl}" x="32" y="32" width="${qrW}" height="${qrH}" mask="url(#hole)" />

  <text 
    x="${cx}" 
    y="${cy}" 
    text-anchor="middle" 
    dominant-baseline="central" 
    font-family="Arial, sans-serif" 
    font-size="${fontSize}" 
    font-weight="900" 
    fill="black"
  >${id}</text>
</svg>`;

  const svgFilename = path.join(SVG_DIR, `${String(id).padStart(3, "0")}.svg`);
  const pngFilename = path.join(PNG_DIR, `${String(id).padStart(3, "0")}.png`);

  fs.writeFileSync(svgFilename, finalSvg, "utf8");

  // 3. ДЕЛАЕМ x2 КАЧЕСТВО: через density: 144 (72 * 2)
  try {
    await sharp(svgFilename, { density: 144 })
      .png()
      .toFile(pngFilename);
    console.log(`✅ ID ${id} готов (PNG ${canvasW * 2}x${canvasH * 2})`);
  } catch (err) {
    console.error(`❌ Ошибка на ID ${id}:`, err);
  }
}

console.log(`\n🏁 Всё! Забирай в папке: ${PNG_DIR}`);