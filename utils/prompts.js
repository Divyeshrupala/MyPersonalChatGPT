// Simple prompting system for AI responses

export const SYSTEM_PROMPTS = {
  default: `You are a helpful AI assistant. When asked for code, provide complete, working code. Be clear and practical.`,

  coding: `You are an expert developer. When asked to write code, provide COMPLETE working code with all files. Use modern best practices and add helpful comments.`
};

export function getEnhancedPrompt(userMessage, provider = 'default') {
  const message = userMessage.toLowerCase();
  
  if (message.includes('code') || message.includes('create') || message.includes('build') || 
      message.includes('make') || message.includes('write')) {
    return SYSTEM_PROMPTS.coding;
  }
  
  return SYSTEM_PROMPTS.default;
}

export function getProviderPrompt(provider) {
  return SYSTEM_PROMPTS.coding;
}
