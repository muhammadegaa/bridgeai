export interface ConversationSuggestion {
  question: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const aiService = {
  // Generate personalized conversation suggestions
  async generateConversationSuggestions(
    _childAge: number, 
    _interests: string[], 
    _previousTopics: string[] = []
  ): Promise<ConversationSuggestion[]> {
    // Fallback suggestions for demo
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
  },

  // Generate follow-up questions
  async generateFollowUpQuestions(
    _topic: string,
    _childAge: number,
    _conversationSummary: string
  ): Promise<string[]> {
    return [
      "What other places do you think this type of AI might be used?",
      "How do you think we can make sure AI is helpful and safe?",
      "What would you want to teach an AI if you could?"
    ];
  },

  // Analyze journal for topics
  async analyzeJournalForTopics(
    _journalContent: string,
    userAge: number
  ): Promise<string[]> {
    return userAge >= 14 
      ? ['AI Ethics and Society', 'Machine Learning Fundamentals', 'AI in Daily Life']
      : ['How AI Learns', 'AI Helpers Around Us', 'Safe AI Use'];
  },

  // Explain AI term
  async explainAITerm(
    term: string,
    _childAge: number,
    _context?: string
  ): Promise<{ simple: string; detailed: string; examples: string[] }> {
    return {
      simple: `${term} is a type of computer technology that can learn and make decisions.`,
      detailed: `${term} works by analyzing lots of information and finding patterns. It can then use these patterns to make predictions or help solve problems.`,
      examples: [
        'Voice assistants like Siri or Alexa',
        'Photo tagging on social media', 
        'Video game opponents that adapt to your playing style'
      ]
    };
  }
};