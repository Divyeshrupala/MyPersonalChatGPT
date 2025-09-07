const express = require("express");
require("dotenv").config();
const path = require("path");
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static files
app.use(express.static(__dirname));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

// Your GPT POST route
app.post("/chat", express.json(), async (req, res) => {
  // call OpenAI here
});

// Start server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

app.use(express.json());

// serve chat.html from the same folder
app.use(express.static(__dirname));

// chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: req.body.messages
      })
    });
    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () =>
  console.log("✅ Server running at http://localhost:3000")
);
