import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, type ConversationSuggestion } from '../services/aiService';
import { 
  MessageCircle, 
  Clock, 
  Star, 
  ArrowRight,
  Calendar,
  Users,
  Lightbulb,
  Search,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';

interface Prompt {
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

const ConversationPrompts: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<ConversationSuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [aiFollowUps, setAiFollowUps] = useState<string[]>([]);
  const [loadingFollowUps, setLoadingFollowUps] = useState(false);

  // Load AI suggestions when component mounts
  useEffect(() => {
    if (userProfile) {
      generateAISuggestions();
    }
  }, [userProfile]);

  const generateAISuggestions = async () => {
    if (!userProfile) return;
    
    setLoadingAI(true);
    try {
      const userAge = userProfile.role === 'child' ? 12 : 35;
      const interests = userProfile.role === 'child' 
        ? ['gaming', 'videos', 'creativity']
        : ['education', 'family', 'technology'];
      const previousTopics = ['AI basics', 'Social media AI', 'Voice assistants'];
      
      const suggestions = await aiService.generateConversationSuggestions(
        userAge,
        interests,
        previousTopics,
        userProfile.id
      );
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePromptClick = async (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setLoadingFollowUps(true);
    
    try {
      if (userProfile) {
        const userAge = userProfile.role === 'child' ? 12 : 35;
        const conversationSummary = `Discussed ${prompt.title}: ${prompt.description}`;
        
        const followUps = await aiService.generateFollowUpQuestions(
          prompt.title,
          userAge,
          conversationSummary,
          userProfile.id
        );
        
        setAiFollowUps(followUps);
      }
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      setAiFollowUps(prompt.followUpQuestions);
    } finally {
      setLoadingFollowUps(false);
    }
  };

  // Production-ready conversation prompts for families learning about AI
  const prompts: Prompt[] = [
    {
      id: '1',
      title: 'What is Artificial Intelligence?',
      description: 'Start with the basics - explore what AI really means in simple terms.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['basics', 'introduction'],
      estimatedTime: '15 minutes',
      parentGuidance: 'Begin by asking what your child already knows about AI. Use everyday examples like voice assistants or recommendation systems.',
      childQuestion: 'Can you think of any AI that you use every day?',
      followUpQuestions: [
        'How do you think AI learns new things?',
        'What makes AI different from regular computer programs?',
        'What questions do you have about AI?'
      ]
    },
    {
      id: '2',
      title: 'AI in Social Media',
      description: 'Discuss how AI shapes what we see online and its impact on our daily lives.',
      category: 'weekly',
      ageGroup: '14-17',
      difficulty: 'intermediate',
      tags: ['social media', 'algorithms', 'ethics'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Focus on algorithmic feeds and personalization. Discuss both benefits and potential concerns.',
      childQuestion: 'Have you noticed that your social media shows you things you\'re interested in?',
      followUpQuestions: [
        'How do you think these platforms know what you like?',
        'Are there any downsides to AI choosing what we see?',
        'How can we use social media more mindfully?'
      ]
    },
    {
      id: '3',
      title: 'AI and Privacy',
      description: 'Explore how AI uses our data and what that means for privacy.',
      category: 'weekly',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['privacy', 'data', 'ethics'],
      estimatedTime: '20 minutes',
      parentGuidance: 'Help your child understand data collection without creating fear. Focus on making informed choices.',
      childQuestion: 'What information do you think apps collect about us?',
      followUpQuestions: [
        'Why might companies want our data?',
        'How can we protect our privacy online?',
        'What are the benefits and risks of sharing data?'
      ]
    },
    {
      id: '4',
      title: 'How Voice Assistants Work',
      description: 'Demystify how Siri, Alexa, and Google Assistant understand and respond to us.',
      category: 'daily',
      ageGroup: '10-13',
      difficulty: 'beginner',
      tags: ['voice', 'natural language', 'technology'],
      estimatedTime: '15 minutes',
      parentGuidance: 'Use your family\'s voice assistant as a hands-on example. Focus on the "magic" of understanding speech.',
      childQuestion: 'How do you think voice assistants understand what we\'re saying?',
      followUpQuestions: [
        'What happens when the assistant doesn\'t understand?',
        'How do they know the difference between different voices?',
        'What other devices might use similar technology?'
      ]
    },
    {
      id: '5',
      title: 'AI in Creative Fields',
      description: 'Explore how AI is changing art, music, and creative expression.',
      category: 'special',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['creativity', 'art', 'music'],
      estimatedTime: '30 minutes',
      parentGuidance: 'Show examples of AI-generated art or music. Discuss creativity, originality, and human expression.',
      childQuestion: 'Can machines be creative? What makes something creative?',
      followUpQuestions: [
        'How is AI creativity different from human creativity?',
        'Should AI art be considered "real" art?',
        'How might AI change creative careers in the future?'
      ]
    },
    {
      id: '6',
      title: 'Bias in AI Systems',
      description: 'Understand how AI can have biases and why fairness matters.',
      category: 'weekly',
      ageGroup: '14-17',
      difficulty: 'advanced',
      tags: ['bias', 'fairness', 'ethics'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Use age-appropriate examples of bias. Focus on the importance of diverse perspectives in technology.',
      childQuestion: 'Do you think computers can be unfair? How?',
      followUpQuestions: [
        'Where might bias in AI come from?',
        'How can we make AI systems more fair?',
        'Why is it important to have diverse teams building AI?'
      ]
    },
    {
      id: '7',
      title: 'How Does Machine Learning Work?',
      description: 'Understand how computers can learn from examples and improve over time.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['machine learning', 'basics', 'examples'],
      estimatedTime: '20 minutes',
      parentGuidance: 'Compare machine learning to how humans learn - through practice and examples. Use concrete analogies.',
      childQuestion: 'How do you think a computer could learn to recognize cats in photos?',
      followUpQuestions: [
        'What would happen if we only showed the computer orange cats?',
        'How is this different from how you learned to recognize cats?',
        'What other things might computers learn this way?'
      ]
    },
    {
      id: '8',
      title: 'AI in Video Games',
      description: 'Explore how AI creates challenging opponents and realistic game worlds.',
      category: 'daily',
      ageGroup: '10-13',
      difficulty: 'beginner',
      tags: ['gaming', 'entertainment', 'technology'],
      estimatedTime: '18 minutes',
      parentGuidance: 'Use games your child plays as examples. Discuss how AI makes games more fun and challenging.',
      childQuestion: 'Have you ever wondered how computer opponents in games make decisions?',
      followUpQuestions: [
        'What makes a game opponent feel "smart" versus "dumb"?',
        'How do you think NPCs (non-player characters) decide what to say?',
        'Would games be as fun without AI opponents?'
      ]
    },
    {
      id: '9',
      title: 'AI and Climate Change',
      description: 'Discover how AI is being used to help solve environmental challenges.',
      category: 'weekly',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['environment', 'climate', 'solutions'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Focus on positive applications of AI for environmental good. Discuss how technology can help solve big problems.',
      childQuestion: 'How do you think AI could help protect our planet?',
      followUpQuestions: [
        'What environmental problems could benefit from AI analysis?',
        'How might AI help us use energy more efficiently?',
        'Can you think of ways AI could help reduce waste?'
      ]
    },
    {
      id: '10',
      title: 'Chatbots and Conversational AI',
      description: 'Learn how AI can have conversations and when it\'s helpful or limiting.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['chatbots', 'conversation', 'language'],
      estimatedTime: '20 minutes',
      parentGuidance: 'Try interacting with a chatbot together. Discuss what makes conversations feel natural or robotic.',
      childQuestion: 'When you talk to a chatbot, how can you tell it\'s not human?',
      followUpQuestions: [
        'What kinds of questions are easy or hard for chatbots?',
        'When might you prefer talking to a chatbot versus a human?',
        'How do you think chatbots will improve in the future?'
      ]
    },
    {
      id: '11',
      title: 'AI in Healthcare',
      description: 'Explore how AI helps doctors diagnose diseases and develop treatments.',
      category: 'weekly',
      ageGroup: '14-17',
      difficulty: 'intermediate',
      tags: ['healthcare', 'medicine', 'helping people'],
      estimatedTime: '30 minutes',
      parentGuidance: 'Discuss how AI assists doctors but doesn\'t replace human judgment. Focus on helping people.',
      childQuestion: 'How do you think AI could help doctors take better care of patients?',
      followUpQuestions: [
        'What medical tasks might AI be better at than humans?',
        'Why is it important that doctors still make the final decisions?',
        'How could AI help make healthcare available to more people?'
      ]
    },
    {
      id: '12',
      title: 'Deepfakes and AI-Generated Content',
      description: 'Understand how AI can create realistic but fake images and videos.',
      category: 'weekly',
      ageGroup: '14-17',
      difficulty: 'advanced',
      tags: ['deepfakes', 'misinformation', 'media literacy'],
      estimatedTime: '35 minutes',
      parentGuidance: 'Discuss media literacy and critical thinking. Focus on how to identify and question suspicious content.',
      childQuestion: 'Have you ever seen a video online that seemed too good to be true?',
      followUpQuestions: [
        'What clues might help you spot a deepfake?',
        'Why might someone create fake videos or images?',
        'How can we stay informed without being fooled by fake content?'
      ]
    },
    {
      id: '13',
      title: 'Recommendation Systems',
      description: 'Learn how AI suggests movies, music, and products just for you.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['recommendations', 'personalization', 'algorithms'],
      estimatedTime: '18 minutes',
      parentGuidance: 'Explore recommendations on platforms your family uses. Discuss how they can be helpful and limiting.',
      childQuestion: 'How does Netflix seem to know what movies you might like?',
      followUpQuestions: [
        'What information do you think these systems use about you?',
        'Can recommendations ever keep you from discovering new things?',
        'How could you make sure you see a variety of different content?'
      ]
    },
    {
      id: '14',
      title: 'AI and Transportation',
      description: 'Discover how AI is changing how we travel, from GPS to self-driving cars.',
      category: 'weekly',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['transportation', 'self-driving cars', 'navigation'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Start with familiar examples like GPS navigation, then discuss future possibilities.',
      childQuestion: 'How do you think your family\'s GPS knows the fastest route?',
      followUpQuestions: [
        'What would a car need to "know" to drive itself safely?',
        'What are the benefits and concerns of self-driving cars?',
        'How might AI change public transportation?'
      ]
    },
    {
      id: '15',
      title: 'AI in Education',
      description: 'Explore how AI is personalizing learning and changing schools.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['education', 'learning', 'personalization'],
      estimatedTime: '20 minutes',
      parentGuidance: 'Discuss educational apps or tools your child uses. Talk about personalized learning benefits.',
      childQuestion: 'Have you noticed that some educational apps seem to know what you need to practice?',
      followUpQuestions: [
        'How could AI help teachers understand what students need?',
        'What are the advantages of learning at your own pace?',
        'What role should humans play in education even with AI?'
      ]
    },
    {
      id: '16',
      title: 'The Future of Work with AI',
      description: 'Discuss how AI might change jobs and what skills will be important.',
      category: 'special',
      ageGroup: '14-17',
      difficulty: 'advanced',
      tags: ['future', 'careers', 'skills'],
      estimatedTime: '35 minutes',
      parentGuidance: 'Focus on collaboration between humans and AI rather than replacement. Emphasize adaptability.',
      childQuestion: 'What kinds of jobs do you think will be most important in the future?',
      followUpQuestions: [
        'What skills make humans unique compared to AI?',
        'How might AI help people do their jobs better?',
        'What new types of jobs might exist because of AI?'
      ]
    },
    {
      id: '17',
      title: 'AI and Facial Recognition',
      description: 'Understand how AI recognizes faces and the privacy implications.',
      category: 'weekly',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['facial recognition', 'privacy', 'surveillance'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Use phone photo apps as examples. Discuss both convenience and privacy concerns.',
      childQuestion: 'How does your phone know which photos have you in them?',
      followUpQuestions: [
        'When might facial recognition be helpful versus concerning?',
        'Should stores be able to use facial recognition on customers?',
        'How can we enjoy the benefits while protecting our privacy?'
      ]
    },
    {
      id: '18',
      title: 'Language Translation and AI',
      description: 'Explore how AI breaks down language barriers and connects cultures.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['translation', 'language', 'communication'],
      estimatedTime: '20 minutes',
      parentGuidance: 'Try using translation apps together. Discuss how this connects people across cultures.',
      childQuestion: 'How do you think translation apps figure out what words mean in different languages?',
      followUpQuestions: [
        'What makes translation challenging for AI?',
        'How might better translation technology change the world?',
        'What\'s lost when we rely only on AI translation?'
      ]
    },
    {
      id: '19',
      title: 'AI Safety and Control',
      description: 'Discuss how we make sure AI systems are safe and do what we want.',
      category: 'weekly',
      ageGroup: '14-17',
      difficulty: 'advanced',
      tags: ['safety', 'control', 'responsibility'],
      estimatedTime: '30 minutes',
      parentGuidance: 'Use age-appropriate examples of safety measures. Focus on human responsibility in AI development.',
      childQuestion: 'How do we make sure AI systems don\'t make mistakes that could hurt people?',
      followUpQuestions: [
        'Who should be responsible when an AI system makes a mistake?',
        'What safety measures should be built into AI systems?',
        'How can we test AI systems before they\'re widely used?'
      ]
    },
    {
      id: '20',
      title: 'AI in Sports and Entertainment',
      description: 'Discover how AI enhances sports analysis and creates entertainment.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['sports', 'entertainment', 'analysis'],
      estimatedTime: '18 minutes',
      parentGuidance: 'Use sports your family watches as examples. Discuss AI in game analysis and fan experiences.',
      childQuestion: 'Have you noticed all the statistics and predictions during sports broadcasts?',
      followUpQuestions: [
        'How might AI help athletes improve their performance?',
        'What makes sports exciting that AI statistics can\'t capture?',
        'How could AI make watching sports more interactive?'
      ]
    },
    {
      id: '21',
      title: 'Data and How AI Learns',
      description: 'Understand what data is and why it\'s so important for AI systems.',
      category: 'daily',
      ageGroup: 'all',
      difficulty: 'beginner',
      tags: ['data', 'learning', 'information'],
      estimatedTime: '20 minutes',
      parentGuidance: 'Use simple examples of data collection. Compare to how humans learn from experience.',
      childQuestion: 'What kinds of information do you think AI systems need to learn?',
      followUpQuestions: [
        'How is data like food for AI systems?',
        'What happens if AI learns from bad or incomplete information?',
        'How can we make sure AI has good quality data to learn from?'
      ]
    },
    {
      id: '22',
      title: 'AI Ethics and Moral Decisions',
      description: 'Explore how we teach AI systems to make good choices.',
      category: 'special',
      ageGroup: '14-17',
      difficulty: 'advanced',
      tags: ['ethics', 'morality', 'decision making'],
      estimatedTime: '40 minutes',
      parentGuidance: 'Use thought experiments and real-world dilemmas. Focus on the complexity of moral reasoning.',
      childQuestion: 'If an AI system has to choose between two difficult options, how should it decide?',
      followUpQuestions: [
        'Can machines understand right and wrong the way humans do?',
        'Who should decide what values AI systems should have?',
        'How do we handle disagreements about what\'s ethical?'
      ]
    },
    {
      id: '23',
      title: 'Neural Networks and the Brain',
      description: 'Learn how AI systems are inspired by how our brains work.',
      category: 'weekly',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['neural networks', 'brain', 'biology'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Draw connections between brain neurons and artificial networks. Keep biological explanations simple.',
      childQuestion: 'How do you think computer networks might be similar to networks in our brains?',
      followUpQuestions: [
        'What can AI learn from studying how brains work?',
        'How are artificial neural networks different from real brains?',
        'What makes human thinking special compared to AI?'
      ]
    },
    {
      id: '24',
      title: 'AI and Cybersecurity',
      description: 'Understand how AI helps protect us online and how it can be misused.',
      category: 'weekly',
      ageGroup: '14-17',
      difficulty: 'intermediate',
      tags: ['cybersecurity', 'protection', 'hacking'],
      estimatedTime: '25 minutes',
      parentGuidance: 'Discuss both protective and malicious uses of AI. Focus on staying safe online.',
      childQuestion: 'How might AI help keep your personal information safe online?',
      followUpQuestions: [
        'What new types of cyber attacks might use AI?',
        'How can AI help detect suspicious online activity?',
        'What can individuals do to stay safe in an AI-powered world?'
      ]
    },
    {
      id: '25',
      title: 'Building an AI-Literate Family',
      description: 'Reflect on your AI learning journey and plan for continued growth.',
      category: 'special',
      ageGroup: 'all',
      difficulty: 'intermediate',
      tags: ['reflection', 'family', 'growth'],
      estimatedTime: '30 minutes',
      parentGuidance: 'This is a reflective conversation about your family\'s AI learning journey and future goals.',
      childQuestion: 'What\'s the most surprising thing you\'ve learned about AI so far?',
      followUpQuestions: [
        'How has learning about AI changed how you use technology?',
        'What AI topics do you want to explore more?',
        'How can our family stay informed about new AI developments?'
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Prompts', icon: MessageCircle },
    { id: 'daily', name: 'Daily Chats', icon: Calendar },
    { id: 'weekly', name: 'Deep Dives', icon: Clock },
    { id: 'special', name: 'Special Topics', icon: Star },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || prompt.difficulty === selectedDifficulty;
    const matchesSearch = searchTerm === '' || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return Calendar;
      case 'weekly': return Clock;
      case 'special': return Star;
      default: return MessageCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation Prompts</h1>
        <p className="text-gray-600">
          {userProfile?.role === 'parent' 
            ? "Start meaningful conversations with your child about AI and technology."
            : "Explore AI topics through guided discussions with your family."
          }
        </p>
      </div>

      {/* AI-Generated Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              AI-Generated Just for You
            </h2>
            <button
              onClick={generateAISuggestions}
              disabled={loadingAI}
              className="p-2 text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
              title="Generate new suggestions"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAI ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2 text-sm">
                      {suggestion.question}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {suggestion.explanation}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        suggestion.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {suggestion.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{suggestion.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {loadingAI && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
              <span className="text-gray-600">Generating personalized suggestions...</span>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="input-field w-auto"
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty.id} value={difficulty.id}>
              {difficulty.name}
            </option>
          ))}
        </select>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map((prompt) => {
          const CategoryIcon = getCategoryIcon(prompt.category);
          return (
            <div key={prompt.id} className="card hover:shadow-md transition-shadow duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CategoryIcon className="h-5 w-5 text-primary-600" />
                  <span className="text-sm text-gray-500 capitalize">{prompt.category}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(prompt.difficulty)} capitalize`}>
                  {prompt.difficulty}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {prompt.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {prompt.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{prompt.estimatedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{prompt.ageGroup === 'all' ? 'All ages' : `Ages ${prompt.ageGroup}`}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {prompt.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button 
                onClick={() => handlePromptClick(prompt)}
                className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-2 group-hover:bg-primary-700 transition-colors"
              >
                <span>Start Conversation</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms to find conversation prompts.
          </p>
        </div>
      )}

      {/* Prompt Detail Modal with AI Follow-ups */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPrompt.title}</h2>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedPrompt.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Parent Guidance</h3>
                    <p className="text-gray-700">{selectedPrompt.parentGuidance}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Starter Question</h3>
                    <p className="text-gray-700 font-medium bg-blue-50 p-3 rounded-lg">
                      "{selectedPrompt.childQuestion}"
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`px-3 py-1 rounded-full ${
                      selectedPrompt.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      selectedPrompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedPrompt.difficulty}
                    </span>
                    <span className="text-gray-500">{selectedPrompt.estimatedTime}</span>
                    <span className="text-gray-500">Ages {selectedPrompt.ageGroup}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      AI-Generated Follow-ups
                    </h3>
                    {loadingFollowUps ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                        <span className="text-gray-600">Generating personalized questions...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {aiFollowUps.map((question, index) => (
                          <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-gray-900 font-medium text-sm">{question}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Original Follow-ups</h3>
                    <div className="space-y-2">
                      {selectedPrompt.followUpQuestions.map((question, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 text-sm">{question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="btn-primary flex-1">
                  Start This Conversation
                </button>
                <button 
                  onClick={() => setSelectedPrompt(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Tips for Great Conversations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <ul className="space-y-2">
            <li>• Create a comfortable, distraction-free environment</li>
            <li>• Let your child lead parts of the discussion</li>
            <li>• Use real-world examples they can relate to</li>
          </ul>
          <ul className="space-y-2">
            <li>• Ask open-ended questions to encourage thinking</li>
            <li>• It's okay to say "I don't know" and explore together</li>
            <li>• Focus on understanding, not being "right"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConversationPrompts;