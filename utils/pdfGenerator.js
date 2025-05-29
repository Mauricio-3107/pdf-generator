const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

function toBase64(relativePath) {
  const file = fs.readFileSync(path.join(__dirname, "..", relativePath));
  const ext = path.extname(relativePath).slice(1);
  return `data:image/${ext};base64,` + file.toString("base64");
}

async function generatePDF(data) {
  const {
    date,
    quoteNumber,
    clientName,
    serviceDescription,
    considerations,
    signatory,
  } = data;

  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, "..", "template.html"),
    "utf8"
  );
  const template = handlebars.compile(htmlTemplate);

  const html = template({
    date,
    quoteNumber,
    clientName,
    serviceDescription,
    considerations,
    signatory,
    logoURI: toBase64("logo.png"),
    signURI: toBase64("firma.png"),
    stampURI: toBase64("sello.png"),
  });

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  return pdfBuffer;
}

module.exports = { generatePDF };
