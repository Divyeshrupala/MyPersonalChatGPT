// 📊 Usage Monitoring System - Track API usage and costs

export class UsageMonitor {
  constructor() {
    this.usage = this.loadUsage();
    this.costs = this.getCostConfig();
  }

  // Cost configuration per provider (per 1M tokens)
  getCostConfig() {
    return {
      openai: {
        'gpt-4o': { input: 2.50, output: 10.00 },
        'gpt-4o-mini': { input: 0.15, output: 0.60 },
        'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
      },
      gemini: {
        'gemini-1.5-flash': { input: 0, output: 0 }, // Free tier
        'gemini-1.5-pro': { input: 0, output: 0 },   // Free tier
        'gemini-pro': { input: 0, output: 0 }        // Free tier
      },
      groq: {
        'llama-3.1-8b-instant': { input: 0, output: 0 },     // Free
        'llama-3.1-70b-versatile': { input: 0, output: 0 },  // Free
        'mixtral-8x7b-32768': { input: 0, output: 0 }        // Free
      },
      deepseek: {
        'deepseek-chat': { input: 0.14, output: 0.28 },
        'deepseek-coder': { input: 0.14, output: 0.28 }
      },
      stability: {
        'stable-diffusion-xl-1024-v1-0': { perImage: 0.002 }
      },
      openrouter: {
        'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },
        'anthropic/claude-3-haiku': { input: 0.25, output: 1.25 },
        'meta-llama/llama-3.1-8b-instruct': { input: 0, output: 0 }, // Free
        'openai/gpt-4o-mini': { input: 0.15, output: 0.60 }
      }
    };
  }

  // Load usage from localStorage (browser only)
  loadUsage() {
    // Check if we're in browser environment
    if (typeof localStorage === 'undefined') {
      // Server-side: return empty usage
      return {
        providers: {},
        daily: {},
        monthly: {},
        total: {
          requests: 0,
          tokens: 0,
          cost: 0
        }
      };
    }
    
    try {
      const stored = localStorage.getItem('apiUsage');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load usage data:', e);
    }
    
    return {
      providers: {},
      daily: {},
      monthly: {},
      total: {
        requests: 0,
        tokens: 0,
        cost: 0
      }
    };
  }

  // Save usage to localStorage (browser only)
  saveUsage() {
    // Check if we're in browser environment
    if (typeof localStorage === 'undefined') {
      // Server-side: skip saving
      return;
    }
    
    try {
      localStorage.setItem('apiUsage', JSON.stringify(this.usage));
    } catch (e) {
      console.error('Failed to save usage data:', e);
    }
  }

  // Record API usage
  recordUsage(provider, model, inputTokens, outputTokens, success = true) {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    // Initialize provider data
    if (!this.usage.providers[provider]) {
      this.usage.providers[provider] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        tokens: 0,
        cost: 0,
        models: {}
      };
    }
    
    // Initialize daily data
    if (!this.usage.daily[today]) {
      this.usage.daily[today] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        providers: {}
      };
    }
    
    // Initialize monthly data
    if (!this.usage.monthly[month]) {
      this.usage.monthly[month] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        providers: {}
      };
    }
    
    // Calculate cost
    const totalTokens = inputTokens + outputTokens;
    const cost = this.calculateCost(provider, model, inputTokens, outputTokens);
    
    // Update provider stats
    this.usage.providers[provider].requests++;
    if (success) {
      this.usage.providers[provider].successfulRequests++;
    } else {
      this.usage.providers[provider].failedRequests++;
    }
    this.usage.providers[provider].tokens += totalTokens;
    this.usage.providers[provider].cost += cost;
    
    // Update model stats
    if (!this.usage.providers[provider].models[model]) {
      this.usage.providers[provider].models[model] = {
        requests: 0,
        tokens: 0,
        cost: 0
      };
    }
    this.usage.providers[provider].models[model].requests++;
    this.usage.providers[provider].models[model].tokens += totalTokens;
    this.usage.providers[provider].models[model].cost += cost;
    
    // Update daily stats
    this.usage.daily[today].requests++;
    this.usage.daily[today].tokens += totalTokens;
    this.usage.daily[today].cost += cost;
    if (!this.usage.daily[today].providers[provider]) {
      this.usage.daily[today].providers[provider] = { requests: 0, tokens: 0, cost: 0 };
    }
    this.usage.daily[today].providers[provider].requests++;
    this.usage.daily[today].providers[provider].tokens += totalTokens;
    this.usage.daily[today].providers[provider].cost += cost;
    
    // Update monthly stats
    this.usage.monthly[month].requests++;
    this.usage.monthly[month].tokens += totalTokens;
    this.usage.monthly[month].cost += cost;
    if (!this.usage.monthly[month].providers[provider]) {
      this.usage.monthly[month].providers[provider] = { requests: 0, tokens: 0, cost: 0 };
    }
    this.usage.monthly[month].providers[provider].requests++;
    this.usage.monthly[month].providers[provider].tokens += totalTokens;
    this.usage.monthly[month].providers[provider].cost += cost;
    
    // Update total stats
    this.usage.total.requests++;
    this.usage.total.tokens += totalTokens;
    this.usage.total.cost += cost;
    
    // Save to localStorage
    this.saveUsage();
  }

  // Calculate cost for API call
  calculateCost(provider, model, inputTokens, outputTokens) {
    const providerCosts = this.costs[provider];
    if (!providerCosts) return 0;
    
    const modelCost = providerCosts[model];
    if (!modelCost) return 0;
    
    // Image generation cost
    if (modelCost.perImage) {
      return modelCost.perImage;
    }
    
    // Text generation cost (per 1M tokens)
    const inputCost = (inputTokens / 1000000) * modelCost.input;
    const outputCost = (outputTokens / 1000000) * modelCost.output;
    
    return inputCost + outputCost;
  }

  // Estimate tokens from text (rough approximation)
  estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Get usage statistics
  getStats(period = 'all') {
    switch (period) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        return this.usage.daily[today] || { requests: 0, tokens: 0, cost: 0 };
      
      case 'month':
        const month = new Date().toISOString().substring(0, 7);
        return this.usage.monthly[month] || { requests: 0, tokens: 0, cost: 0 };
      
      case 'all':
        return this.usage.total;
      
      default:
        return this.usage.total;
    }
  }

  // Get provider statistics
  getProviderStats(provider) {
    return this.usage.providers[provider] || {
      requests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      tokens: 0,
      cost: 0,
      models: {}
    };
  }

  // Get cost breakdown
  getCostBreakdown() {
    const breakdown = {
      total: this.usage.total.cost,
      providers: {},
      free: 0,
      paid: 0
    };
    
    for (const [provider, stats] of Object.entries(this.usage.providers)) {
      breakdown.providers[provider] = stats.cost;
      
      if (stats.cost === 0) {
        breakdown.free += stats.requests;
      } else {
        breakdown.paid += stats.cost;
      }
    }
    
    return breakdown;
  }

  // Get usage summary
  getSummary() {
    const today = this.getStats('today');
    const month = this.getStats('month');
    const total = this.getStats('all');
    const breakdown = this.getCostBreakdown();
    
    return {
      today: {
        requests: today.requests,
        cost: today.cost.toFixed(4)
      },
      month: {
        requests: month.requests,
        cost: month.cost.toFixed(2)
      },
      total: {
        requests: total.requests,
        tokens: total.tokens,
        cost: total.cost.toFixed(2)
      },
      breakdown: {
        free: breakdown.free,
        paid: breakdown.paid.toFixed(2),
        providers: breakdown.providers
      },
      topProvider: this.getTopProvider()
    };
  }

  // Get most used provider
  getTopProvider() {
    let topProvider = null;
    let maxRequests = 0;
    
    for (const [provider, stats] of Object.entries(this.usage.providers)) {
      if (stats.requests > maxRequests) {
        maxRequests = stats.requests;
        topProvider = provider;
      }
    }
    
    return topProvider;
  }

  // Reset usage data
  reset(period = 'all') {
    switch (period) {
      case 'today':
        const today = new Date().toISOString().split('T')[0];
        delete this.usage.daily[today];
        break;
      
      case 'month':
        const month = new Date().toISOString().substring(0, 7);
        delete this.usage.monthly[month];
        break;
      
      case 'all':
        this.usage = {
          providers: {},
          daily: {},
          monthly: {},
          total: {
            requests: 0,
            tokens: 0,
            cost: 0
          }
        };
        break;
    }
    
    this.saveUsage();
  }

  // Export usage data
  exportData() {
    return JSON.stringify(this.usage, null, 2);
  }
}

// Export singleton instance
export const usageMonitor = new UsageMonitor();