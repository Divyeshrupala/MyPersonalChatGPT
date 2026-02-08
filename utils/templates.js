// 🎯 PROMPT TEMPLATES - The Real Money-Making Feature

export const PROMPT_TEMPLATES = {
  // 📝 Content Creation
  content: {
    name: "Content Creation",
    icon: "✍️",
    templates: {
      instagram_caption: {
        name: "Instagram Caption Generator",
        icon: "📸",
        prompt: "Create an engaging Instagram caption for: {topic}. Include relevant hashtags and call-to-action. Make it viral and engaging.",
        inputs: [{ name: "topic", placeholder: "Describe your post/product" }]
      },
      youtube_script: {
        name: "YouTube Script Maker",
        icon: "🎬",
        prompt: "Write a complete YouTube script for: {topic}. Include hook, main content, and strong ending. Duration: {duration} minutes.",
        inputs: [
          { name: "topic", placeholder: "Video topic" },
          { name: "duration", placeholder: "5-10 minutes" }
        ]
      },
      blog_post: {
        name: "Blog Post Writer",
        icon: "📝",
        prompt: "Write a comprehensive blog post about: {topic}. Include SEO-friendly title, introduction, main points, and conclusion. Target audience: {audience}.",
        inputs: [
          { name: "topic", placeholder: "Blog topic" },
          { name: "audience", placeholder: "Target audience" }
        ]
      },
      product_description: {
        name: "Product Description",
        icon: "🛍️",
        prompt: "Create compelling product description for: {product}. Highlight benefits, features, and create urgency. Price: {price}",
        inputs: [
          { name: "product", placeholder: "Product name and details" },
          { name: "price", placeholder: "Product price" }
        ]
      }
    }
  },

  // 💼 Business & Marketing
  business: {
    name: "Business & Marketing",
    icon: "💼",
    templates: {
      business_plan: {
        name: "Business Plan Generator",
        icon: "📊",
        prompt: "Create a comprehensive business plan for: {business_idea}. Include market analysis, revenue model, marketing strategy, and financial projections. Target market: {target_market}",
        inputs: [
          { name: "business_idea", placeholder: "Your business idea" },
          { name: "target_market", placeholder: "Who are your customers?" }
        ]
      },
      email_marketing: {
        name: "Email Marketing Campaign",
        icon: "📧",
        prompt: "Create an email marketing campaign for: {product_service}. Include subject line, engaging content, and strong CTA. Goal: {goal}",
        inputs: [
          { name: "product_service", placeholder: "What are you promoting?" },
          { name: "goal", placeholder: "Sales, signup, awareness?" }
        ]
      },
      competitor_analysis: {
        name: "Competitor Analysis",
        icon: "🔍",
        prompt: "Analyze competitors for: {business_type}. Identify strengths, weaknesses, opportunities, and threats. Suggest competitive advantages.",
        inputs: [{ name: "business_type", placeholder: "Your business/industry" }]
      }
    }
  },

  // 🎓 Education & Learning
  education: {
    name: "Education & Learning",
    icon: "🎓",
    templates: {
      lesson_plan: {
        name: "Lesson Plan Creator",
        icon: "📚",
        prompt: "Create a detailed lesson plan for: {subject} - {topic}. Grade level: {grade}. Include objectives, activities, and assessment methods. Duration: {duration}",
        inputs: [
          { name: "subject", placeholder: "Math, Science, English, etc." },
          { name: "topic", placeholder: "Specific topic" },
          { name: "grade", placeholder: "Grade level" },
          { name: "duration", placeholder: "Class duration" }
        ]
      },
      study_notes: {
        name: "Study Notes Generator",
        icon: "📝",
        prompt: "Create comprehensive study notes for: {topic}. Include key concepts, examples, and practice questions. Make it easy to understand for {level} level.",
        inputs: [
          { name: "topic", placeholder: "Subject/topic to study" },
          { name: "level", placeholder: "Beginner/Intermediate/Advanced" }
        ]
      },
      quiz_maker: {
        name: "Quiz & Test Creator",
        icon: "❓",
        prompt: "Create a {question_count} question quiz on: {topic}. Include multiple choice, true/false, and short answer questions. Difficulty: {difficulty}",
        inputs: [
          { name: "topic", placeholder: "Quiz topic" },
          { name: "question_count", placeholder: "Number of questions" },
          { name: "difficulty", placeholder: "Easy/Medium/Hard" }
        ]
      }
    }
  },

  // 💻 Development & Tech
  development: {
    name: "Development & Tech",
    icon: "💻",
    templates: {
      code_generator: {
        name: "Code Generator",
        icon: "⚡",
        prompt: "Generate {language} code for: {functionality}. Include comments, error handling, and best practices. Make it production-ready.",
        inputs: [
          { name: "language", placeholder: "JavaScript, Python, etc." },
          { name: "functionality", placeholder: "What should the code do?" }
        ]
      },
      api_documentation: {
        name: "API Documentation",
        icon: "📖",
        prompt: "Create comprehensive API documentation for: {api_name}. Include endpoints, parameters, examples, and error codes.",
        inputs: [{ name: "api_name", placeholder: "API name and description" }]
      },
      bug_fix_helper: {
        name: "Bug Fix Assistant",
        icon: "🐛",
        prompt: "Help debug this issue: {error_description}. Code: {code}. Provide solution with explanation.",
        inputs: [
          { name: "error_description", placeholder: "Describe the bug/error" },
          { name: "code", placeholder: "Paste your code here" }
        ]
      }
    }
  },

  // 🎨 Creative & Design
  creative: {
    name: "Creative & Design",
    icon: "🎨",
    templates: {
      logo_concept: {
        name: "Logo Design Brief",
        icon: "🎯",
        prompt: "Create a detailed logo design brief for: {company_name}. Industry: {industry}. Style: {style}. Colors: {colors}. Include concept descriptions and rationale.",
        inputs: [
          { name: "company_name", placeholder: "Company/brand name" },
          { name: "industry", placeholder: "Business industry" },
          { name: "style", placeholder: "Modern, vintage, minimalist, etc." },
          { name: "colors", placeholder: "Preferred colors" }
        ]
      },
      image_prompt: {
        name: "AI Image Prompt Creator",
        icon: "🖼️",
        prompt: "Create a detailed AI image generation prompt for: {concept}. Style: {style}. Include lighting, composition, and artistic details for best results.",
        inputs: [
          { name: "concept", placeholder: "What image do you want?" },
          { name: "style", placeholder: "Realistic, cartoon, artistic, etc." }
        ]
      },
      story_writer: {
        name: "Story & Script Writer",
        icon: "📖",
        prompt: "Write a {genre} story about: {plot}. Characters: {characters}. Length: {length}. Make it engaging and well-structured.",
        inputs: [
          { name: "genre", placeholder: "Romance, thriller, comedy, etc." },
          { name: "plot", placeholder: "Main story idea" },
          { name: "characters", placeholder: "Main characters" },
          { name: "length", placeholder: "Short story, novel chapter, etc." }
        ]
      }
    }
  },

  // 🏥 Professional Services
  professional: {
    name: "Professional Services",
    icon: "🏥",
    templates: {
      medical_report: {
        name: "Medical Report Summary",
        icon: "🩺",
        prompt: "Summarize this medical report in simple terms: {report_content}. Explain key findings, recommendations, and next steps for patient understanding.",
        inputs: [{ name: "report_content", placeholder: "Paste medical report content" }]
      },
      legal_document: {
        name: "Legal Document Draft",
        icon: "⚖️",
        prompt: "Draft a {document_type} for: {purpose}. Include necessary clauses and legal language. Jurisdiction: {location}",
        inputs: [
          { name: "document_type", placeholder: "Contract, agreement, etc." },
          { name: "purpose", placeholder: "Purpose of document" },
          { name: "location", placeholder: "Country/state" }
        ]
      },
      resume_builder: {
        name: "Professional Resume",
        icon: "📄",
        prompt: "Create a professional resume for: {name}. Position: {job_title}. Experience: {experience}. Skills: {skills}. Make it ATS-friendly and impactful.",
        inputs: [
          { name: "name", placeholder: "Full name" },
          { name: "job_title", placeholder: "Target job position" },
          { name: "experience", placeholder: "Work experience summary" },
          { name: "skills", placeholder: "Key skills" }
        ]
      }
    }
  }
};

// 🎯 Smart Template Suggestions based on user input
export function suggestTemplates(userInput) {
  const input = userInput.toLowerCase();
  const suggestions = [];

  // Content creation keywords
  if (input.includes('instagram') || input.includes('caption') || input.includes('social media')) {
    suggestions.push('content.instagram_caption');
  }
  if (input.includes('youtube') || input.includes('video') || input.includes('script')) {
    suggestions.push('content.youtube_script');
  }
  if (input.includes('blog') || input.includes('article') || input.includes('write')) {
    suggestions.push('content.blog_post');
  }

  // Business keywords
  if (input.includes('business') || input.includes('startup') || input.includes('plan')) {
    suggestions.push('business.business_plan');
  }
  if (input.includes('email') || input.includes('marketing') || input.includes('campaign')) {
    suggestions.push('business.email_marketing');
  }

  // Education keywords
  if (input.includes('lesson') || input.includes('teach') || input.includes('class')) {
    suggestions.push('education.lesson_plan');
  }
  if (input.includes('study') || input.includes('notes') || input.includes('learn')) {
    suggestions.push('education.study_notes');
  }

  // Development keywords
  if (input.includes('code') || input.includes('program') || input.includes('function')) {
    suggestions.push('development.code_generator');
  }
  if (input.includes('bug') || input.includes('error') || input.includes('debug')) {
    suggestions.push('development.bug_fix_helper');
  }

  // Creative keywords
  if (input.includes('logo') || input.includes('design') || input.includes('brand')) {
    suggestions.push('creative.logo_concept');
  }
  if (input.includes('story') || input.includes('creative') || input.includes('write')) {
    suggestions.push('creative.story_writer');
  }

  // Professional keywords
  if (input.includes('resume') || input.includes('cv') || input.includes('job')) {
    suggestions.push('professional.resume_builder');
  }

  return suggestions;
}

// 🎯 Get template by ID
export function getTemplate(templateId) {
  const [category, template] = templateId.split('.');
  return PROMPT_TEMPLATES[category]?.templates[template];
}

// 🎯 Process template with user inputs
export function processTemplate(templateId, inputs) {
  const template = getTemplate(templateId);
  if (!template) return null;

  let processedPrompt = template.prompt;
  
  // Replace placeholders with user inputs
  Object.entries(inputs).forEach(([key, value]) => {
    processedPrompt = processedPrompt.replace(`{${key}}`, value);
  });

  return {
    ...template,
    processedPrompt
  };
}