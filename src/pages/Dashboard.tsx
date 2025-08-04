import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageCircle, 
  BookOpen, 
  PenTool, 
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

  // Real stats would come from Firebase - for now show empty state
  const stats = [
    {
      name: 'Conversations Started',
      value: '0',
      icon: MessageCircle,
      change: 'Get started',
      changeType: 'neutral',
    },
    {
      name: 'Terms Learned',
      value: '0',
      icon: BookOpen,
      change: 'Explore glossary',
      changeType: 'neutral',
    },
    {
      name: 'Journal Entries',
      value: '0',
      icon: PenTool,
      change: 'Write your first',
      changeType: 'neutral',
    },
    {
      name: 'Family Members',
      value: '1',
      icon: Users,
      change: 'Invite family',
      changeType: 'neutral',
    },
  ];

  // No dummy data - will load from real user activity

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
            <span className="text-sm">Just getting started</span>
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
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">
                Start your first AI conversation to begin learning together.
              </p>
              <Link 
                to="/conversations" 
                className="btn-primary"
              >
                Browse Conversation Prompts
              </Link>
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
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                No family activity yet. Invite family members to start sharing your AI learning journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Tips */}
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
    </div>
  );
};

export default Dashboard;