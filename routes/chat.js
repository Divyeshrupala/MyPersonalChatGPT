import { callAI, AI_PROVIDERS } from "../utils/aiProviders.js";
import { getEnhancedPrompt } from "../utils/prompts.js";
import { detectCodingTask, generateCodingPrompt } from "../utils/codingAssistant.js";
import { apiFallback } from "../utils/apiFallback.js";
import { usageMonitor } from "../utils/usageMonitor.js";
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
    
    // Get the user's message to determine the best prompt
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Input validation
    if (userMessage.length > 10000) {
      console.log('❌ Message too long');
      return res.status(400).json({ error: "Message too long. Maximum 10,000 characters allowed." });
    }
    
    // Estimate tokens for monitoring (optional, don't fail if error)
    let inputTokens = 0;
    try {
      inputTokens = usageMonitor.estimateTokens(JSON.stringify(messages));
    } catch (e) {
      console.warn('⚠️ Usage monitoring error:', e.message);
    }
    
    let reply;
    
    if (provider === 'stability') {
      // For image providers, return image URL directly
      console.log('🎨 Generating image with Stability AI');
      
      try {
        reply = await callAI(provider, messages, model, apiKey);
        
        // Record usage (optional, don't fail if error)
        try {
          usageMonitor.recordUsage(provider, model || AI_PROVIDERS[provider].defaultModel, 0, 0, true);
        } catch (e) {
          console.warn('⚠️ Usage recording error:', e.message);
        }
        
        res.json({ 
          reply: `🎨 Image generated successfully!`,
          imageUrl: reply,
          provider: AI_PROVIDERS[provider].name,
          model: model || AI_PROVIDERS[provider].defaultModel
        });
      } catch (error) {
        // Record failure (optional)
        try {
          usageMonitor.recordUsage(provider, model || AI_PROVIDERS[provider].defaultModel, 0, 0, false);
        } catch (e) {
          console.warn('⚠️ Usage recording error:', e.message);
        }
        throw error;
      }
    } else {
      // For text-based AI providers
      
      // 🚀 ENHANCED CODING DETECTION
      const codingTask = detectCodingTask(userMessage);
      console.log(`🔍 Detected task: ${codingTask.taskType} (confidence: ${codingTask.confidence})`);
      
      let enhancedPrompt;
      
      if (codingTask.confidence >= 0.7) {
        // High confidence coding task - use specialized coding prompt
        console.log(`💻 Using specialized coding prompt for ${codingTask.taskType}`);
        enhancedPrompt = generateCodingPrompt(codingTask.taskType, codingTask.technologies, provider);
        
        // Add task context to the response
        console.log(`🛠️ Technologies detected: ${codingTask.technologies.map(t => t.technology).join(', ')}`);
      } else {
        // Use general enhanced prompt
        enhancedPrompt = getEnhancedPrompt(userMessage, provider);
      }
      
      // Create enhanced system message
      const systemMessage = {
        role: "system",
        content: enhancedPrompt
      };

      const fullMessages = [systemMessage, ...messages];
      
      // 🔄 TRY API CALL (without fallback for now - single key)
      console.log(`💭 Calling ${provider} API`);
      
      try {
        reply = await callAI(provider, fullMessages, model, apiKey);
      } catch (apiError) {
        console.error(`❌ ${provider} API error:`, apiError.message);
        
        // Record failure (optional)
        try {
          usageMonitor.recordUsage(provider, model || AI_PROVIDERS[provider].defaultModel, inputTokens, 0, false);
        } catch (e) {
          console.warn('⚠️ Usage recording error:', e.message);
        }
        
        throw new Error(`${AI_PROVIDERS[provider].name} Error: ${apiError.message}`);
      }
      
      if (!reply || reply.trim().length === 0) {
        console.log('⚠️ Empty response from AI');
        try {
          usageMonitor.recordUsage(provider, model || AI_PROVIDERS[provider].defaultModel, inputTokens, 0, false);
        } catch (e) {
          console.warn('⚠️ Usage recording error:', e.message);
        }
        return res.json({ reply: "⚠️ AI did not return any content." });
      }

      // Estimate output tokens (optional)
      let outputTokens = 0;
      try {
        outputTokens = usageMonitor.estimateTokens(reply);
      } catch (e) {
        console.warn('⚠️ Token estimation error:', e.message);
      }
      
      // Record successful usage (optional)
      try {
        usageMonitor.recordUsage(
          provider,
          model || AI_PROVIDERS[provider].defaultModel,
          inputTokens,
          outputTokens,
          true
        );
      } catch (e) {
        console.warn('⚠️ Usage recording error:', e.message);
      }

      console.log(`✅ Response received from ${provider}`);
      
      // Add metadata about the coding task detection
      const responseData = { 
        reply,
        provider: AI_PROVIDERS[provider].name,
        model: model || AI_PROVIDERS[provider].defaultModel
      };
      
      // Add coding task metadata for frontend to use
      if (codingTask.confidence >= 0.7) {
        responseData.codingTask = {
          type: codingTask.taskType,
          technologies: codingTask.technologies,
          confidence: codingTask.confidence
        };
      }
      
      res.json(responseData);
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