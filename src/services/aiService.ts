/**
 * Enhanced AI Service with robust error handling, caching, and rate limiting
 */

import { databaseService } from './database';
import { COLLECTIONS, ContentSuggestion } from '../types/database';
import { startAIActivity, endAIActivity } from '../utils/aiActivityEvents';

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ConversationSuggestion {
  question: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageAppropriate: boolean;
  estimatedTime: number; // minutes
}

interface AICache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

class RateLimiter {
  private requests: { [key: string]: number[] } = {};
  private readonly windowMs = 60 * 1000; // 1 minute
  private readonly maxRequests = 10; // per minute

  canMakeRequest(key: string = 'default'): boolean {
    const now = Date.now();
    const userRequests = this.requests[key] || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    this.requests[key] = validRequests;
    
    return validRequests.length < this.maxRequests;
  }

  recordRequest(key: string = 'default'): void {
    if (!this.requests[key]) {
      this.requests[key] = [];
    }
    this.requests[key].push(Date.now());
  }

  getTimeUntilReset(key: string = 'default'): number {
    const requests = this.requests[key] || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const timeUntilReset = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, timeUntilReset);
  }
}

export class AIService {
  private cache: AICache = {};
  private rateLimiter = new RateLimiter();
  private readonly defaultModel = 'anthropic/claude-3.5-sonnet';
  private readonly fallbackModel = 'anthropic/claude-3-haiku';
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor() {
    // Clean up old cache entries every 10 minutes
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
    }
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache[key];
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      delete this.cache[key];
      return null;
    }
    
    return cached.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
  }

  private cleanupCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      const cached = this.cache[key];
      if (now - cached.timestamp > cached.ttl) {
        delete this.cache[key];
      }
    });
  }

  private async makeAPIRequest(
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      userId?: string;
    } = {}
  ): Promise<string> {
    startAIActivity('Generating AI response...');
    const {
      model = this.defaultModel,
      maxTokens = 1000,
      temperature = 0.7,
      userId = 'anonymous',
    } = options;

    // Check rate limiting
    if (!this.rateLimiter.canMakeRequest(userId)) {
      const resetTime = this.rateLimiter.getTimeUntilReset(userId);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`);
    }

    // Check for API key
    if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${import.meta.env.VITE_OPENROUTER_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'BridgeAI - Family AI Education',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data: OpenRouterResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error('No content in AI response');
        }

        // Record successful request
        this.rateLimiter.recordRequest(userId);
        endAIActivity();
        return content;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }
        
        // Exponential backoff for retries
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    endAIActivity();
    throw lastError;
  }
  // Generate personalized conversation suggestions based on child's age and interests
  async generateConversationSuggestions(
    childAge: number,
    interests: string[],
    previousTopics: string[] = [],
    userId?: string
  ): Promise<ConversationSuggestion[]> {
    const cacheKey = `suggestions_${childAge}_${interests.join('_')}_${previousTopics.join('_')}`;
    
    // Check cache first
    const cached = this.getFromCache<ConversationSuggestion[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const prompt = `Generate 3 age-appropriate AI conversation starters for a ${childAge}-year-old who is interested in ${interests.join(', ')}.

Previous topics discussed: ${previousTopics.join(', ') || 'None'}

Requirements:
1. Avoid repeating previous topics
2. Make questions engaging and relatable to their interests
3. Help them understand AI concepts through familiar examples
4. Encourage critical thinking about technology
5. Ensure age-appropriate language and concepts
6. Include estimated conversation time

Format as JSON array with objects containing:
- question: The conversation starter question
- explanation: Brief explanation of the AI concept (2-3 sentences)
- difficulty: "beginner", "intermediate", or "advanced"
- ageAppropriate: true/false
- estimatedTime: number of minutes for discussion

Example:
[{
  "question": "How does your favorite video game know when to make it harder or easier?",
  "explanation": "This introduces adaptive algorithms that learn from player behavior. These systems adjust difficulty in real-time to keep games challenging but not frustrating.",
  "difficulty": "beginner",
  "ageAppropriate": true,
  "estimatedTime": 15
}]`;

      const content = await this.makeAPIRequest(prompt, {
        maxTokens: 1200,
        temperature: 0.8,
        userId,
      });

      // Parse and validate JSON response
      let suggestions: ConversationSuggestion[];
      try {
        suggestions = JSON.parse(content);
        
        // Validate the response structure
        if (!Array.isArray(suggestions) || suggestions.length === 0) {
          throw new Error('Invalid suggestions format');
        }
        
        // Ensure all required fields are present and valid
        suggestions = suggestions.map(suggestion => ({
          question: suggestion.question || 'How do you think AI works?',
          explanation: suggestion.explanation || 'AI helps computers make smart decisions.',
          difficulty: ['beginner', 'intermediate', 'advanced'].includes(suggestion.difficulty) 
            ? suggestion.difficulty 
            : 'beginner',
          ageAppropriate: suggestion.ageAppropriate !== false,
          estimatedTime: Math.max(5, Math.min(30, suggestion.estimatedTime || 15)),
        }));
        
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback');
        suggestions = this.getFallbackSuggestions(childAge, interests);
      }

      // Cache the results
      this.setCache(cacheKey, suggestions, 2 * 60 * 60 * 1000); // 2 hours
      
      return suggestions;
    } catch (error) {
      console.error('Error generating conversation suggestions:', error);
      return this.getFallbackSuggestions(childAge, interests);
    }
  }

  private getFallbackSuggestions(childAge: number, interests: string[]): ConversationSuggestion[] {
    const suggestions = [
      {
        question: "How does your phone know which photos have your friends in them?",
        explanation: "This introduces facial recognition technology, where AI learns to identify faces by comparing patterns and features in photos.",
        difficulty: "beginner" as const,
        ageAppropriate: true,
        estimatedTime: 15,
      },
      {
        question: "Why does YouTube recommend videos you might like?",
        explanation: "Recommendation systems use AI to analyze your viewing history and suggest content similar to what you've enjoyed before.",
        difficulty: "beginner" as const,
        ageAppropriate: true,
        estimatedTime: 12,
      },
      {
        question: "How can AI help doctors find diseases earlier?",
        explanation: "Medical AI can analyze X-rays, scans, and symptoms faster than humans, helping doctors spot problems they might miss.",
        difficulty: "intermediate" as const,
        ageAppropriate: childAge >= 12,
        estimatedTime: 20,
      },
      {
        question: "What makes a video game opponent challenging but fair?",
        explanation: "Game AI adjusts its difficulty based on how well you're playing, using algorithms to create engaging challenges.",
        difficulty: "beginner" as const,
        ageAppropriate: true,
        estimatedTime: 18,
      },
      {
        question: "How does your music app know what song to play next?",
        explanation: "Music recommendation AI analyzes your listening patterns, favorite genres, and even the time of day to suggest songs.",
        difficulty: "beginner" as const,
        ageAppropriate: true,
        estimatedTime: 15,
      },
    ];

    // Filter by age appropriateness and interests
    const filtered = suggestions
      .filter(s => s.ageAppropriate || childAge >= 12)
      .filter(s => {
        if (interests.length === 0) return true;
        const questionLower = s.question.toLowerCase();
        return interests.some(interest => 
          questionLower.includes(interest.toLowerCase()) ||
          s.explanation.toLowerCase().includes(interest.toLowerCase())
        );
      })
      .slice(0, 3);

    return filtered.length > 0 ? filtered : suggestions.slice(0, 3);
  },

  // Generate follow-up questions based on a conversation topic
  async generateFollowUpQuestions(
    topic: string,
    childAge: number,
    conversationSummary: string,
    userId?: string
  ): Promise<string[]> {
    const cacheKey = `followup_${topic}_${childAge}_${conversationSummary.slice(0, 50)}`;
    
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Based on this AI conversation with a ${childAge}-year-old about "${topic}":

"${conversationSummary}"

Generate 3 thoughtful follow-up questions that:
1. Build on what was discussed without repeating
2. Encourage deeper critical thinking
3. Use age-appropriate language for ${childAge}-year-old
4. Connect AI concepts to their daily experiences
5. Promote ethical thinking about technology
6. Are open-ended to encourage discussion

Avoid:
- Yes/no questions
- Questions already covered in the summary
- Overly technical language
- Abstract concepts beyond their age level

Return as a JSON array of exactly 3 question strings:
["Question 1?", "Question 2?", "Question 3?"]`;

      const content = await this.makeAPIRequest(prompt, {
        maxTokens: 400,
        temperature: 0.6,
        userId,
      });

      let questions: string[];
      try {
        questions = JSON.parse(content);
        
        if (!Array.isArray(questions) || questions.length !== 3) {
          throw new Error('Invalid questions format');
        }
        
        // Validate and clean questions
        questions = questions
          .map(q => q.trim())
          .filter(q => q.length > 0 && q.endsWith('?'))
          .slice(0, 3);
          
        if (questions.length < 3) {
          throw new Error('Insufficient valid questions');
        }
        
      } catch (parseError) {
        console.warn('Failed to parse follow-up questions, using fallback');
        questions = this.getFallbackFollowUpQuestions(topic, childAge);
      }

      this.setCache(cacheKey, questions, 1 * 60 * 60 * 1000); // 1 hour
      return questions;
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return this.getFallbackFollowUpQuestions(topic, childAge);
    }
  }

  private getFallbackFollowUpQuestions(topic: string, childAge: number): string[] {
    const ageAppropriate = childAge >= 13;
    
    const basicQuestions = [
      "What other places do you think this type of AI might be used?",
      "How do you think we can make sure AI is helpful and safe?",
      "What would you want to teach an AI if you could?",
      "How might this AI technology change in the future?",
      "What questions do you still have about this topic?",
    ];
    
    const advancedQuestions = [
      "What are the potential benefits and risks of this AI technology?",
      "How might this AI impact different groups of people differently?",
      "What ethical considerations should we think about with this technology?",
      "How can we ensure AI systems like this are fair and unbiased?",
      "What role should humans play in overseeing this AI?",
    ];
    
    const questions = ageAppropriate 
      ? [...basicQuestions, ...advancedQuestions]
      : basicQuestions;
      
    return questions.slice(0, 3);
  },

  // Analyze journal entry and suggest related AI topics to explore
  async analyzeJournalForTopics(
    journalContent: string,
    userAge: number,
    userId?: string
  ): Promise<string[]> {
    const cacheKey = `topics_${userAge}_${journalContent.slice(0, 100).replace(/\s+/g, '_')}`;
    
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Analyze this journal entry from a ${userAge}-year-old learning about AI:

"${journalContent}"

Based on their writing, suggest 3-5 specific AI topics they should explore next:

1. Identify their current level of AI understanding
2. Note any interests, questions, or confusion they expressed
3. Suggest topics that build naturally on their current knowledge
4. Ensure age-appropriate complexity for ${userAge}-year-old
5. Connect to interests they mentioned
6. Include both technical and ethical aspects

Requirements:
- Topics should be specific (not generic)
- Progressive difficulty that builds understanding
- Mix of technical concepts and real-world applications
- Include ethical considerations appropriate for their age
- Avoid topics too advanced or too basic

Return as JSON array of topic strings (3-5 topics):
["Specific Topic 1", "Specific Topic 2", "Specific Topic 3"]`;

      const content = await this.makeAPIRequest(prompt, {
        maxTokens: 400,
        temperature: 0.5,
        userId,
      });

      let topics: string[];
      try {
        topics = JSON.parse(content);
        
        if (!Array.isArray(topics) || topics.length === 0) {
          throw new Error('Invalid topics format');
        }
        
        // Validate and clean topics
        topics = topics
          .map(topic => topic.trim())
          .filter(topic => topic.length > 0 && topic.length < 100)
          .slice(0, 5);
          
        if (topics.length === 0) {
          throw new Error('No valid topics found');
        }
        
      } catch (parseError) {
        console.warn('Failed to parse AI topics, using fallback');
        topics = this.getFallbackTopics(userAge, journalContent);
      }

      this.setCache(cacheKey, topics, 2 * 60 * 60 * 1000); // 2 hours
      return topics;
    } catch (error) {
      console.error('Error analyzing journal for topics:', error);
      return this.getFallbackTopics(userAge, journalContent);
    }
  }

  private getFallbackTopics(userAge: number, journalContent: string): string[] {
    const content = journalContent.toLowerCase();
    
    const topicMap: Record<string, string[]> = {
      gaming: ['AI in Video Games', 'How Game NPCs Think', 'Procedural Game Generation'],
      social: ['AI in Social Media', 'Recommendation Algorithms', 'Digital Privacy and AI'],
      school: ['AI in Education', 'Smart Tutoring Systems', 'AI-Powered Research'],
      creative: ['AI Art Generation', 'AI Music Composition', 'Creative AI Tools'],
      health: ['AI in Healthcare', 'Medical Diagnosis AI', 'AI and Mental Health'],
      future: ['Future of AI', 'AI and Jobs', 'Living with AI Technology'],
      ethical: ['AI Ethics and Fairness', 'AI Bias and Discrimination', 'AI Decision Making'],
      technical: ['How Machine Learning Works', 'Neural Networks Basics', 'AI Training Process'],
    };
    
    const detectedTopics: string[] = [];
    
    Object.entries(topicMap).forEach(([key, topics]) => {
      if (content.includes(key) || topics.some(topic => 
        content.includes(topic.toLowerCase().split(' ')[0])
      )) {
        detectedTopics.push(...topics);
      }
    });
    
    if (detectedTopics.length === 0) {
      return userAge >= 14 
        ? ['AI Ethics and Society', 'Machine Learning Fundamentals', 'AI in Daily Life']
        : ['How AI Learns', 'AI Helpers Around Us', 'Safe AI Use'];
    }
    
    return [...new Set(detectedTopics)].slice(0, 4);
  },

  // Generate age-appropriate explanations for complex AI terms
  async explainAITerm(
    term: string,
    childAge: number,
    context?: string,
    userId?: string
  ): Promise<{ simple: string; detailed: string; examples: string[]; relatedTerms?: string[] }> {
    const cacheKey = `explain_${term}_${childAge}_${context || 'general'}`;
    
    const cached = this.getFromCache<{ simple: string; detailed: string; examples: string[]; relatedTerms?: string[] }>(cacheKey);
    if (cached) return cached;

    try {
      const prompt = `Explain the AI term "${term}" for a ${childAge}-year-old${context ? ` in the context of: ${context}` : ''}.

Requirements:
1. Simple explanation: One clear sentence using analogies a ${childAge}-year-old understands
2. Detailed explanation: 2-3 sentences explaining how it works, age-appropriate
3. Examples: Three real-world examples they encounter daily
4. Related terms: 2-3 related AI concepts they might want to learn next

Guidelines:
- Use language appropriate for ${childAge}-year-old
- Avoid technical jargon
- Use analogies to familiar concepts (toys, games, daily activities)
- Make it engaging and relatable
- Ensure accuracy while keeping it simple
- Examples should be from their world (apps, games, devices they use)

Format as JSON:
{
  "simple": "One-sentence explanation with analogy",
  "detailed": "2-3 sentence explanation of how it works",
  "examples": ["Example 1 they know", "Example 2 they use", "Example 3 they see"],
  "relatedTerms": ["Related concept 1", "Related concept 2", "Related concept 3"]
}`;

      const content = await this.makeAPIRequest(prompt, {
        maxTokens: 600,
        temperature: 0.4,
        userId,
      });

      let explanation: { simple: string; detailed: string; examples: string[]; relatedTerms?: string[] };
      try {
        explanation = JSON.parse(content);
        
        // Validate response structure
        if (!explanation.simple || !explanation.detailed || !Array.isArray(explanation.examples)) {
          throw new Error('Invalid explanation format');
        }
        
        // Ensure we have at least 3 examples
        if (explanation.examples.length < 3) {
          explanation.examples = [
            ...explanation.examples,
            ...this.getFallbackExamples(term, childAge)
          ].slice(0, 3);
        }
        
      } catch (parseError) {
        console.warn('Failed to parse AI term explanation, using fallback');
        explanation = this.getFallbackExplanation(term, childAge, context);
      }

      this.setCache(cacheKey, explanation, 24 * 60 * 60 * 1000); // 24 hours
      return explanation;
    } catch (error) {
      console.error('Error explaining AI term:', error);
      return this.getFallbackExplanation(term, childAge, context);
    }
  }

  private getFallbackExplanation(
    term: string,
    childAge: number,
    context?: string
  ): { simple: string; detailed: string; examples: string[]; relatedTerms?: string[] } {
    const isYoung = childAge < 12;
    
    const fallbacks: Record<string, any> = {
      'machine learning': {
        simple: isYoung 
          ? 'Machine learning is like teaching a computer to learn things by showing it lots of examples, just like how you learn to recognize animals by seeing many pictures of them.'
          : 'Machine learning is a way for computers to learn patterns from data and make predictions, similar to how you get better at a game by practicing.',
        detailed: isYoung
          ? 'When you show a computer thousands of pictures of cats, it starts to recognize what makes a cat look like a cat. Then when you show it a new picture, it can guess if there\'s a cat in it. The more examples it sees, the better it gets at guessing.'
          : 'Machine learning algorithms analyze large amounts of data to find patterns and relationships. They use these patterns to make predictions or decisions about new, unseen data. The system improves its accuracy as it processes more examples.',
        examples: ['Photo recognition on your phone', 'YouTube video recommendations', 'Spam email detection'],
        relatedTerms: ['Artificial Intelligence', 'Neural Networks', 'Deep Learning'],
      },
      'algorithm': {
        simple: isYoung
          ? 'An algorithm is like a recipe that tells a computer exactly what steps to follow to solve a problem or complete a task.'
          : 'An algorithm is a set of rules or instructions that a computer follows to solve problems or make decisions.',
        detailed: isYoung
          ? 'Just like a recipe tells you to mix ingredients in a certain order to make cookies, an algorithm tells a computer what to do step by step. Different algorithms can solve different types of problems.'
          : 'Algorithms break down complex problems into smaller, manageable steps. They provide a systematic approach for computers to process information and arrive at solutions.',
        examples: ['Search engines finding websites', 'GPS calculating routes', 'Social media showing posts'],
        relatedTerms: ['Programming', 'Machine Learning', 'Data Processing'],
      },
    };
    
    const fallback = fallbacks[term.toLowerCase()] || {
      simple: `${term} is a type of computer technology that helps solve problems and make decisions.`,
      detailed: `${term} works by processing information and following specific rules or patterns. It helps computers perform tasks that usually require human thinking and decision-making.`,
      examples: [
        'Voice assistants like Siri or Alexa',
        'Photo tagging on social media',
        'Video game opponents that adapt to your playing style'
      ],
      relatedTerms: ['Artificial Intelligence', 'Machine Learning', 'Computer Science'],
    };
    
    return fallback;
  }

  private getFallbackExamples(term: string, childAge: number): string[] {
    const ageAppropriate = childAge >= 12;
    
    const examples: Record<string, string[]> = {
      'machine learning': ageAppropriate 
        ? ['Netflix movie recommendations', 'Smartphone camera focus', 'Online shopping suggestions']
        : ['Games that get harder as you play', 'Apps that remember what you like', 'Cameras that find faces in photos'],
      'algorithm': ageAppropriate
        ? ['Google search results', 'Instagram feed order', 'Spotify playlist creation']
        : ['Games deciding what happens next', 'Apps showing you things you like', 'Calculators solving math problems'],
      default: ageAppropriate
        ? ['Smart home devices', 'Streaming service recommendations', 'Online translation tools']
        : ['Talking toys', 'Game characters that think', 'Apps that help with homework'],
    };
    
    return examples[term.toLowerCase()] || examples.default;
  }

  // Store and retrieve content suggestions
  async storeContentSuggestion(
    userId: string,
    familyId: string,
    suggestion: Omit<ContentSuggestion, 'id' | 'createdAt'>
  ): Promise<string> {
    return databaseService.create<ContentSuggestion>(
      COLLECTIONS.CONTENT_SUGGESTIONS,
      {
        ...suggestion,
        targetUserId: userId,
        familyId,
        status: 'pending',
        priority: Math.max(1, Math.min(10, suggestion.priority || 5)),
        createdAt: new Date(),
      }
    );
  }

  async getContentSuggestions(
    userId: string,
    status: 'pending' | 'viewed' | 'accepted' | 'dismissed' = 'pending'
  ): Promise<ContentSuggestion[]> {
    return databaseService.query<ContentSuggestion>(COLLECTIONS.CONTENT_SUGGESTIONS, {
      where: [
        { field: 'targetUserId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: status },
      ],
      orderBy: [{ field: 'priority', direction: 'desc' }, { field: 'createdAt', direction: 'desc' }],
      limit: 10,
    });
  }

  // Rate limiting status
  getRateLimitStatus(userId: string = 'anonymous'): {
    canMakeRequest: boolean;
    timeUntilReset: number;
  } {
    return {
      canMakeRequest: this.rateLimiter.canMakeRequest(userId),
      timeUntilReset: this.rateLimiter.getTimeUntilReset(userId),
    };
  }

  // Clear cache manually
  clearCache(): void {
    this.cache = {};
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache),
    };
  }
}

export const aiService = new AIService();