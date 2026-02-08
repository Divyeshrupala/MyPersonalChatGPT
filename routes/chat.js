import { callAI, AI_PROVIDERS } from "../utils/aiProviders.js";
import { getEnhancedPrompt } from "../utils/prompts.js";
import crypto from "crypto";

// API key validation
function validateApiKey(provider, apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Basic format validation for different providers
  const patterns = {
    openai: /^sk-(proj-)?[A-Za-z0-9_-]{20,}$/, // More flexible for new format
    gemini: /^AIzaSy[A-Za-z0-9_-]{33}$/,
    groq: /^gsk_[A-Za-z0-9]{52}$/,
    deepseek: /^sk-[A-Za-z0-9]{32,}$/,
    stability: /^sk-[A-Za-z0-9]{48,}$/,
    openrouter: /^sk-or-v1-[A-Za-z0-9]{64}$/
  };
  
  const pattern = patterns[provider];
  
  // If pattern exists, test it; otherwise just check minimum length
  if (pattern) {
    return pattern.test(apiKey);
  }
  
  // Fallback: just check if it's long enough
  return apiKey.length > 20;
}

export async function handleChat(req, res) {
  console.log(`📨 Chat request from IP: ${req.ip}`);
  
  const { messages, provider = 'openai', model, apiKey } = req.body;
  
  if (!messages || messages.length === 0) {
    console.log('❌ No messages provided');
    return res.status(400).json({ error: "No messages provided" });
  }

  if (!AI_PROVIDERS[provider]) {
    console.log(`❌ Unsupported provider: ${provider}`);
    return res.status(400).json({ error: `Unsupported AI provider: ${provider}` });
  }

  if (!apiKey) {
    console.log(`❌ No API key for provider: ${provider}`);
    return res.status(400).json({ error: `API key is required for ${AI_PROVIDERS[provider].name}` });
  }

  // Validate API key format
  if (!validateApiKey(provider, apiKey)) {
    console.log(`❌ Invalid API key format for provider: ${provider}`);
    return res.status(400).json({ error: `Invalid API key format for ${AI_PROVIDERS[provider].name}` });
  }

  // Rate limiting per API key (simple in-memory store)
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 16);
  
  // TODO: Implement proper rate limiting per API key
  // For now, we rely on the global rate limiter
  
  try {
    console.log(`🤖 Processing chat with ${provider}`);
    
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Input validation
    if (userMessage.length > 10000) {
      console.log('❌ Message too long');
      return res.status(400).json({ error: "Message too long. Maximum 10,000 characters allowed." });
    }
    
    let reply;
    
    if (provider === 'stability') {
      // For image providers
      console.log('🎨 Generating image with Stability AI');
      
      reply = await callAI(provider, messages, model, apiKey);
      
      res.json({ 
        reply: `🎨 Image generated successfully!`,
        imageUrl: reply,
        provider: AI_PROVIDERS[provider].name,
        model: model || AI_PROVIDERS[provider].defaultModel
      });
    } else {
      // For text-based AI providers
      const enhancedPrompt = getEnhancedPrompt(userMessage, provider);
      
      const systemMessage = {
        role: "system",
        content: enhancedPrompt
      };

      const fullMessages = [systemMessage, ...messages];
      
      console.log(`💭 Calling ${provider} API`);
      
      reply = await callAI(provider, fullMessages, model, apiKey);
      
      if (!reply || reply.trim().length === 0) {
        console.log('⚠️ Empty response from AI');
        return res.json({ reply: "⚠️ AI did not return any content." });
      }

      console.log(`✅ Response received from ${provider}`);
      
      res.json({ 
        reply,
        provider: AI_PROVIDERS[provider].name,
        model: model || AI_PROVIDERS[provider].defaultModel
      });
    }
  } catch (err) {
    console.error(`❌ ${provider.toUpperCase()} API error:`, err);
    console.error('Error stack:', err.stack);
    console.error('Error details:', {
      message: err.message,
      name: err.name,
      provider: provider,
      model: model
    });
    
    // Don't expose internal error details
    let safeErrorMessage = 'Service temporarily unavailable';
    
    if (err.message.includes('API key')) {
      safeErrorMessage = 'Invalid or expired API key';
    } else if (err.message.includes('quota') || err.message.includes('Quota')) {
      safeErrorMessage = 'API quota exceeded. Please check your account.';
    } else if (err.message.includes('timeout') || err.message.includes('Timeout')) {
      safeErrorMessage = 'Request timeout. Please try again.';
    } else if (err.message.includes('fetch')) {
      safeErrorMessage = 'Network error. Please check your connection.';
    }
      
    res.status(500).json({ 
      error: `Failed to get response from ${AI_PROVIDERS[provider]?.name || provider}. ${safeErrorMessage}`,
      provider: provider,
      timestamp: new Date().toISOString()
    });
  }
}