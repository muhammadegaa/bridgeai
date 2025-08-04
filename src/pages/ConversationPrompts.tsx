import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  Clock, 
  Star, 
  ArrowRight,
  Calendar,
  Users,
  Lightbulb,
  Search
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

  // Mock data - in a real app, this would come from Firebase
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

              <button className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-2 group-hover:bg-primary-700 transition-colors">
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