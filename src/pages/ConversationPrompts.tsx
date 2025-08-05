import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, type ConversationPrompt } from '../services/aiService';
import { userStatsService } from '../services/userStatsService';
import { 
  MessageCircle, 
  Clock, 
  Star, 
  ArrowRight,
  Calendar,
  Users,
  Lightbulb,
  Search,
  RefreshCw
} from 'lucide-react';

const ConversationPrompts: React.FC = () => {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [prompts, setPrompts] = useState<ConversationPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<ConversationPrompt | null>(null);

  useEffect(() => {
    loadPrompts();
  }, [userProfile]);

  const loadPrompts = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Generate AI prompts based on user profile
      const generatedPrompts = await aiService.generateConversationPrompts(
        userProfile.role,
        undefined, // TODO: Add child age to user profile
        [] // TODO: Add interests to user profile
      );
      
      setPrompts(generatedPrompts);
    } catch (err) {
      console.error('Error loading prompts:', err);
      setError('Failed to load conversation prompts. Please try again.');
      // Fallback to empty array
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (prompt: ConversationPrompt) => {
    if (!userProfile) return;
    
    try {
      // Update user stats for starting a conversation
      await userStatsService.updateStats(userProfile.id, 'conversation', prompt.title);
      
      // Show prompt details
      setSelectedPrompt(prompt);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Still show the prompt even if stats update fails
      setSelectedPrompt(prompt);
    }
  };

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation Prompts</h1>
          <p className="text-gray-600">
            {userProfile?.role === 'parent' 
              ? "Start meaningful conversations with your child about AI and technology."
              : "Explore AI topics through guided discussions with your family."
            }
          </p>
        </div>
        <button
          onClick={loadPrompts}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadPrompts}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
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

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized conversation prompts...</p>
        </div>
      ) : (
        <>
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
                onClick={() => handleStartConversation(prompt)}
                className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-2 group-hover:bg-primary-700 transition-colors"
              >
                <span>Start Conversation</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
          })}
        </div>

        {filteredPrompts.length === 0 && !loading && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation prompts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? "Try adjusting your filters or search terms."
                : "Click 'Refresh' to generate new personalized conversation prompts."
              }
            </p>
            <button
              onClick={loadPrompts}
              className="btn-primary"
            >
              Generate New Prompts
            </button>
          </div>
        )}
        </>
      )}

      {/* Prompt Detail Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPrompt.title}</h2>
                  <p className="text-gray-600">{selectedPrompt.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Guidance */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    For Parents
                  </h3>
                  <p className="text-blue-800 text-sm">{selectedPrompt.parentGuidance}</p>
                </div>

                {/* Child Question */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Starting Question
                  </h3>
                  <p className="text-green-800 text-sm font-medium">"{selectedPrompt.childQuestion}"</p>
                </div>
              </div>

              {/* Follow-up Questions */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  Follow-up Questions
                </h3>
                <ul className="space-y-2">
                  {selectedPrompt.followUpQuestions.map((question, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-600 mt-1">•</span>
                      <span className="text-gray-700">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags and Info */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  Est. time: {selectedPrompt.estimatedTime}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="btn-primary w-full"
                >
                  Start This Conversation
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