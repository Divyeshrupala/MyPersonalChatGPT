const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
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
