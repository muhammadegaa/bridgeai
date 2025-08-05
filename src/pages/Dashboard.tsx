import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userStatsService, type UserStats } from '../services/userStatsService';
import { journalService, type JournalEntry } from '../services/journalService';
import { aiService } from '../services/aiService';
import { 
  MessageCircle, 
  BookOpen, 
  PenTool, 
  Star,
  ArrowRight,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);
  const [todayPrompt, setTodayPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      
      // Load user stats
      const stats = await userStatsService.getUserStats(userProfile.id);
      setUserStats(stats);

      // Load recent journal entries
      const entries = await journalService.getEntries(userProfile.id);
      setRecentEntries(entries.slice(0, 3));

      // Generate today's prompt
      const prompts = await aiService.generateConversationPrompts(
        userProfile.role,
        undefined,
        []
      );
      if (prompts.length > 0) {
        setTodayPrompt(prompts[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatsData = () => {
    if (!userStats) {
      return [
        { name: 'Conversations Started', value: '0', icon: MessageCircle, change: 'Get started', changeType: 'neutral' },
        { name: 'Terms Learned', value: '0', icon: BookOpen, change: 'Explore glossary', changeType: 'neutral' },
        { name: 'Journal Entries', value: '0', icon: PenTool, change: 'Write your first', changeType: 'neutral' },
        { name: 'Current Streak', value: '0', icon: Target, change: 'Start learning', changeType: 'neutral' },
      ];
    }

    return [
      {
        name: 'Conversations Started',
        value: userStats.conversationsStarted.toString(),
        icon: MessageCircle,
        change: userStats.conversationsStarted > 0 ? `+${userStats.conversationsStarted}` : 'Get started',
        changeType: userStats.conversationsStarted > 0 ? 'positive' : 'neutral',
      },
      {
        name: 'Terms Learned',
        value: userStats.termsLearned.toString(),
        icon: BookOpen,
        change: userStats.termsLearned > 0 ? `+${userStats.termsLearned}` : 'Explore glossary',
        changeType: userStats.termsLearned > 0 ? 'positive' : 'neutral',
      },
      {
        name: 'Journal Entries',
        value: userStats.journalEntries.toString(),
        icon: PenTool,
        change: userStats.journalEntries > 0 ? `+${userStats.journalEntries}` : 'Write your first',
        changeType: userStats.journalEntries > 0 ? 'positive' : 'neutral',
      },
      {
        name: 'Current Streak',
        value: `${userStats.currentStreak} days`,
        icon: Target,
        change: userStats.currentStreak > 0 ? `${userStats.longestStreak} best` : 'Start learning',
        changeType: userStats.currentStreak > 0 ? 'positive' : 'neutral',
      },
    ];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {userStats && (
              <>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm">{userStats.level} Level</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm">{userStats.totalPoints} Points</span>
                </div>
                {userStats.currentStreak > 0 && (
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm">{userStats.currentStreak} Day Streak</span>
                  </div>
                )}
              </>
            )}
          </div>
          {userStats && userStats.level !== 'Beginner' && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(userStats.level)}`}>
              {userStats.level}
            </div>
          )}
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
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStatsData().map((stat, index) => {
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
                      {stat.changeType === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Journal Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Journal Entries</h2>
            <Link 
              to="/journal" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="card">
            {loading ? (
              <div className="animate-pulse py-8">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : recentEntries.length > 0 ? (
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <h4 className="font-medium text-gray-900 mb-1">{entry.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{entry.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(entry.createdAt)}</span>
                      <span>{entry.likes.length} likes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
                <p className="text-gray-600 mb-4">
                  Start writing about your AI learning journey.
                </p>
                <Link 
                  to="/journal" 
                  className="btn-primary"
                >
                  Write Your First Entry
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Today's Prompt */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Conversation Starter</h2>
          <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ) : todayPrompt ? (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-secondary-500 text-white rounded-lg">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {todayPrompt.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {todayPrompt.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {todayPrompt.tags?.slice(0, 2).map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 capitalize">{todayPrompt.difficulty}</span>
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
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prompt available</h3>
                <p className="text-gray-600 mb-4">
                  Generate conversation prompts to get started.
                </p>
                <Link 
                  to="/conversations" 
                  className="btn-primary"
                >
                  Browse Conversation Prompts
                </Link>
              </div>
            )}
          </div>

          {/* Achievements */}
          {userStats && userStats.achievements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Recent Achievements</h3>
              <div className="space-y-2">
                {userStats.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {achievement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Tips or Learning Insights */}
      {userStats && (userStats.conversationsStarted > 0 || userStats.journalEntries > 0) ? (
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Keep Learning
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <ul className="space-y-2">
              <li>• You're making great progress on your AI learning journey!</li>
              <li>• Try exploring more advanced conversation topics</li>
              <li>• Share your insights with family members</li>
            </ul>
            <ul className="space-y-2">
              <li>• Consider writing about your favorite discussions</li>
              <li>• Look up technical terms that interest you</li>
              <li>• Celebrate your growing AI literacy!</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Getting Started
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <ul className="space-y-2">
              <li>• Use today's conversation starter during car rides or meals</li>
              <li>• Write in the journal after interesting conversations</li>
              <li>• Look up AI terms when your kids ask "what's that?"</li>
            </ul>
            <ul className="space-y-2">
              <li>• Don't worry about being an expert - explore together</li>
              <li>• Focus on curiosity, not perfect answers</li>
              <li>• Celebrate questions and discoveries</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;