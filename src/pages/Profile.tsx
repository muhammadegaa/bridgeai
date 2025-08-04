import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Bell,
  Shield,
  Star,
  TrendingUp,
  Edit3,
  Check,
  X
} from 'lucide-react';

const Profile: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: userProfile?.displayName || '',
    email: userProfile?.email || '',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    conversationReminders: 'weekly' as 'daily' | 'weekly' | 'none',
    shareProgress: true,
    allowFamilyView: true,
  });

  // Mock stats - in a real app, these would come from Firebase
  const stats = {
    conversationsStarted: 12,
    termsLearned: 25,
    journalEntries: 8,
    daysActive: 15,
    streak: 5,
    level: 'Beginner',
  };

  const achievements = [
    { id: 1, title: 'First Conversation', description: 'Started your first AI discussion', earned: true, date: '2024-01-15' },
    { id: 2, title: 'Curious Learner', description: 'Looked up 10 AI terms', earned: true, date: '2024-01-16' },
    { id: 3, title: 'Journal Writer', description: 'Wrote 5 journal entries', earned: true, date: '2024-01-18' },
    { id: 4, title: 'Streak Master', description: 'Maintained 7-day learning streak', earned: false, date: null },
    { id: 5, title: 'Family Connector', description: 'Shared 10 entries with family', earned: false, date: null },
    { id: 6, title: 'Deep Thinker', description: 'Completed 5 advanced conversations', earned: false, date: null },
  ];

  const recentActivity = [
    { action: 'Completed conversation', item: 'AI and Privacy', date: '2 days ago' },
    { action: 'Added journal entry', item: 'Privacy Discussion Insights', date: '2 days ago' },
    { action: 'Looked up term', item: 'Machine Learning', date: '3 days ago' },
    { action: 'Started conversation', item: 'What is AI?', date: '1 week ago' },
  ];

  const handleSaveProfile = () => {
    // In a real app, this would update Firebase
    console.log('Saving profile:', editedProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      displayName: userProfile?.displayName || '',
      email: userProfile?.email || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and track your learning progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userProfile?.displayName?.charAt(0) || 'U'}
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      className="input-field"
                      value={editedProfile.displayName}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile?.displayName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      className="input-field"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900">{userProfile?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      userProfile?.role === 'parent' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {userProfile?.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>January 2024</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Settings</h2>
            
            <div className="space-y-6">
              {/* Notifications */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-gray-400" />
                  Notifications
                </h3>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Email notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Conversation reminders</span>
                    <select
                      value={settings.conversationReminders}
                      onChange={(e) => setSettings(prev => ({ ...prev, conversationReminders: e.target.value as 'daily' | 'weekly' | 'none' }))}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-gray-400" />
                  Privacy
                </h3>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Share progress with family</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.shareProgress}
                        onChange={(e) => setSettings(prev => ({ ...prev, shareProgress: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Allow family to view my journal</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowFamilyView}
                        onChange={(e) => setSettings(prev => ({ ...prev, allowFamilyView: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>: {activity.item}
                    </p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Level</span>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-900">{stats.level}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversations</span>
                <span className="font-medium text-gray-900">{stats.conversationsStarted}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Terms Learned</span>
                <span className="font-medium text-gray-900">{stats.termsLearned}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Journal Entries</span>
                <span className="font-medium text-gray-900">{stats.journalEntries}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Streak</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-gray-900">{stats.streak} days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h2>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    <Star className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      achievement.earned ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-xs ${
                      achievement.earned ? 'text-green-700' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <p className="text-xs text-green-600 mt-1">
                        Earned {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left">
                Change Password
              </button>
              <button className="w-full btn-secondary text-left">
                Export Data
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-red-600 hover:text-red-700 text-left py-2 px-3 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;