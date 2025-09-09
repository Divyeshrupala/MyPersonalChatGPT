// server.js
import express from "express";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch"; // If using Node v20+, fetch is built-in. Otherwise, install node-fetch

dotenv.config();

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serve static files (like index.html)

// Multer config for file uploads
const upload = multer({ dest: path.join(__dirname, "uploads/") });

// Helper: summarize text using OpenAI
async function summarizeText(text) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a summarization assistant. Summarize the following text in under 200 words.",
          },
          { role: "user", content: text },
        ],
      }),
    });
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "Could not summarize.";
  } catch (err) {
    console.error("Error in summarizeText:", err);
    return "Could not summarize due to an error.";
  }
}

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, role } = req.body;
    const finalMessages = [
      {
        role: "system",
        content:
          role === "teacher"
            ? "You are a teacher, explain simply with examples."
            : "You are a helpful assistant.",
      },
      ...(messages || []),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: finalMessages,
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "(No reply)";
    res.json({ reply });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// File upload & summarize endpoint
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const text = fs.readFileSync(filePath, "utf8");
    const summary = await summarizeText(text);
    fs.unlinkSync(filePath); // remove uploaded file after processing
    res.json({ summary });
  } catch (err) {
    console.error("Error in /api/upload:", err);
    res.status(500).json({ error: "Could not summarize file" });
  }
});

// Serve index.html
app.get(["/", "/index.html"], (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
