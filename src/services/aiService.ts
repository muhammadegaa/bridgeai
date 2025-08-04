export interface ConversationSuggestion {
  question: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

class AIServiceClass {
  private async makeOpenRouterRequest(messages: Array<{role: string, content: string}>, temperature = 0.7) {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'BridgeAI Family Education'
      },
      body: JSON.stringify({
        model: 'microsoft/wizardlm-2-8x22b',
        messages,
        temperature,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  // Generate personalized conversation suggestions
  async generateConversationSuggestions(
    childAge: number, 
    interests: string[], 
    previousTopics: string[] = []
  ): Promise<ConversationSuggestion[]> {
    try {
      const interestsText = interests.length > 0 ? interests.join(', ') : 'general technology';
      const previousText = previousTopics.length > 0 ? `\nPrevious topics covered: ${previousTopics.join(', ')}` : '';
      
      const prompt = `Create 3 age-appropriate AI/technology conversation prompts for a ${childAge}-year-old child interested in: ${interestsText}.${previousText}

Return ONLY a JSON array with objects containing:
- question: An engaging question to start the conversation
- explanation: Brief explanation of what the question explores
- difficulty: "beginner", "intermediate", or "advanced"

Make sure questions are:
- Age-appropriate for ${childAge}-year-olds
- Related to their interests
- Different from previous topics
- Designed to spark curiosity and discussion`;

      const response = await this.makeOpenRouterRequest([
        { role: 'user', content: prompt }
      ]);

      // Try to parse the JSON response
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(item => ({
            question: item.question || 'How does AI work?',
            explanation: item.explanation || 'Explore the basics of artificial intelligence.',
            difficulty: ['beginner', 'intermediate', 'advanced'].includes(item.difficulty) 
              ? item.difficulty 
              : 'beginner'
          }));
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      // Fallback to default suggestions if parsing fails
      return this.getFallbackSuggestions(childAge);
    } catch (error) {
      console.error('Error generating conversation suggestions:', error);
      return this.getFallbackSuggestions(childAge);
    }
  }

  private getFallbackSuggestions(childAge: number): ConversationSuggestion[] {
    const suggestions = {
      young: [
        {
          question: "How does your phone know which photos have your friends in them?",
          explanation: "This introduces facial recognition and computer vision concepts.",
          difficulty: "beginner" as const
        },
        {
          question: "Why does your tablet suggest games you might like?",
          explanation: "This explores recommendation systems in a kid-friendly way.",
          difficulty: "beginner" as const
        },
        {
          question: "How do voice assistants understand what we say?",
          explanation: "This discusses speech recognition and natural language processing.",
          difficulty: "beginner" as const
        }
      ],
      older: [
        {
          question: "How does AI decide what posts to show you on social media?",
          explanation: "This explores algorithms and their impact on what we see online.",
          difficulty: "intermediate" as const
        },
        {
          question: "Why might AI have biases, and how can we fix them?",
          explanation: "This discusses fairness and ethics in AI systems.",
          difficulty: "intermediate" as const
        },
        {
          question: "How can AI help solve climate change?",
          explanation: "This explores AI applications in environmental challenges.",
          difficulty: "advanced" as const
        }
      ]
    };

    return childAge <= 13 ? suggestions.young : suggestions.older;
  }

  // Generate follow-up questions
  async generateFollowUpQuestions(
    topic: string,
    childAge: number,
    conversationSummary: string
  ): Promise<string[]> {
    try {
      const prompt = `Based on this AI/technology conversation with a ${childAge}-year-old:

Topic: ${topic}
Summary: ${conversationSummary}

Generate 3 thoughtful follow-up questions that:
- Build on what was discussed
- Are age-appropriate for ${childAge}-year-olds
- Encourage deeper thinking
- Can lead to engaging family discussions

Return ONLY a JSON array of strings.`;

      const response = await this.makeOpenRouterRequest([
        { role: 'user', content: prompt }
      ]);

      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(q => typeof q === 'string').slice(0, 3);
        }
      } catch (parseError) {
        console.error('Failed to parse follow-up questions:', parseError);
      }

      // Fallback questions
      return [
        "What other places do you think this type of AI might be used?",
        "How do you think we can make sure AI is helpful and safe?",
        "What would you want to teach an AI if you could?"
      ];
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      return [
        "What questions do you still have about this topic?",
        "How might this technology change in the future?",
        "What do you think are the most important things to remember?"
      ];
    }
  }

  // Analyze journal for topics
  async analyzeJournalForTopics(
    journalContent: string,
    userAge: number
  ): Promise<string[]> {
    try {
      const prompt = `Analyze this journal entry about AI/technology education and suggest 3 relevant topics for future conversations with a ${userAge}-year-old:

"${journalContent}"

Return ONLY a JSON array of topic strings that are:
- Age-appropriate for ${userAge}-year-olds
- Related to the content discussed
- Good for family conversations
- Educational and engaging`;

      const response = await this.makeOpenRouterRequest([
        { role: 'user', content: prompt }
      ]);

      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(topic => typeof topic === 'string').slice(0, 3);
        }
      } catch (parseError) {
        console.error('Failed to parse journal analysis:', parseError);
      }

      // Fallback topics based on age
      return userAge >= 14 
        ? ['AI Ethics and Society', 'Machine Learning Fundamentals', 'AI in Daily Life']
        : ['How AI Learns', 'AI Helpers Around Us', 'Safe AI Use'];
    } catch (error) {
      console.error('Error analyzing journal:', error);
      return userAge >= 14 
        ? ['AI Ethics and Privacy', 'Future of AI Technology', 'AI in Education']
        : ['AI in Games and Apps', 'Smart Home Technology', 'AI Safety'];
    }
  }

  // Explain AI term
  async explainAITerm(
    term: string,
    childAge: number,
    context?: string
  ): Promise<{ simple: string; detailed: string; examples: string[] }> {
    try {
      const contextText = context ? `\nContext: ${context}` : '';
      const prompt = `Explain the AI/technology term "${term}" for a ${childAge}-year-old child.${contextText}

Provide a JSON response with:
- simple: A one-sentence explanation using simple language
- detailed: A more detailed explanation (2-3 sentences) that's still age-appropriate
- examples: Array of 3 real-world examples they can relate to

Make sure all explanations are:
- Age-appropriate for ${childAge}-year-olds
- Accurate but not overly technical
- Engaging and relatable`;

      const response = await this.makeOpenRouterRequest([
        { role: 'user', content: prompt }
      ]);

      try {
        const parsed = JSON.parse(response);
        if (parsed.simple && parsed.detailed && Array.isArray(parsed.examples)) {
          return {
            simple: parsed.simple,
            detailed: parsed.detailed,
            examples: parsed.examples.slice(0, 3)
          };
        }
      } catch (parseError) {
        console.error('Failed to parse term explanation:', parseError);
      }

      // Fallback explanation
      return {
        simple: `${term} is a type of computer technology that can learn and make decisions.`,
        detailed: `${term} works by analyzing lots of information and finding patterns. It can then use these patterns to make predictions or help solve problems.`,
        examples: [
          'Voice assistants like Siri or Alexa',
          'Photo tagging on social media', 
          'Video game opponents that adapt to your playing style'
        ]
      };
    } catch (error) {
      console.error('Error explaining AI term:', error);
      return {
        simple: `${term} is a computer technology that helps solve problems.`,
        detailed: `${term} is designed to work like human thinking, helping computers understand information and make smart decisions.`,
        examples: [
          'Apps that recognize your voice',
          'Systems that recommend movies or music',
          'Programs that help organize photos'
        ]
      };
    }
  }
  // Quick context-aware help
  async askAboutTopic(question: string, childAge: number): Promise<string> {
    const response = await this.makeOpenRouterRequest([
      {
        role: 'system',
        content: `You're a helpful family AI assistant. Answer questions about AI/technology for ${childAge}-year-olds in 2-3 simple sentences. Be encouraging and relate to things they know.`
      },
      {
        role: 'user',
        content: question
      }
    ]);

    if (response && response.length < 500) {
      return response;
    }

    // Simple fallback
    return childAge <= 12 
      ? "That's a great question! AI and technology are all around us helping make things easier and more fun. What made you curious about this?"
      : "Great question! Technology and AI are constantly evolving to help solve problems and make our lives better. What specific part interests you most?";
  }
}

export const aiService = new AIServiceClass();