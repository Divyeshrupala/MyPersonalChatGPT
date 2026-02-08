// 🔄 API Fallback System - Automatic failover between providers

import { callAI, AI_PROVIDERS } from './aiProviders.js';

export class APIFallbackManager {
  constructor() {
    // Fallback priority order (free first, then paid)
    this.fallbackOrder = [
      'groq',      // Free, fast
      'gemini',    // Free, quality
      'openrouter', // Some free models
      'deepseek',  // Cheap
      'openai'     // Paid, best quality
    ];
    
    this.failureCount = {};
    this.lastFailure = {};
    this.healthStatus = {};
    
    // Initialize health status
    this.fallbackOrder.forEach(provider => {
      this.healthStatus[provider] = 'healthy';
      this.failureCount[provider] = 0;
    });
  }

  // Try API call with automatic fallback
  async callWithFallback(provider, messages, model, apiKeys, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const timeout = options.timeout || 30000;
    
    // Start with requested provider
    let providersToTry = [provider];
    
    // Add fallback providers if enabled
    if (options.enableFallback !== false) {
      const fallbacks = this.getFallbackProviders(provider, apiKeys);
      providersToTry = [...providersToTry, ...fallbacks];
    }
    
    const errors = [];
    
    for (const currentProvider of providersToTry) {
      // Skip if no API key
      if (!apiKeys[currentProvider]) {
        console.log(`⏭️ Skipping ${currentProvider}: No API key`);
        continue;
      }
      
      // Skip if provider is unhealthy
      if (this.healthStatus[currentProvider] === 'unhealthy') {
        console.log(`⏭️ Skipping ${currentProvider}: Marked as unhealthy`);
        continue;
      }
      
      try {
        console.log(`🔄 Trying ${currentProvider}...`);
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeout);
        });
        
        // Try API call with timeout
        const apiPromise = callAI(
          currentProvider,
          messages,
          model || AI_PROVIDERS[currentProvider].defaultModel,
          apiKeys[currentProvider],
          options
        );
        
        const result = await Promise.race([apiPromise, timeoutPromise]);
        
        // Success! Reset failure count
        this.failureCount[currentProvider] = 0;
        this.healthStatus[currentProvider] = 'healthy';
        
        console.log(`✅ Success with ${currentProvider}`);
        
        return {
          success: true,
          provider: currentProvider,
          result: result,
          fallbackUsed: currentProvider !== provider
        };
        
      } catch (error) {
        console.error(`❌ ${currentProvider} failed:`, error.message);
        
        errors.push({
          provider: currentProvider,
          error: error.message
        });
        
        // Track failure
        this.recordFailure(currentProvider);
        
        // Continue to next provider
        continue;
      }
    }
    
    // All providers failed
    return {
      success: false,
      provider: null,
      result: null,
      errors: errors,
      message: 'All AI providers failed. Please check your API keys and try again.'
    };
  }

  // Get fallback providers based on availability
  getFallbackProviders(primaryProvider, apiKeys) {
    return this.fallbackOrder
      .filter(p => p !== primaryProvider) // Exclude primary
      .filter(p => apiKeys[p]) // Only providers with API keys
      .filter(p => this.healthStatus[p] !== 'unhealthy'); // Only healthy providers
  }

  // Record provider failure
  recordFailure(provider) {
    this.failureCount[provider] = (this.failureCount[provider] || 0) + 1;
    this.lastFailure[provider] = Date.now();
    
    // Mark as unhealthy after 3 consecutive failures
    if (this.failureCount[provider] >= 3) {
      this.healthStatus[provider] = 'unhealthy';
      console.warn(`⚠️ ${provider} marked as unhealthy after ${this.failureCount[provider]} failures`);
      
      // Auto-recover after 5 minutes
      setTimeout(() => {
        this.healthStatus[provider] = 'healthy';
        this.failureCount[provider] = 0;
        console.log(`✅ ${provider} marked as healthy again`);
      }, 5 * 60 * 1000);
    }
  }

  // Get health status of all providers
  getHealthStatus() {
    return {
      ...this.healthStatus,
      failureCount: { ...this.failureCount },
      lastFailure: { ...this.lastFailure }
    };
  }

  // Reset health status
  resetHealth(provider = null) {
    if (provider) {
      this.healthStatus[provider] = 'healthy';
      this.failureCount[provider] = 0;
      delete this.lastFailure[provider];
    } else {
      // Reset all
      this.fallbackOrder.forEach(p => {
        this.healthStatus[p] = 'healthy';
        this.failureCount[p] = 0;
      });
      this.lastFailure = {};
    }
  }

  // Get recommended provider based on health and availability
  getRecommendedProvider(apiKeys, taskType = 'general') {
    // Task-specific recommendations
    const taskRecommendations = {
      coding: ['deepseek', 'groq', 'openai'],
      image: ['stability'],
      speed: ['groq', 'gemini'],
      quality: ['openai', 'gemini'],
      free: ['groq', 'gemini']
    };
    
    const preferred = taskRecommendations[taskType] || this.fallbackOrder;
    
    // Find first healthy provider with API key
    for (const provider of preferred) {
      if (apiKeys[provider] && this.healthStatus[provider] === 'healthy') {
        return provider;
      }
    }
    
    // Fallback to any available provider
    for (const provider of this.fallbackOrder) {
      if (apiKeys[provider] && this.healthStatus[provider] === 'healthy') {
        return provider;
      }
    }
    
    return null;
  }
}

// Export singleton instance
export const apiFallback = new APIFallbackManager();