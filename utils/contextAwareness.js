// Context Awareness System - Smart suggestions based on conversation

export class ContextAwareness {
  constructor() {
    this.conversationContext = [];
    this.detectedTopics = new Set();
    this.suggestedActions = [];
  }

  // Analyze message and update context
  analyzeMessage(message, sender) {
    this.conversationContext.push({
      message,
      sender,
      timestamp: Date.now()
    });

    // Keep only last 10 messages for context
    if (this.conversationContext.length > 10) {
      this.conversationContext.shift();
    }

    // Detect topics
    this.detectTopics(message);
    
    // Generate smart suggestions
    this.generateSuggestions();
  }

  // Detect topics from message
  detectTopics(message) {
    const lowerMessage = message.toLowerCase();
    
    const topicPatterns = {
      authentication: ['login', 'signup', 'auth', 'password', 'user', 'session'],
      database: ['database', 'db', 'sql', 'mongodb', 'mysql', 'postgresql', 'data'],
      api: ['api', 'endpoint', 'rest', 'graphql', 'fetch', 'axios'],
      frontend: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'ui', 'interface'],
      backend: ['server', 'node', 'express', 'python', 'django', 'flask'],
      deployment: ['deploy', 'hosting', 'server', 'cloud', 'aws', 'heroku', 'vercel'],
      testing: ['test', 'testing', 'jest', 'mocha', 'unit test', 'integration'],
      security: ['security', 'encryption', 'hash', 'token', 'jwt', 'oauth'],
      performance: ['optimize', 'performance', 'speed', 'cache', 'lazy load'],
      mobile: ['mobile', 'responsive', 'ios', 'android', 'react native', 'flutter']
    };

    for (const [topic, keywords] of Object.entries(topicPatterns)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          this.detectedTopics.add(topic);
        }
      }
    }
  }

  // Generate smart suggestions based on context
  generateSuggestions() {
    this.suggestedActions = [];

    // Suggestions based on detected topics
    if (this.detectedTopics.has('authentication')) {
      this.suggestedActions.push({
        icon: '🔐',
        text: 'Add password reset functionality',
        prompt: 'Add password reset functionality with email verification'
      });
      this.suggestedActions.push({
        icon: '👤',
        text: 'Implement user profile management',
        prompt: 'Create user profile page with edit functionality'
      });
    }

    if (this.detectedTopics.has('database')) {
      this.suggestedActions.push({
        icon: '💾',
        text: 'Add database migrations',
        prompt: 'Set up database migrations and schema management'
      });
      this.suggestedActions.push({
        icon: '🔍',
        text: 'Implement search functionality',
        prompt: 'Add search feature with database indexing'
      });
    }

    if (this.detectedTopics.has('api')) {
      this.suggestedActions.push({
        icon: '📡',
        text: 'Add API documentation',
        prompt: 'Generate API documentation with Swagger/OpenAPI'
      });
      this.suggestedActions.push({
        icon: '🔒',
        text: 'Implement API rate limiting',
        prompt: 'Add rate limiting and API key authentication'
      });
    }

    if (this.detectedTopics.has('frontend')) {
      this.suggestedActions.push({
        icon: '🎨',
        text: 'Add dark mode',
        prompt: 'Implement dark mode theme toggle'
      });
      this.suggestedActions.push({
        icon: '📱',
        text: 'Make it responsive',
        prompt: 'Optimize for mobile and tablet devices'
      });
    }

    if (this.detectedTopics.has('deployment')) {
      this.suggestedActions.push({
        icon: '🚀',
        text: 'Set up CI/CD pipeline',
        prompt: 'Configure automated deployment with GitHub Actions'
      });
      this.suggestedActions.push({
        icon: '🌐',
        text: 'Add custom domain',
        prompt: 'Configure custom domain and SSL certificate'
      });
    }

    if (this.detectedTopics.has('testing')) {
      this.suggestedActions.push({
        icon: '🧪',
        text: 'Add more test coverage',
        prompt: 'Write comprehensive unit and integration tests'
      });
      this.suggestedActions.push({
        icon: '🤖',
        text: 'Set up automated testing',
        prompt: 'Configure automated test runs on commits'
      });
    }

    if (this.detectedTopics.has('security')) {
      this.suggestedActions.push({
        icon: '🛡️',
        text: 'Security audit',
        prompt: 'Perform security audit and fix vulnerabilities'
      });
      this.suggestedActions.push({
        icon: '🔐',
        text: 'Add 2FA',
        prompt: 'Implement two-factor authentication'
      });
    }

    if (this.detectedTopics.has('performance')) {
      this.suggestedActions.push({
        icon: '⚡',
        text: 'Add caching',
        prompt: 'Implement caching strategy for better performance'
      });
      this.suggestedActions.push({
        icon: '📦',
        text: 'Code splitting',
        prompt: 'Implement code splitting and lazy loading'
      });
    }

    // Generic suggestions if no specific topics detected
    if (this.suggestedActions.length === 0) {
      this.suggestedActions = [
        {
          icon: '📝',
          text: 'Add documentation',
          prompt: 'Create comprehensive documentation for this project'
        },
        {
          icon: '🎨',
          text: 'Improve UI/UX',
          prompt: 'Enhance user interface and user experience'
        },
        {
          icon: '🔧',
          text: 'Add error handling',
          prompt: 'Implement comprehensive error handling and logging'
        },
        {
          icon: '✅',
          text: 'Add validation',
          prompt: 'Add input validation and data sanitization'
        }
      ];
    }

    // Limit to 4 suggestions
    this.suggestedActions = this.suggestedActions.slice(0, 4);
  }

  // Get current suggestions
  getSuggestions() {
    return this.suggestedActions;
  }

  // Clear context
  clearContext() {
    this.conversationContext = [];
    this.detectedTopics.clear();
    this.suggestedActions = [];
  }
}

// Export singleton instance
export const contextAwareness = new ContextAwareness();