// 🎯 PERSONALIZATION SYSTEM - Make AI Remember Users

export class UserPersonalization {
  constructor() {
    this.userProfile = this.loadUserProfile();
  }

  // Load user profile from localStorage
  loadUserProfile() {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : this.getDefaultProfile();
    } catch (e) {
      return this.getDefaultProfile();
    }
  }

  // Default user profile structure
  getDefaultProfile() {
    return {
      name: '',
      businessType: '',
      industry: '',
      writingStyle: 'professional',
      preferredLanguage: 'english',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      favoriteTemplates: [],
      recentProjects: [],
      preferences: {
        responseLength: 'medium',
        tone: 'friendly',
        includeExamples: true,
        autoSave: true
      },
      usage: {
        totalChats: 0,
        favoriteProvider: '',
        mostUsedFeatures: [],
        joinDate: new Date().toISOString()
      }
    };
  }

  // Save user profile
  saveUserProfile() {
    try {
      localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    } catch (e) {
      console.warn('Could not save user profile:', e);
    }
  }

  // Update user profile
  updateProfile(updates) {
    this.userProfile = { ...this.userProfile, ...updates };
    this.saveUserProfile();
  }

  // Add to recent projects
  addRecentProject(project) {
    const recentProjects = this.userProfile.recentProjects || [];
    
    // Remove if already exists
    const filtered = recentProjects.filter(p => p.id !== project.id);
    
    // Add to beginning
    filtered.unshift({
      ...project,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10
    this.userProfile.recentProjects = filtered.slice(0, 10);
    this.saveUserProfile();
  }

  // Add to favorite templates
  addFavoriteTemplate(templateId) {
    const favorites = this.userProfile.favoriteTemplates || [];
    if (!favorites.includes(templateId)) {
      favorites.push(templateId);
      this.userProfile.favoriteTemplates = favorites;
      this.saveUserProfile();
    }
  }

  // Remove from favorites
  removeFavoriteTemplate(templateId) {
    const favorites = this.userProfile.favoriteTemplates || [];
    this.userProfile.favoriteTemplates = favorites.filter(id => id !== templateId);
    this.saveUserProfile();
  }

  // Track usage
  trackUsage(provider, feature) {
    this.userProfile.usage.totalChats++;
    
    // Track favorite provider
    const providers = this.userProfile.usage.providers || {};
    providers[provider] = (providers[provider] || 0) + 1;
    this.userProfile.usage.providers = providers;
    
    // Find most used provider
    this.userProfile.usage.favoriteProvider = Object.keys(providers).reduce((a, b) => 
      providers[a] > providers[b] ? a : b
    );

    // Track features
    const features = this.userProfile.usage.mostUsedFeatures || {};
    features[feature] = (features[feature] || 0) + 1;
    this.userProfile.usage.mostUsedFeatures = features;

    this.saveUserProfile();
  }

  // Get personalized greeting
  getPersonalizedGreeting() {
    const { name, businessType, usage } = this.userProfile;
    const hour = new Date().getHours();
    
    let timeGreeting = '';
    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    if (name) {
      if (businessType) {
        return `${timeGreeting}, ${name}! Ready to grow your ${businessType} business with AI?`;
      }
      return `${timeGreeting}, ${name}! What can I help you create today?`;
    }

    if (usage.totalChats > 5) {
      return `${timeGreeting}! Welcome back! You've created ${usage.totalChats} amazing projects with us.`;
    }

    return `${timeGreeting}! I'm your AI assistant. Let's create something amazing together!`;
  }

  // Get personalized suggestions
  getPersonalizedSuggestions() {
    const { favoriteTemplates, recentProjects, businessType, industry } = this.userProfile;
    const suggestions = [];

    // Based on favorites
    if (favoriteTemplates.length > 0) {
      suggestions.push({
        type: 'favorite',
        title: 'Your Favorite Templates',
        items: favoriteTemplates.slice(0, 3)
      });
    }

    // Based on recent projects
    if (recentProjects.length > 0) {
      suggestions.push({
        type: 'recent',
        title: 'Continue Recent Work',
        items: recentProjects.slice(0, 3)
      });
    }

    // Based on business type
    if (businessType) {
      const businessSuggestions = this.getBusinessTypeSuggestions(businessType);
      if (businessSuggestions.length > 0) {
        suggestions.push({
          type: 'business',
          title: `Perfect for ${businessType}`,
          items: businessSuggestions
        });
      }
    }

    return suggestions;
  }

  // Get business-specific suggestions
  getBusinessTypeSuggestions(businessType) {
    const suggestions = {
      'ecommerce': ['content.product_description', 'business.email_marketing', 'creative.image_prompt'],
      'education': ['education.lesson_plan', 'education.study_notes', 'education.quiz_maker'],
      'healthcare': ['professional.medical_report', 'content.blog_post', 'business.business_plan'],
      'technology': ['development.code_generator', 'development.api_documentation', 'business.business_plan'],
      'marketing': ['content.instagram_caption', 'business.email_marketing', 'content.youtube_script'],
      'consulting': ['professional.resume_builder', 'business.business_plan', 'content.blog_post']
    };

    return suggestions[businessType.toLowerCase()] || [];
  }

  // Get personalized prompt enhancement
  enhancePrompt(originalPrompt) {
    const { name, businessType, writingStyle, preferredLanguage, preferences } = this.userProfile;
    
    let enhancement = '';
    
    if (name) {
      enhancement += `Address the user as ${name}. `;
    }
    
    if (businessType) {
      enhancement += `Context: This is for a ${businessType} business. `;
    }
    
    if (writingStyle) {
      enhancement += `Writing style: ${writingStyle}. `;
    }
    
    if (preferences.tone) {
      enhancement += `Tone: ${preferences.tone}. `;
    }
    
    if (preferences.responseLength) {
      enhancement += `Response length: ${preferences.responseLength}. `;
    }
    
    if (preferences.includeExamples) {
      enhancement += `Include practical examples. `;
    }

    return enhancement + originalPrompt;
  }

  // Export user data
  exportUserData() {
    return {
      profile: this.userProfile,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import user data
  importUserData(data) {
    if (data.profile) {
      this.userProfile = { ...this.getDefaultProfile(), ...data.profile };
      this.saveUserProfile();
      return true;
    }
    return false;
  }

  // Reset user profile
  resetProfile() {
    this.userProfile = this.getDefaultProfile();
    localStorage.removeItem('userProfile');
  }
}

// Create global instance
export const userPersonalization = new UserPersonalization();