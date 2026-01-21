import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const SVG_DIR = path.resolve("qr_out");
const PDF_DIR = path.resolve("qr_pdf");

if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

async function convertToPdf() {
  const files = fs.readdirSync(SVG_DIR).filter(file => file.endsWith(".svg"));
  
  console.log(`Найдено ${files.length} файлов для конвертации...`);
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const file of files) {
    const svgPath = path.join(SVG_DIR, file);
    const pdfPath = path.join(PDF_DIR, file.replace(".svg", ".pdf"));
    
    // Читаем SVG и кодируем его в URL
    const svgContent = fs.readFileSync(svgPath, "utf8");
    const base64Svg = Buffer.from(svgContent).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

    // Загружаем страницу с этим SVG
    await page.setContent(`
      <html>
        <body style="margin: 0; padding: 0;">
          <img src="${dataUrl}" style="width: 432px; height: 424px;" />
        </body>
      </html>
    `);

    // Генерируем PDF четко по размеру холста
    await page.pdf({
      path: pdfPath,
      width: "432px",
      height: "424px",
      printBackground: true,
      pageRanges: "1",
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    console.log(`✅ Конвертирован: ${file} -> PDF`);
  }

  await browser.close();
  console.log(`\n🚀 Все PDF готовы в папке: ${PDF_DIR}`);
}

convertToPdf().catch(console.error);