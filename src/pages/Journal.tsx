import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { journalService, type JournalEntry } from '../services/journalService';
import { userStatsService } from '../services/userStatsService';

import { 
  Plus, 
  Search, 
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  Lock,
  Globe,
  Edit3,
  Trash2
} from 'lucide-react';


const Journal: React.FC = () => {
  const { userProfile } = useAuth();
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mine' | 'family'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    isShared: true,
    tags: [] as string[],
  });

  useEffect(() => {
    loadEntries();
  }, [selectedFilter, userProfile]);

  const loadEntries = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      let entries: JournalEntry[] = [];
      
      if (selectedFilter === 'mine') {
        entries = await journalService.getEntries(userProfile.id, false);
      } else if (selectedFilter === 'family') {
        entries = await journalService.getEntries(userProfile.id, true);
      } else {
        // For 'all', get both shared entries and user's own entries
        const [sharedEntries, userEntries] = await Promise.all([
          journalService.getEntries(userProfile.id, true),
          journalService.getEntries(userProfile.id, false)
        ]);
        
        // Combine and deduplicate
        const allEntries = [...sharedEntries, ...userEntries];
        const uniqueEntries = allEntries.filter((entry, index, arr) => 
          arr.findIndex(e => e.id === entry.id) === index
        );
        entries = uniqueEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      setJournalEntries(entries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setJournalEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const displayEntries = journalEntries;
  
  const filteredEntries = displayEntries.filter(entry => {
    const matchesFilter = 
      selectedFilter === 'all' || 
      (selectedFilter === 'mine' && entry.userId === (userProfile?.id || '')) ||
      (selectedFilter === 'family' && entry.isShared);
    
    const matchesSearch = searchTerm === '' ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handleCreateEntry = async () => {
    if (!userProfile || !newEntry.title || !newEntry.content) return;
    
    try {
      const entryData = {
        userId: userProfile.id,
        userName: userProfile.displayName || 'User',
        userRole: userProfile.role || 'parent',
        title: newEntry.title,
        content: newEntry.content,
        isShared: newEntry.isShared,
        tags: newEntry.tags
      };
      
      await journalService.createEntry(entryData);
      
      // Update user stats
      await userStatsService.updateStats(userProfile.id, 'journal', newEntry.title);
      
      // Close modal and reset form
      setShowNewEntryModal(false);
      setNewEntry({ title: '', content: '', isShared: true, tags: [] });
      
      // Reload entries
      await loadEntries();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      alert('Failed to create journal entry. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRoleColor = (role: 'parent' | 'child') => {
    return role === 'parent' ? 'text-blue-600' : 'text-purple-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Journal</h1>
          <p className="text-gray-600">
            Share insights, questions, and reflections from your AI learning journey.
          </p>
        </div>
        <button
          onClick={() => setShowNewEntryModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search journal entries..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setSelectedFilter('family')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'family'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Shared
          </button>
          <button
            onClick={() => setSelectedFilter('mine')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'mine'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            My Entries
          </button>
        </div>
      </div>

      {/* Journal Entries */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journal entries...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
          <div key={entry.id} className="card">
            {/* Entry Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                  {entry.userName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{entry.userName}</span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getRoleColor(entry.userRole)}`}>
                      {entry.userRole}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(entry.createdAt)}</span>
                    {entry.isShared ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {entry.userId === (userProfile?.id || '') && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this entry?')) {
                        if (entry.id) journalService.deleteEntry(entry.id);
                        loadEntries();
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Prompt Context */}
            {entry.promptTitle && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 From conversation: <span className="font-medium">{entry.promptTitle}</span>
                </p>
              </div>
            )}

            {/* Entry Content */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{entry.title}</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">{entry.content}</p>

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {entry.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Entry Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    if (userProfile && entry.id) {
                      journalService.toggleLike(entry.id, userProfile.id);
                      loadEntries(); // Refresh to show updated likes
                    }
                  }}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${entry.likes.includes(userProfile?.id || '') ? 'fill-current text-red-500' : ''}`} />
                  <span className="text-sm">{entry.likes.length}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">{entry.comments.length}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>

            {/* Comments */}
            {entry.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                {entry.comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          ))}
        </div>
      )}

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
          <p className="text-gray-600 mb-4">
            {selectedFilter === 'mine' 
              ? "You haven't written any journal entries yet."
              : "No entries match your search criteria."
            }
          </p>
          <button
            onClick={() => setShowNewEntryModal(true)}
            className="btn-primary"
          >
            Write Your First Entry
          </button>
        </div>
      )}

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Journal Entry</h2>
                <button
                  onClick={() => setShowNewEntryModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Give your entry a title..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your thoughts and reflections
                  </label>
                  <textarea
                    rows={8}
                    className="input-field resize-none"
                    placeholder="What did you learn? What questions came up? How did the conversation go?"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isShared"
                    checked={newEntry.isShared}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isShared" className="text-sm text-gray-700">
                    Share with family members
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateEntry}
                    disabled={!newEntry.title || !newEntry.content}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Publish Entry
                  </button>
                  <button
                    onClick={() => setShowNewEntryModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
          <Edit3 className="h-5 w-5 mr-2" />
          Journal Writing Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
          <ul className="space-y-2">
            <li>• Reflect on what surprised you most</li>
            <li>• Note questions that came up during conversations</li>
            <li>• Record your child's unique insights and reactions</li>
          </ul>
          <ul className="space-y-2">
            <li>• Share successful conversation strategies</li>
            <li>• Document your family's learning journey</li>
            <li>• Celebrate breakthrough moments and understanding</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Journal;