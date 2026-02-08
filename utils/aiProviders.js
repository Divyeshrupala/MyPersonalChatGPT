// 🚀 UNIQUE AI ECOSYSTEM HUB - Advanced Multi-Provider System

export const AI_PROVIDERS = {
  openai: {
    name: "OpenAI GPT",
    models: ["gpt-4o-mini", "gpt-3.5-turbo", "gpt-4o"],
    defaultModel: "gpt-4o-mini",
    icon: "🤖",
    description: "Most versatile AI for general tasks",
    specialty: "general",
    personality: "professional",
    color: "#10a37f",
    type: "text"
  },
  gemini: {
    name: "Google Gemini",
    models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"],
    defaultModel: "gemini-1.5-flash",
    icon: "✨",
    description: "Google's powerful multimodal AI",
    specialty: "multimodal",
    personality: "analytical",
    color: "#4285f4",
    type: "text"
  },
  groq: {
    name: "Groq Lightning",
    models: ["llama-3.1-8b-instant"],
    defaultModel: "llama-3.1-8b-instant",
    icon: "⚡",
    description: "Ultra-fast inference with Llama models",
    specialty: "speed",
    personality: "energetic",
    color: "#f55036",
    type: "text"
  },
  deepseek: {
    name: "DeepSeek Coder",
    models: ["deepseek-chat", "deepseek-coder"],
    defaultModel: "deepseek-chat",
    icon: "🧠",
    description: "Advanced reasoning and coding capabilities",
    specialty: "coding",
    personality: "technical",
    color: "#6366f1",
    type: "text"
  },
  stability: {
    name: "Stability AI",
    models: ["stable-diffusion-xl-1024-v1-0"],
    defaultModel: "stable-diffusion-xl-1024-v1-0",
    icon: "🎨",
    description: "Professional AI image generation",
    specialty: "image",
    personality: "creative",
    color: "#8b5cf6",
    type: "image"
  },
  openrouter: {
    name: "OpenRouter Hub",
    models: ["anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku", "meta-llama/llama-3.1-8b-instruct", "openai/gpt-4o-mini"],
    defaultModel: "anthropic/claude-3.5-sonnet",
    icon: "🌐",
    description: "Access to working AI models through one API",
    specialty: "variety",
    personality: "versatile",
    color: "#059669",
    type: "text"
  }
};

// 🎭 AI Personality System
export const AI_PERSONALITIES = {
  professional: "You are a professional, articulate AI assistant. Provide clear, well-structured responses with proper formatting and business-appropriate tone.",
  creative: "You are a creative, imaginative AI with artistic flair. Use vivid language, think outside the box, and embrace innovative ideas.",
  technical: "You are a technical expert AI. Provide detailed, accurate information with code examples, technical specifications, and precise explanations.",
  casual: "You are a friendly, casual AI buddy. Use conversational tone, be approachable, and communicate like a helpful friend.",
  analytical: "You are an analytical AI that breaks down complex topics systematically with data-driven insights and logical reasoning.",
  energetic: "You are an energetic, enthusiastic AI. Be upbeat, motivational, and inject positive energy into your responses.",
  versatile: "You are a versatile AI that adapts your communication style to match the user's needs, context, and preferences.",
  artistic: "You are an artistic AI with deep understanding of visual aesthetics, composition, color theory, and creative expression."
};

// 🎯 Smart Task Detection
export function detectTaskType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('function') || lowerMessage.includes('debug')) {
    return 'coding';
  }
  if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('generate') || lowerMessage.includes('draw')) {
    return 'image';
  }
  if (lowerMessage.includes('fast') || lowerMessage.includes('quick') || lowerMessage.includes('speed')) {
    return 'speed';
  }
  if (lowerMessage.includes('analyze') || lowerMessage.includes('data') || lowerMessage.includes('research')) {
    return 'analytical';
  }
  if (lowerMessage.includes('creative') || lowerMessage.includes('story') || lowerMessage.includes('poem')) {
    return 'creative';
  }
  
  return 'general';
}

// 🤖 Smart AI Router - Automatically selects best AI for task
export function getRecommendedAI(taskType) {
  const recommendations = {
    coding: 'deepseek',
    image: 'stability',
    speed: 'groq',
    analytical: 'gemini',
    creative: 'openai',
    variety: 'openrouter',
    general: 'openai'
  };
  
  return recommendations[taskType] || 'openai';
}

// OpenAI API Handler
export async function callOpenAI(messages, model = "gpt-4o-mini", apiKey) {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Google Gemini API Handler
export async function callGemini(messages, model = "gemini-1.5-flash", apiKey) {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  // Prepare contents for Gemini format
  const contents = [];
  let systemInstruction = null;
  
  // Extract system message if present
  const systemMessage = messages.find(msg => msg.role === 'system');
  if (systemMessage) {
    systemInstruction = systemMessage.content;
  }
  
  // Convert messages to Gemini format
  const userMessages = messages.filter(msg => msg.role !== 'system');
  
  for (const msg of userMessages) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  }

  // If no user messages but has system message, use it as first user message
  if (contents.length === 0 && systemInstruction) {
    contents.push({
      role: 'user',
      parts: [{ text: systemInstruction }]
    });
    systemInstruction = null;
  }

  // Build request body
  const requestBody = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.95,
      topK: 40
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH"
      }
    ]
  };

  // Add system instruction if present
  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = response.statusText;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(`Gemini Error: ${errorMessage}`);
  }

  const data = await response.json();
  
  // Check for valid response
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini did not return any candidates');
  }
  
  const candidate = data.candidates[0];
  
  // Check if content was blocked
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Response was blocked by Gemini safety filters. Try rephrasing your request.');
  }
  
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('Gemini returned an empty response');
  }
  
  return candidate.content.parts[0].text;
}

// Groq API Handler
export async function callGroq(messages, model = "llama-3.1-8b-instant", apiKey) {
  if (!apiKey) {
    throw new Error("Groq API key is required");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// DeepSeek API Handler
export async function callDeepSeek(messages, model = "deepseek-chat", apiKey) {
  if (!apiKey) {
    throw new Error("DeepSeek API key is required");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`DeepSeek Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Stability AI API Handler
export async function callStabilityAI(prompt, model = "stable-diffusion-xl-1024-v1-0", apiKey) {
  if (!apiKey) {
    throw new Error("Stability AI API key is required");
  }

  const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text_prompts: [
        {
          text: prompt,
          weight: 1
        }
      ],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 1,
      steps: 30,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Stability AI Error: ${errorData.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (data.artifacts && data.artifacts.length > 0) {
    const base64Image = data.artifacts[0].base64;
    return `data:image/png;base64,${base64Image}`;
  } else {
    throw new Error('No image generated');
  }
}

// 🌐 OpenRouter API Handler
export async function callOpenRouter(messages, model = "anthropic/claude-3-opus", apiKey) {
  if (!apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.APP_URL || "https://chat.divyeshrupala.in",
      "X-Title": "Multi-AI Ecosystem Hub"
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000, // Reduced from 1500 to avoid credit issues
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter Error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// 🚀 Main AI Router with Smart Features
export async function callAI(provider, messages, model, apiKey, options = {}) {
  const selectedModel = model || AI_PROVIDERS[provider].defaultModel;
  const personality = options.personality || AI_PROVIDERS[provider].personality;
  
  // Add personality to system message for text providers
  if (AI_PROVIDERS[provider].type === 'text' && personality && AI_PERSONALITIES[personality]) {
    const personalityPrompt = AI_PERSONALITIES[personality];
    const systemMessage = messages.find(msg => msg.role === 'system');
    
    if (systemMessage) {
      systemMessage.content = `${personalityPrompt}\n\n${systemMessage.content}`;
    } else {
      messages.unshift({
        role: 'system',
        content: personalityPrompt
      });
    }
  }
  
  switch (provider) {
    case 'openai':
      return await callOpenAI(messages, selectedModel, apiKey);
    case 'gemini':
      return await callGemini(messages, selectedModel, apiKey);
    case 'groq':
      return await callGroq(messages, selectedModel, apiKey);
    case 'deepseek':
      return await callDeepSeek(messages, selectedModel, apiKey);
    case 'stability':
      const prompt = messages[messages.length - 1]?.content || '';
      return await callStabilityAI(prompt, selectedModel, apiKey);
    case 'openrouter':
      return await callOpenRouter(messages, selectedModel, apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// 🎯 Multi-AI Comparison Function
export async function compareAIs(providers, messages, apiKeys) {
  const results = {};
  const promises = providers.map(async (provider) => {
    try {
      const result = await callAI(provider, messages, null, apiKeys[provider]);
      results[provider] = {
        success: true,
        response: result,
        provider: AI_PROVIDERS[provider].name
      };
    } catch (error) {
      results[provider] = {
        success: false,
        error: error.message,
        provider: AI_PROVIDERS[provider].name
      };
    }
  });
  
  await Promise.all(promises);
  return results;
}