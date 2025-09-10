// server.js
import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mammoth from "mammoth";

dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

// Multer config for file uploads
const upload = multer({ dest: path.join(__dirname, "uploads/") });

// --------------------
// Helper: Summarize text with OpenAI
// --------------------
async function summarizeText(text) {
  if (!text.trim()) return "(No readable text found in file)";
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant. Summarize the text under 200 words." },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenAI summarize response:", data);

    if (data.choices && data.choices.length > 0) {
      if (data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else if (data.choices[0].text) {
        return data.choices[0].text;
      }
    }

    return "(No reply from GPT)";
  } catch (err) {
    console.error("Error in summarizeText:", err);
    return "(Error summarizing file)";
  }
}

// --------------------
// Chat endpoint
// --------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, role } = req.body;
    const finalMessages = [
      { role: "system", content: role === "teacher" ? "You are a teacher, explain simply with examples." : "You are a helpful assistant." },
      ...(messages || []),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: finalMessages,
      }),
    });

    const data = await response.json();
    console.log("OpenAI chat response:", data);

    let reply = "(No reply from GPT)";
    if (data.choices && data.choices.length > 0) {
      if (data.choices[0].message && data.choices[0].message.content) {
        reply = data.choices[0].message.content;
      } else if (data.choices[0].text) {
        reply = data.choices[0].text;
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.json({ reply: "(Error contacting GPT)" });
  }
});

// --------------------
// File upload endpoint
// --------------------
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let text = "";

    if (ext === ".txt") {
      text = fs.readFileSync(filePath, "utf8");
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value || "";
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ summary: "(Unsupported file type. Upload TXT or DOCX.)" });
    }

    fs.unlinkSync(filePath); // Remove file after processing

    if (!text.trim()) {
      return res.status(400).json({ summary: "(No readable text found in file. DOCX may contain tables/images.)" });
    }

    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (err) {
    console.error("Error in /api/upload:", err);
    res.status(500).json({ summary: "(Error processing file)" });
  }
});

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
