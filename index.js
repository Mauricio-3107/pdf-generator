const express = require("express");
const bodyParser = require("body-parser");
const { generatePDF } = require("./utils/pdfGenerator");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  try {
    const pdfBuffer = await generatePDF(req.body);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote.pdf"`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
