import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, type AITermExplanation } from '../services/aiService';
import { Search, BookOpen, Lightbulb, Users, Shield, Cpu, Brain, Loader } from 'lucide-react';

const AIGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<AITermExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { userProfile } = useAuth();

  const categories = [
    { id: 'all', name: 'All Terms', icon: BookOpen, color: 'text-gray-600' },
    { id: 'basics', name: 'Basics', icon: Lightbulb, color: 'text-blue-600' },
    { id: 'concepts', name: 'Concepts', icon: Brain, color: 'text-purple-600' },
    { id: 'tools', name: 'Tools', icon: Cpu, color: 'text-green-600' },
    { id: 'ethics', name: 'Ethics', icon: Users, color: 'text-orange-600' },
    { id: 'safety', name: 'Safety', icon: Shield, color: 'text-red-600' },
  ];

  const handleExplainTerm = async () => {
    if (!searchTerm.trim() || !userProfile) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const explanation = await aiService.explainAITerm(
        searchTerm.trim(),
        userProfile.role,
        userProfile.id
      );
      
      setSelectedTerm(explanation);
    } catch (err) {
      console.error('Error explaining term:', err);
      setError('Failed to explain this term. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim() && !loading) {
      handleExplainTerm();
    }
  };

  const commonTerms = [
    'Artificial Intelligence',
    'Machine Learning',
    'Algorithm',
    'Neural Network',
    'Chatbot',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Data Mining',
    'Robotics',
    'Automation',
    'Bias in AI'
  ];

  const getCategoryColor = (category: string) => {
    const categoryObj = categories.find(cat => cat.id === category);
    return categoryObj?.color || 'text-gray-600';
  };

  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(cat => cat.id === category);
    return categoryObj?.icon || BookOpen;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Glossary</h1>
        <p className="text-gray-600">
          Simple, parent-friendly explanations of AI terms to help you discuss technology with confidence.
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
              placeholder="Search AI terms..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={handleExplainTerm}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Interactive Search */}
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ask about any AI term</h3>
        <p className="text-gray-600 mb-6">
          Type any AI or technology term you'd like explained in simple, family-friendly language.
        </p>
        
        <div className="max-w-md mx-auto mb-6">
          <div className="flex">
            <input
              type="text"
              placeholder="Enter an AI term (e.g., 'machine learning', 'algorithm')"
              className="input-field flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleExplainTerm}
              disabled={!searchTerm.trim() || loading}
              className="btn-primary ml-2 px-6 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <span>Explain</span>
              )}
            </button>
          </div>
        </div>

        {/* Common Terms */}
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-500 mb-4">Or try one of these common terms:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {commonTerms.map((term) => (
              <button
                key={term}
                onClick={async () => {
                  setSearchTerm(term);
                  // Auto-explain after setting the term
                  if (userProfile) {
                    try {
                      setLoading(true);
                      setError(null);
                      
                      const explanation = await aiService.explainAITerm(
                        term,
                        userProfile.role,
                        userProfile.id
                      );
                      
                      setSelectedTerm(explanation);
                    } catch (err) {
                      console.error('Error explaining term:', err);
                      setError('Failed to explain this term. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-primary-100 hover:text-primary-700 transition-colors disabled:opacity-50"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          Our AI will provide age-appropriate explanations with examples and tips for parents.
        </p>
      </div>

      {/* Term Detail Modal */}
      {selectedTerm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gray-100 ${getCategoryColor(selectedTerm.category)}`}>
                    {React.createElement(getCategoryIcon(selectedTerm.category), { className: "h-6 w-6" })}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTerm.term}</h2>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Simple Explanation */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Simple Explanation
                  </h3>
                  <p className="text-green-800">{selectedTerm.simpleExplanation}</p>
                </div>

                {/* Technical Explanation */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    More Details
                  </h3>
                  <p className="text-blue-800">{selectedTerm.technicalExplanation}</p>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Real-World Examples</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTerm.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700 text-sm">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parent Notes */}
                {selectedTerm.parentNotes && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Tips for Parents
                    </h3>
                    <p className="text-purple-800">{selectedTerm.parentNotes}</p>
                  </div>
                )}

                {/* Related Terms */}
                {selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Terms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTerm, index) => (
                        <button
                          key={index}
                          onClick={async () => {
                            setSearchTerm(relatedTerm);
                            setSelectedTerm(null);
                            // Auto-explain the related term
                            if (userProfile) {
                              try {
                                setLoading(true);
                                setError(null);
                                
                                const explanation = await aiService.explainAITerm(
                                  relatedTerm,
                                  userProfile.role,
                                  userProfile.id
                                );
                                
                                setSelectedTerm(explanation);
                              } catch (err) {
                                console.error('Error explaining term:', err);
                                setError('Failed to explain this term. Please try again.');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
                        >
                          {relatedTerm}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTerm(null);
                    }}
                    className="btn-primary flex-1"
                  >
                    Explain Another Term
                  </button>
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          How This Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <ul className="space-y-2">
            <li>• Ask about ANY AI term - even ones not in our list</li>
            <li>• Get explanations tailored to your family's level</li>
            <li>• Use the examples to explain to your kids</li>
          </ul>
          <ul className="space-y-2">
            <li>• Click on related terms to explore further</li>
            <li>• Don't worry about perfect understanding</li>
            <li>• Focus on satisfying curiosity together</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIGlossary;