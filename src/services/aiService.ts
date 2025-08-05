import { userStatsService } from './userStatsService';

export interface ConversationPrompt {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special';
  ageGroup: '10-13' | '14-17' | 'all';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  estimatedTime: string;
  parentGuidance: string;
  childQuestion: string;
  followUpQuestions: string[];
}

export interface AITermExplanation {
  term: string;
  simpleExplanation: string;
  technicalExplanation: string;
  examples: string[];
  relatedTerms: string[];
  category: 'basics' | 'ethics' | 'safety' | 'tools' | 'concepts';
  parentNotes?: string;
}

class AIServiceClass {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';
  private readonly apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  private async makeRequest(messages: any[], systemPrompt?: string) {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'BridgeAI Family Learning',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI service request failed:', error);
      throw error;
    }
  }

  // Generate conversation prompts based on user profile
  async generateConversationPrompts(
    userRole: 'parent' | 'child',
    childAge?: string,
    interests?: string[]
  ): Promise<ConversationPrompt[]> {
    try {
      const systemPrompt = `You are an expert family educator specializing in AI literacy. Generate 6 engaging conversation prompts for ${userRole}s to discuss AI topics with their family. Each prompt should be age-appropriate, thought-provoking, and lead to meaningful discussions.

      Return a JSON array of conversation prompts with this exact structure:
      [
        {
          "id": "unique-id",
          "title": "Engaging title",
          "description": "What this conversation covers",
          "category": "daily|weekly|special",
          "ageGroup": "10-13|14-17|all",
          "difficulty": "beginner|intermediate|advanced",
          "tags": ["tag1", "tag2"],
          "estimatedTime": "10-15 minutes",
          "parentGuidance": "Tips for parents to guide the conversation",
          "childQuestion": "A question to start the discussion",
          "followUpQuestions": ["Follow-up question 1", "Follow-up question 2"]
        }
      ]

      Make sure topics are relevant, engaging, and help build AI literacy. Mix different categories and difficulties.`;

      const userMessage = `Generate conversation prompts for a ${userRole}${childAge ? ` with a ${childAge} year old child` : ''}${interests ? ` interested in: ${interests.join(', ')}` : ''}. Focus on making AI concepts accessible and interesting for family discussions.`;

      const response = await this.makeRequest([
        { role: 'user', content: userMessage }
      ], systemPrompt);

      // Parse the JSON response
      const prompts = JSON.parse(response);
      
      // Add unique IDs if not present
      return prompts.map((prompt: any, index: number) => ({
        ...prompt,
        id: prompt.id || `prompt-${Date.now()}-${index}`
      }));
    } catch (error) {
      console.error('Error generating conversation prompts:', error);
      throw new Error('Failed to generate conversation prompts');
    }
  }

  // Explain AI terms in family-friendly language
  async explainAITerm(term: string, userRole: 'parent' | 'child', userId: string): Promise<AITermExplanation> {
    try {
      const systemPrompt = `You are a family-friendly AI educator. Explain AI and technology terms in clear, accessible language suitable for parents and children. Provide both simple and more detailed explanations, with practical examples and tips for parents.

      Return a JSON object with this exact structure:
      {
        "term": "The term being explained",
        "simpleExplanation": "Simple explanation suitable for children",
        "technicalExplanation": "More detailed explanation for deeper understanding",
        "examples": ["Real-world example 1", "Real-world example 2", "Real-world example 3"],
        "relatedTerms": ["related term 1", "related term 2"],
        "category": "basics|ethics|safety|tools|concepts",
        "parentNotes": "Tips for parents on how to discuss this with their child"
      }

      Make explanations accurate but accessible. Use analogies children can understand.`;

      const userMessage = `Explain the AI/technology term "${term}" for a ${userRole}. Make it engaging and educational for family learning.`;

      const response = await this.makeRequest([
        { role: 'user', content: userMessage }
      ], systemPrompt);

      const explanation = JSON.parse(response);

      // Update user stats for term lookup
      await userStatsService.updateStats(userId, 'term_lookup', term);

      return explanation;
    } catch (error) {
      console.error('Error explaining AI term:', error);
      throw new Error('Failed to explain AI term');
    }
  }

  // Generate personalized learning insights
  async generateLearningInsights(
    userStats: any,
    recentEntries: any[]
  ): Promise<string[]> {
    try {
      const systemPrompt = `You are a family learning coach. Based on user statistics and recent journal entries, provide personalized insights and suggestions for continued learning. Be encouraging and specific.

      Return a JSON array of 3-4 insight strings that are actionable and motivating.`;

      const userMessage = `User stats: ${JSON.stringify(userStats)}. Recent journal entries: ${JSON.stringify(recentEntries.slice(0, 3))}. Generate personalized learning insights.`;

      const response = await this.makeRequest([
        { role: 'user', content: userMessage }
      ], systemPrompt);

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating learning insights:', error);
      return [
        "Keep exploring AI topics that interest you most!",
        "Try discussing a new AI concept with your family this week.",
        "Your consistent learning is building strong AI literacy skills."
      ];
    }
  }
}

export const aiService = new AIServiceClass();