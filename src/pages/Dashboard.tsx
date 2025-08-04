import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  BookOpen, 
  PenTool, 
  TrendingUp, 
  Clock,
  Star,
  Users,
  ArrowRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();

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
      value: '12',
      icon: MessageCircle,
      change: '+2 this week',
      changeType: 'positive',
    },
    {
      name: 'Terms Learned',
      value: '25',
      icon: BookOpen,
      change: '+5 this week',
      changeType: 'positive',
    },
    {
      name: 'Journal Entries',
      value: '8',
      icon: PenTool,
      change: '+1 this week',
      changeType: 'positive',
    },
    {
      name: 'Family Members',
      value: '3',
      icon: Users,
      change: 'Active',
      changeType: 'neutral',
    },
  ];

  const recentPrompts = [
    {
      id: '1',
      title: 'What is Machine Learning?',
      category: 'Basics',
      difficulty: 'Beginner',
      completedAt: '2 days ago',
    },
    {
      id: '2',
      title: 'AI in Social Media',
      category: 'Ethics',
      difficulty: 'Intermediate',
      completedAt: '1 week ago',
    },
    {
      id: '3',
      title: 'How Do Voice Assistants Work?',
      category: 'Tools',
      difficulty: 'Beginner',
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
            <span className="text-sm">Level: Beginner</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-300" />
            <span className="text-sm">Streak: 5 days</span>
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

        {/* Today's Prompt */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Prompt</h2>
          <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-secondary-500 text-white rounded-lg">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  How does AI recognize faces in photos?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Explore facial recognition technology together and discuss privacy implications.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Computer Vision
                    </span>
                    <span className="text-xs text-gray-500">Intermediate</span>
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

          {/* Family Activity */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Family Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  S
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Sarah added a journal entry</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Mom completed "AI Ethics" prompt</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
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