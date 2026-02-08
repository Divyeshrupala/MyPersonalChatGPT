import fs from "fs";
import { extractText } from "../utils/fileProcessor.js";
import { callAI, AI_PROVIDERS } from "../utils/aiProviders.js";
import { getEnhancedPrompt } from "../utils/prompts.js";

export async function handleUpload(req, res) {
  const filePath = req.file?.path;
  const mimetype = req.file?.mimetype;
  const userMessage = req.body.message || "";
  const provider = req.body.provider || 'openai';
  const model = req.body.model;
  const apiKey = req.body.apiKey;

  if (!AI_PROVIDERS[provider]) {
    return res.status(400).json({ error: `Unsupported AI provider: ${provider}` });
  }

  if (!apiKey) {
    return res.status(400).json({ error: `API key is required for ${AI_PROVIDERS[provider].name}` });
  }

  try {
    let fileText = "";

    if (filePath && mimetype) {
      fileText = await extractText(filePath, mimetype);
      
      if (!fileText) {
        return res.status(400).json({ 
          error: "Could not extract text from the uploaded file." 
        });
      }
    }

    // Prepare content for AI
    const finalContent = userMessage 
      ? `User message: ${userMessage}\n\n${fileText ? "File content:\n" + fileText : ""}`
      : fileText;

    if (!finalContent.trim()) {
      return res.status(400).json({ 
        error: "No content to process. Please provide a message or upload a valid file." 
      });
    }

    // Get enhanced prompt for file analysis
    const enhancedPrompt = getEnhancedPrompt(userMessage || "analyze document", provider);
    
    const messages = [
      { 
        role: "system", 
        content: `${enhancedPrompt}\n\nYou are analyzing an uploaded document. Provide comprehensive analysis, insights, and actionable recommendations based on the content.`
      },
      { role: "user", content: finalContent }
    ];

    const reply = await callAI(provider, messages, model, apiKey);

    res.json({
      extracted: fileText ? fileText.substring(0, 500) + "..." : "",
      summary: reply,
      fileName: req.file?.originalname || "",
      provider: AI_PROVIDERS[provider].name,
      model: model || AI_PROVIDERS[provider].defaultModel
    });
  } catch (err) {
    console.error(`❌ ${provider.toUpperCase()} upload error:`, err);
    res.status(500).json({ 
      error: `Failed to process your request with ${AI_PROVIDERS[provider].name}. ${err.message}` 
    });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.error("❌ File cleanup error:", cleanupErr);
      }
    }
  }
}