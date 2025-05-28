const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");

const app = express();
app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  try {
    const {
      date,
      quoteNumber,
      clientName,
      serviceDescription,
      considerations,
      signatory,
    } = req.body;

    const htmlTemplate = fs.readFileSync("template.html", "utf8");
    const template = handlebars.compile(htmlTemplate);

    const toBase64 = (rel) => {
      const buf = fs.readFileSync(path.join(__dirname, rel));
      const ext = path.extname(rel).slice(1);
      return `data:image/${ext};base64,` + buf.toString("base64");
    };

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
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
