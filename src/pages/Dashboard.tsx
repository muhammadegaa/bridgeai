import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiService, type ConversationSuggestion } from '../services/aiService';
import { 
  MessageCircle, 
  BookOpen, 
  PenTool, 
  TrendingUp, 
  Clock,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [aiRecommendations, setAiRecommendations] = useState<ConversationSuggestion[]>([]);
  const [todaysPrompt, setTodaysPrompt] = useState<ConversationSuggestion | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const quickActions = [
    {
      title: 'Start a Conversation',
      description: 'Get a new prompt to discuss with your family',
      icon: MessageCircle,
      link: '/conversations',
      color: 'bg-blue-500',
    },
    {
      title: 'Learn AI Terms',
      description: 'Explore our parent-friendly AI glossary',
      icon: BookOpen,
      link: '/glossary',
      color: 'bg-green-500',
    },
    {
      title: 'Write in Journal',
      description: 'Share your thoughts and reflections',
      icon: PenTool,
      link: '/journal',
      color: 'bg-purple-500',
    },
  ];

  const stats = [
    {
      name: 'Conversations Started',
      value: '18',
      icon: MessageCircle,
      change: '+3 this week',
      changeType: 'positive',
    },
    {
      name: 'Terms Learned',
      value: '32',
      icon: BookOpen,
      change: '+7 this week',
      changeType: 'positive',
    },
    {
      name: 'Journal Entries',
      value: '12',
      icon: PenTool,
      change: '+2 this week',
      changeType: 'positive',
    },
    {
      name: 'Family Members',
      value: '4',
      icon: Users,
      change: 'All Active',
      changeType: 'positive',
    },
  ];

  // Load AI-powered recommendations on component mount
  useEffect(() => {
    if (userProfile) {
      loadPersonalizedRecommendations();
    }
  }, [userProfile]);

  const loadPersonalizedRecommendations = async () => {
    if (!userProfile) return;
    
    setLoadingRecommendations(true);
    setRecommendationError(null);
    
    try {
      // Get user's age (default to 12 if child, 35 if parent)
      const userAge = userProfile.role === 'child' ? 12 : 35;
      
      // Mock interests based on role (in real app, these would come from user profile)
      const interests = userProfile.role === 'child' 
        ? ['gaming', 'videos', 'social media']
        : ['education', 'technology', 'family'];
      
      // Mock previous topics (in real app, these would come from conversation history)
      const previousTopics = ['What is AI', 'AI in social media', 'Voice assistants'];
      
      const suggestions = await aiService.generateConversationSuggestions(
        userAge,
        interests,
        previousTopics,
        userProfile.id
      );
      
      setAiRecommendations(suggestions);
      
      // Set today's prompt as the first recommendation
      if (suggestions.length > 0) {
        setTodaysPrompt(suggestions[0]);
      }
    } catch (error: any) {
      console.error('Error loading AI recommendations:', error);
      setRecommendationError(
        error.message.includes('Rate limit') 
          ? 'Too many requests. Please try again in a few minutes.'
          : 'Failed to load personalized recommendations. Using default suggestions.'
      );
      
      // Fallback to static content
      setTodaysPrompt({
        question: "How does AI help doctors diagnose diseases?",
        explanation: "Medical AI can analyze symptoms, test results, and medical images to help doctors spot patterns and make more accurate diagnoses.",
        difficulty: 'intermediate' as const,
        ageAppropriate: true,
        estimatedTime: 20
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const refreshRecommendations = () => {
    loadPersonalizedRecommendations();
  };

  const recentPrompts = [
    {
      id: '1',
      title: 'Language Translation and AI',
      category: 'Technology',
      difficulty: 'Beginner',
      completedAt: '1 day ago',
    },
    {
      id: '2',
      title: 'Chatbots and Conversational AI',
      category: 'Tools',
      difficulty: 'Beginner',
      completedAt: '3 days ago',
    },
    {
      id: '3',
      title: 'The Future of Work with AI',
      category: 'Society',
      difficulty: 'Advanced',
      completedAt: '5 days ago',
    },
    {
      id: '4',
      title: 'Recommendation Systems',
      category: 'Algorithms',
      difficulty: 'Intermediate',
      completedAt: '1 week ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {userProfile?.displayName}!
        </h1>
        <p className="text-primary-100 mb-4">
          {userProfile?.role === 'parent' 
            ? "Ready to explore AI with your family? Let's start meaningful conversations."
            : "Ready to learn more about AI? Let's continue your journey together."
          }
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-sm">Level: Intermediate</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-300" />
            <span className="text-sm">Streak: 12 days</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="card hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <div className="flex items-center text-primary-600 text-sm font-medium">
                      Get started
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-800' 
                      : stat.changeType === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Conversations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
            <Link 
              to="/conversations" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="card">
            <div className="space-y-4">
              {recentPrompts.map((prompt) => (
                <div key={prompt.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {prompt.category}
                      </span>
                      <span className="text-xs text-gray-500">{prompt.difficulty}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {prompt.completedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI-Powered Today's Prompt */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              AI-Powered Suggestion
            </h2>
            <button
              onClick={refreshRecommendations}
              disabled={loadingRecommendations}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Get new suggestions"
            >
              <RefreshCw className={`h-4 w-4 ${loadingRecommendations ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {loadingRecommendations ? (
            <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                <span className="text-gray-600">Generating personalized suggestions...</span>
              </div>
            </div>
          ) : recommendationError ? (
            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-500 text-white rounded-lg">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Using Backup Suggestion
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {recommendationError}
                  </p>
                  {todaysPrompt && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-2">{todaysPrompt.question}</h4>
                      <p className="text-sm text-gray-600 mb-4">{todaysPrompt.explanation}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {todaysPrompt.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{todaysPrompt.estimatedTime} min</span>
                        </div>
                        <Link 
                          to="/conversations" 
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Start Discussion
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : todaysPrompt ? (
            <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-lg">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Perfect for You
                    </h3>
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{todaysPrompt.question}</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {todaysPrompt.explanation}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        todaysPrompt.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        todaysPrompt.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {todaysPrompt.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{todaysPrompt.estimatedTime} min chat</span>
                    </div>
                    <Link 
                      to="/conversations" 
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Start Discussion
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <div className="flex items-center justify-center py-8">
                <MessageCircle className="h-8 w-8 text-gray-400 mr-3" />
                <span className="text-gray-600">No suggestions available right now</span>
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {aiRecommendations.length > 1 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                More AI Suggestions
              </h3>
              <div className="space-y-3">
                {aiRecommendations.slice(1, 3).map((suggestion, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">
                      {suggestion.question}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2">
                      {suggestion.explanation.length > 100 
                        ? `${suggestion.explanation.substring(0, 100)}...` 
                        : suggestion.explanation
                      }
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
                ))}
              </div>
            </div>
          )}

          {/* Family Activity */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Family Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  E
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Emma shared "AI Translation Magic" entry</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  A
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Alex completed "Future of Work" conversation</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  D
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Dad started "Chatbot Analysis" discussion</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;