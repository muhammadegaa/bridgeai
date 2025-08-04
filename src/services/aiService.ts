interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface ConversationSuggestion {
  question: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const aiService = {
  // Generate personalized conversation suggestions based on child's age and interests
  async generateConversationSuggestions(
    childAge: number, 
    interests: string[], 
    previousTopics: string[] = []
  ): Promise<ConversationSuggestion[]> {
    try {
      const prompt = `Generate 3 age-appropriate AI conversation starters for a ${childAge}-year-old who is interested in ${interests.join(', ')}. 
      
Previous topics discussed: ${previousTopics.join(', ') || 'None'}

Please avoid repeating previous topics and create questions that:
1. Are engaging and relatable to their interests
2. Help them understand AI concepts through examples they know
3. Encourage critical thinking about technology

Format your response as a JSON array with objects containing:
- question: The conversation starter question
- explanation: Brief explanation of the AI concept
- difficulty: "beginner", "intermediate", or "advanced"

Example format:
[
  {
    "question": "How does your favorite video game know when to make it harder or easier?",
    "explanation": "This introduces the concept of adaptive algorithms and machine learning in gaming.",
    "difficulty": "beginner"
  }
]`;

      const response = await fetch(`${import.meta.env.VITE_OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BridgeAI - Family AI Education'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in AI response');
      }

      // Parse JSON response
      const suggestions = JSON.parse(content) as ConversationSuggestion[];
      return suggestions;
    } catch (error) {
      console.error('Error generating conversation suggestions:', error);
      // Return fallback suggestions
      return [
        {
          question: "How does your phone know which photos have your friends in them?",
          explanation: "This introduces facial recognition and computer vision concepts.",
          difficulty: "beginner"
        },
        {
          question: "Why does YouTube recommend videos you might like?",
          explanation: "This explores recommendation algorithms and data analysis.",
          difficulty: "beginner"
        },
        {
          question: "How can AI help doctors find diseases earlier?",
          explanation: "This discusses AI in healthcare and pattern recognition.",
          difficulty: "intermediate"
        }
      ];
    }
  },

  // Generate follow-up questions based on a conversation topic
  async generateFollowUpQuestions(
    topic: string,
    childAge: number,
    conversationSummary: string
  ): Promise<string[]> {
    try {
      const prompt = `Based on this AI conversation with a ${childAge}-year-old about "${topic}":

"${conversationSummary}"

Generate 3 thoughtful follow-up questions that:
1. Build on what was discussed
2. Encourage deeper thinking
3. Are age-appropriate
4. Help connect AI concepts to their daily life

Return as a JSON array of strings. Example:
["Question 1?", "Question 2?", "Question 3?"]`;

      const response = await fetch(`${import.meta.env.VITE_OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BridgeAI - Family AI Education'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        return JSON.parse(content) as string[];
      }
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
    }

    // Return fallback questions
    return [
      "What other places do you think this type of AI might be used?",
      "How do you think we can make sure AI is helpful and safe?",
      "What would you want to teach an AI if you could?"
    ];
  },

  // Analyze journal entry and suggest related AI topics to explore
  async analyzeJournalForTopics(
    journalContent: string,
    userAge: number
  ): Promise<string[]> {
    try {
      const prompt = `Analyze this journal entry from a ${userAge}-year-old learning about AI:

"${journalContent}"

Based on their interests and questions, suggest 3 specific AI topics they might want to explore next. Make suggestions that:
1. Build on their current understanding
2. Address any curiosity or confusion they expressed
3. Are age-appropriate and engaging
4. Connect to their interests

Return as a JSON array of topic strings. Example:
["Machine Learning in Games", "AI and Privacy", "How Chatbots Work"]`;

      const response = await fetch(`${import.meta.env.VITE_OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BridgeAI - Family AI Education'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.6
        })
      });

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        return JSON.parse(content) as string[];
      }
    } catch (error) {
      console.error('Error analyzing journal for topics:', error);
    }

    // Return fallback topics
    return [
      "How AI Learns from Examples",
      "AI in Creative Arts",
      "The Future of AI Technology"
    ];
  },

  // Generate age-appropriate explanations for complex AI terms
  async explainAITerm(
    term: string,
    childAge: number,
    context?: string
  ): Promise<{ simple: string; detailed: string; examples: string[] }> {
    try {
      const prompt = `Explain the AI term "${term}" for a ${childAge}-year-old${context ? ` in the context of: ${context}` : ''}.

Provide:
1. A simple, one-sentence explanation using analogies they understand
2. A more detailed explanation (2-3 sentences) with how it works
3. Three real-world examples they encounter

Format as JSON:
{
  "simple": "Simple explanation here",
  "detailed": "More detailed explanation here",
  "examples": ["Example 1", "Example 2", "Example 3"]
}`;

      const response = await fetch(`${import.meta.env.VITE_OPENROUTER_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BridgeAI - Family AI Education'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 400,
          temperature: 0.5
        })
      });

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error explaining AI term:', error);
    }

    // Return fallback explanation
    return {
      simple: `${term} is a type of computer technology that can learn and make decisions.`,
      detailed: `${term} works by analyzing lots of information and finding patterns, similar to how humans learn from experience. It can then use these patterns to make predictions or help solve problems.`,
      examples: [
        "Voice assistants like Siri or Alexa",
        "Photo tagging on social media",
        "Video game opponents that adapt to your playing style"
      ]
    };
  }
};