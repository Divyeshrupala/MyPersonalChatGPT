// server.js
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

// Serve index.html and static files
app.use(express.static(__dirname));

// API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessages = req.body.messages;
    if (!userMessages) {
      return res.status(400).json({ error: "No messages provided" });
    }

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: userMessages,
      }),
    });

    const data = await apiRes.json();
    const reply = data?.choices?.[0]?.message?.content || "(No reply)";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
