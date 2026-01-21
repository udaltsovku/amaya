import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const OUT_DIR = path.resolve("qr_out");
fs.mkdirSync(OUT_DIR, { recursive: true });

const baseUrl = "https://qr-landing.amayakids.com/en";
const from = 1;
const to = 100;

// Точные параметры из Figma
const canvasW = 432;
const canvasH = 424;
const qrW = 368;
const qrH = 360;
const badgeSize = 86;
const fontSize = 42;

for (let id = from; id <= to; id++) {
  const url = `${baseUrl}/${id}`;

  // Генерируем QR как DataURL (PNG). 
  // Ставим scale: 10, чтобы картинка была четкой и не "мелкой"
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 0,
    width: qrW, // 368
    scale: 10,  // Высокое качество
    color: { dark: "#000000", light: "#ffffff" }
  });

  const cx = canvasW / 2; // 216
  const cy = canvasH / 2; // 212

  const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${canvasW}" height="${canvasH}" fill="white"/>
  
  <image href="${qrDataUrl}" x="32" y="32" width="${qrW}" height="${qrH}" preserveAspectRatio="none" />

  <circle cx="${cx}" cy="${cy}" r="${badgeSize / 2}" fill="white"/>
  
  <text 
    x="${cx}" 
    y="${cy}" 
    text-anchor="middle" 
    dominant-baseline="central" 
    font-family="Nunito, sans-serif" 
    font-size="${fontSize}" 
    font-weight="900" 
    fill="black"
  >${id}</text>
</svg>`;

  const filename = path.join(OUT_DIR, `${String(id).padStart(3, "0")}.svg`);
  fs.writeFileSync(filename, finalSvg, "utf8");
}

console.log(`✅ Всё готово! Отступы по 32px, QR 368x360. Проверяй в Chrome!`);