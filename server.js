import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

// File parsers
import mammoth from "mammoth"; // DOCX
import XLSX from "xlsx";       // Excel
import csvParser from "csv-parser"; // CSV

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only txt, docx, xlsx, csv files are allowed"));
  },
});

// Function to extract text
async function extractText(filePath, mimetype) {
  try {
    if (mimetype === "text/plain") return fs.readFileSync(filePath, "utf8");

    else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (
  mimetype ===
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
  } catch (err) {
    if (err.message.includes("password")) {
      return "⚠️ This Excel file is password-protected. Please remove the password and try again.";
    }
    throw err;
  }
}
 else if (mimetype === "text/csv") {
      const results = [];
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => results.push(row))
          .on("end", () => resolve(JSON.stringify(results)))
          .on("error", reject);
      });
    }

    return "";
  } catch (err) {
    console.error("❌ Extract error:", err);
    return "";
  }
}

// Upload + chat together
app.post("/api/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  const mimetype = req.file?.mimetype;
  const userMessage = req.body.message || "";

  try {
    if (!filePath || !mimetype)
      return res.status(400).json({ error: "File not uploaded" });

    const text = await extractText(filePath, mimetype);

    if (!text || text.trim().length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "No text could be extracted" });
    }

    // Send to GPT
    const gptResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
              role: "user",
              content: `User message: ${userMessage}\n\nFile content:\n${text}`,
            },
          ],
        }),
      }
    );

    const data = await gptResponse.json();
    const reply = data.choices?.[0]?.message?.content || "No reply from GPT";

    res.json({
      extracted: text.substring(0, 500) + "...",
      summary: reply,
    });
  } catch (err) {
    console.error("❌ Upload route error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// Chat only (without file)
app.post("/api/chat", async (req, res) => {
  const messages = req.body.messages;
  if (!messages) return res.status(400).json({ error: "No messages provided" });

  try {
    const gptResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
        }),
      }
    );

    const data = await gptResponse.json();
    const reply = data.choices?.[0]?.message?.content || "No reply from GPT";
    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat route error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () =>
  console.log(`✅ Server running at http://localhost:${port}`)
);
