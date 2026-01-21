import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SVG_DIR = path.resolve("qr_out"); 
const PNG_OUT_DIR = path.resolve("png_out");

async function convertSvgToPng() {
  if (!fs.existsSync(PNG_OUT_DIR)) fs.mkdirSync(PNG_OUT_DIR, { recursive: true });

  const files = fs.readdirSync(SVG_DIR).filter(file => file.endsWith(".svg"));
  console.log(`🚀 Рендерю ${files.length} файлов в x2 качестве без фона...`);

  for (const file of files) {
    const inputPath = path.join(SVG_DIR, file);
    const outputPath = path.join(PNG_OUT_DIR, file.replace(".svg", ".png"));

    try {
      await sharp(inputPath, { density: 144 }) // 144 DPI = x2 от стандартных 72
        .png({ transparent: true }) // Гарантируем поддержку прозрачности
        .toFile(outputPath);
      
      console.log(`✅ x2 PNG: ${file}`);
    } catch (err) {
      console.error(`❌ Ошибка на ${file}:`, err);
    }
  }
  console.log("🏁 Готово! Проверяй папку png_out");
}

convertSvgToPng();