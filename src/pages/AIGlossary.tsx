import React, { useState } from 'react';
import { Search, BookOpen, Lightbulb, Users, Shield, Cpu, Brain } from 'lucide-react';

interface AITerm {
  id: string;
  term: string;
  simpleExplanation: string;
  technicalExplanation: string;
  examples: string[];
  relatedTerms: string[];
  category: 'basics' | 'ethics' | 'safety' | 'tools' | 'concepts';
  parentNotes?: string;
}

const AIGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<AITerm | null>(null);

  // Mock data - in a real app, this would come from Firebase
  const aiTerms: AITerm[] = [
    {
      id: '1',
      term: 'Artificial Intelligence (AI)',
      simpleExplanation: 'Computer programs that can do tasks that usually need human thinking, like recognizing faces or understanding speech.',
      technicalExplanation: 'AI refers to computer systems able to perform tasks that typically require human intelligence, including visual perception, speech recognition, decision-making, and language translation.',
      examples: [
        'Siri or Alexa understanding what you say',
        'Netflix recommending movies you might like',
        'Your phone\'s camera recognizing faces in photos'
      ],
      relatedTerms: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
      category: 'basics',
      parentNotes: 'Start with examples they use every day. Emphasize that AI is a tool created by humans to help with specific tasks.'
    },
    {
      id: '2',
      term: 'Machine Learning',
      simpleExplanation: 'A way for computers to learn patterns from examples, like how a child learns to recognize different animals by seeing many pictures.',
      technicalExplanation: 'A subset of AI that enables systems to automatically learn and improve from experience without being explicitly programmed for every scenario.',
      examples: [
        'Email systems learning to detect spam',
        'Music apps learning your taste in songs',
        'Photo apps getting better at organizing pictures'
      ],
      relatedTerms: ['Artificial Intelligence', 'Training Data', 'Algorithms'],
      category: 'basics',
      parentNotes: 'Compare it to human learning - we get better at tasks through practice and examples.'
    },
    {
      id: '3',
      term: 'Algorithm',
      simpleExplanation: 'A set of rules or instructions that tells a computer exactly what to do, like a recipe for solving a problem.',
      technicalExplanation: 'A finite sequence of well-defined instructions for solving a computational problem or performing a task.',
      examples: [
        'Google\'s search algorithm finding relevant websites',
        'Social media algorithms choosing what posts to show',
        'GPS algorithms finding the best route home'
      ],
      relatedTerms: ['Machine Learning', 'Data', 'Programming'],
      category: 'concepts',
      parentNotes: 'Use cooking recipes as an analogy - step-by-step instructions that always produce a result.'
    },
    {
      id: '4',
      term: 'Bias in AI',
      simpleExplanation: 'When AI systems are unfair to certain groups of people, often because they learned from biased examples.',
      technicalExplanation: 'Systematic errors in AI systems that result in unfair treatment of individuals or groups, often stemming from biased training data or flawed algorithms.',
      examples: [
        'Job screening tools that favor certain backgrounds',
        'Facial recognition working better for some skin tones',
        'Loan approval systems showing preference for certain demographics'
      ],
      relatedTerms: ['Fairness', 'Training Data', 'Ethics'],
      category: 'ethics',
      parentNotes: 'Discuss fairness and the importance of diverse perspectives in creating technology.'
    },
    {
      id: '5',
      term: 'Neural Network',
      simpleExplanation: 'A computer system inspired by how our brain works, with many connected parts that work together to solve problems.',
      technicalExplanation: 'A computing system vaguely inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information.',
      examples: [
        'Image recognition systems that identify objects',
        'Language translation tools',
        'Voice assistants understanding speech'
      ],
      relatedTerms: ['Deep Learning', 'Artificial Intelligence', 'Machine Learning'],
      category: 'concepts',
      parentNotes: 'Emphasize the inspiration from nature while keeping it simple - like a network of friends sharing information.'
    },
    {
      id: '6',
      term: 'Training Data',
      simpleExplanation: 'The examples that we show to AI systems so they can learn, like flashcards help students study.',
      technicalExplanation: 'The dataset used to teach machine learning algorithms, containing input-output pairs that help the system learn patterns and make predictions.',
      examples: [
        'Thousands of photos labeled "cat" or "dog" to teach image recognition',
        'Past weather data to predict future conditions',
        'Customer purchase history to recommend products'
      ],
      relatedTerms: ['Machine Learning', 'Bias', 'Data'],
      category: 'concepts',
      parentNotes: 'Explain that the quality and variety of examples determines how well AI learns - like studying from good textbooks.'
    },
    {
      id: '7',
      term: 'Privacy',
      simpleExplanation: 'Keeping your personal information safe and controlling who can see or use it.',
      technicalExplanation: 'The right to control access to information about oneself, including how personal data is collected, used, and shared by AI systems.',
      examples: [
        'Choosing what information apps can access',
        'Controlling who sees your photos and posts',
        'Deciding whether to share location data'
      ],
      relatedTerms: ['Data Protection', 'Personal Information', 'Consent'],
      category: 'safety',
      parentNotes: 'Emphasize that privacy is about choice and control, not secrecy. Help them understand their rights.'
    },
    {
      id: '8',
      term: 'Chatbot',
      simpleExplanation: 'A computer program that can have conversations with people through text or voice, like a digital assistant.',
      technicalExplanation: 'An AI application that simulates human conversation through text or voice interactions, often used for customer service or information retrieval.',
      examples: [
        'Customer service bots on websites',
        'Virtual assistants like Siri or Google Assistant',
        'Educational chatbots that help with homework'
      ],
      relatedTerms: ['Natural Language Processing', 'AI Assistant', 'Conversation'],
      category: 'tools',
      parentNotes: 'Point out chatbots they might already interact with and discuss the benefits and limitations.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Terms', icon: BookOpen, color: 'text-gray-600' },
    { id: 'basics', name: 'Basics', icon: Lightbulb, color: 'text-blue-600' },
    { id: 'concepts', name: 'Concepts', icon: Brain, color: 'text-purple-600' },
    { id: 'tools', name: 'Tools', icon: Cpu, color: 'text-green-600' },
    { id: 'ethics', name: 'Ethics', icon: Users, color: 'text-orange-600' },
    { id: 'safety', name: 'Safety', icon: Shield, color: 'text-red-600' },
  ];

  const filteredTerms = aiTerms.filter(term => {
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.simpleExplanation.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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

      {/* Terms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTerms.map((term) => {
          const CategoryIcon = getCategoryIcon(term.category);
          return (
            <div
              key={term.id}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => setSelectedTerm(term)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{term.term}</h3>
                <div className={`p-2 rounded-lg bg-gray-100 ${getCategoryColor(term.category)}`}>
                  <CategoryIcon className="h-5 w-5" />
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {term.simpleExplanation}
              </p>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getCategoryColor(term.category)} capitalize`}>
                  {term.category}
                </span>
                <span className="text-sm text-primary-600 font-medium">
                  Click to learn more →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No terms found</h3>
          <p className="text-gray-600">
            Try adjusting your search or selecting a different category.
          </p>
        </div>
      )}

      {/* Term Detail Modal */}
      {selectedTerm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Simple Explanation
                  </h3>
                  <p className="text-gray-700">{selectedTerm.simpleExplanation}</p>
                </div>

                {/* Technical Explanation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                    More Details
                  </h3>
                  <p className="text-gray-700">{selectedTerm.technicalExplanation}</p>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Examples</h3>
                  <ul className="space-y-2">
                    {selectedTerm.examples.map((example, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span className="text-gray-700">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Parent Notes */}
                {selectedTerm.parentNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Tips for Parents
                    </h3>
                    <p className="text-blue-800">{selectedTerm.parentNotes}</p>
                  </div>
                )}

                {/* Related Terms */}
                {selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Related Terms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map((relatedTerm, index) => {
                        const related = aiTerms.find(t => t.term === relatedTerm);
                        return (
                          <button
                            key={index}
                            onClick={() => related && setSelectedTerm(related)}
                            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
                          >
                            {relatedTerm}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          How to Use This Glossary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <ul className="space-y-2">
            <li>• Start with "Basics" if you're new to AI</li>
            <li>• Use simple explanations when talking with kids</li>
            <li>• Click on related terms to explore connections</li>
          </ul>
          <ul className="space-y-2">
            <li>• Read parent tips for conversation guidance</li>
            <li>• Use real examples to make concepts relatable</li>
            <li>• Don't worry about understanding everything at once</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIGlossary;