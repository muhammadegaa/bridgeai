import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { journalService } from '../services/journalService';
import { aiService } from '../services/aiService';
import type { JournalEntry } from '../services/journalService';
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
  Trash2,
  Sparkles,
  Lightbulb,
  TrendingUp,
  Tag
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
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryTopics, setEntryTopics] = useState<string[]>([]);
  const [loadingEntryAnalysis, setLoadingEntryAnalysis] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  // Realistic family journal entries for AI learning journey
  const mockEntries: JournalEntry[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Sarah (Mom)',
      userRole: 'parent',
      title: 'Our First AI Conversation',
      content: 'Today we talked about what AI means. Emma was fascinated to learn that her favorite video app uses AI to recommend videos. She asked great questions about how computers can "learn" things. I think starting with examples she already uses was a great approach. She seemed less intimidated when we connected it to things she knows.',
      isShared: true,
      tags: ['first-time', 'basics', 'success'],
      promptId: '1',
      promptTitle: 'What is Artificial Intelligence?',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      likes: ['user2', 'user3'],
      comments: [
        {
          id: 'c1',
          userId: 'user2',
          userName: 'Emma',
          content: 'I loved learning about this! Can we talk about how AI makes art next?',
          createdAt: new Date('2024-01-15')
        }
      ]
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Emma',
      userRole: 'child',
      title: 'AI is Everywhere!',
      content: 'I never realized how much AI is around us! Mom showed me that even my games use AI. The characters that fight against me are using AI to make decisions. It\'s like they\'re thinking, but not really thinking like humans do. That\'s so cool and weird at the same time. Now I want to know how they make the NPCs seem so smart!',
      isShared: true,
      tags: ['discovery', 'games', 'realization'],
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
      likes: ['user1', 'user3'],
      comments: [
        {
          id: 'c3',
          userId: 'user3',
          userName: 'Dad',
          content: 'That\'s a great observation! Maybe we can explore game AI in our next conversation.',
          createdAt: new Date('2024-01-16')
        }
      ]
    },
    {
      id: '3',
      userId: 'user1',
      userName: 'Sarah (Mom)',
      userRole: 'parent',
      title: 'Privacy Discussion - Mixed Results',
      content: 'We had a talk about AI and privacy today. Emma was initially worried that AI "knows everything" about her. I explained how she has control over what information she shares. We went through her phone settings together and she felt more empowered. However, I realized I need to better explain the trade-offs - convenience vs privacy. She\'s still confused about why companies want our data.',
      isShared: true,
      tags: ['privacy', 'empowerment', 'settings', 'follow-up-needed'],
      promptId: '3',
      promptTitle: 'AI and Privacy',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18'),
      likes: ['user3'],
      comments: [
        {
          id: 'c4',
          userId: 'user3',
          userName: 'Dad',
          content: 'Maybe we can use the analogy of sharing toys - sometimes you share to get something back, but you choose what and with whom.',
          createdAt: new Date('2024-01-18')
        }
      ]
    },
    {
      id: '4',
      userId: 'user3',
      userName: 'Dad',
      userRole: 'parent',
      title: 'Bias Discussion Success',
      content: 'Had an amazing conversation with both kids about AI bias using the hiring example. They immediately understood how unfair it would be if AI made decisions based on incomplete information. Emma said "that\'s like judging a book by its cover!" Perfect analogy. Alex was quieter but asked thoughtful questions about who decides what\'s fair. They\'re both more aware now of questioning technology.',
      isShared: true,
      tags: ['bias', 'fairness', 'critical-thinking', 'breakthrough'],
      promptId: '6',
      promptTitle: 'Bias in AI Systems',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      likes: ['user1', 'user2'],
      comments: [
        {
          id: 'c2',
          userId: 'user1',
          userName: 'Sarah (Mom)',
          content: 'Great job! I love Emma\'s book analogy - she really gets it. Alex\'s question about fairness was so insightful.',
          createdAt: new Date('2024-01-20')
        }
      ]
    },
    {
      id: '5',
      userId: 'user4',
      userName: 'Alex',
      userRole: 'child',
      title: 'Machine Learning is Like School?',
      content: 'Today I finally understood machine learning! Dad explained it like how I get better at math by practicing lots of problems. The computer gets better at recognizing things by seeing lots of examples. But I\'m confused - if I study wrong answers, I learn wrong things. What happens if the computer studies wrong examples? Does it learn wrong things too?',
      isShared: true,
      tags: ['machine-learning', 'understanding', 'questions'],
      promptId: '7',
      promptTitle: 'How Does Machine Learning Work?',
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22'),
      likes: ['user1', 'user3'],
      comments: [
        {
          id: 'c5',
          userId: 'user1',
          userName: 'Sarah (Mom)',
          content: 'That\'s such a smart question! Yes, bad examples can teach AI the wrong things. That\'s why it\'s so important to be careful about training data.',
          createdAt: new Date('2024-01-22')
        }
      ]
    },
    {
      id: '6',
      userId: 'user1',
      userName: 'Sarah (Mom)',
      userRole: 'parent',
      title: 'Voice Assistant Experiment',
      content: 'We spent time today experimenting with our voice assistant to understand how it works. The kids tried different accents, spoke very fast, and even tried to confuse it with nonsense words. Emma noticed it got better at understanding her voice over time. Alex was fascinated by how it could translate languages instantly. Great hands-on learning experience, though they now want to know EVERYTHING about how it processes speech!',
      isShared: true,
      tags: ['voice-assistants', 'hands-on', 'experimentation', 'natural-language'],
      promptId: '4',
      promptTitle: 'How Voice Assistants Work',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      likes: ['user2', 'user3', 'user4'],
      comments: [
        {
          id: 'c6',
          userId: 'user2',
          userName: 'Emma',
          content: 'It was so fun! I want to try teaching it new words tomorrow.',
          createdAt: new Date('2024-01-25')
        }
      ]
    },
    {
      id: '7',
      userId: 'user3',
      userName: 'Dad',
      userRole: 'parent',
      title: 'Emotional Reactions to AI Art',
      content: 'Showed the kids AI-generated artwork today and got unexpected reactions. Emma was amazed and wants to try creating some herself. Alex was upset and said "that\'s not fair to real artists." Led to a deep discussion about creativity, human expression, and what makes art valuable. I think Alex is grappling with some big concepts about authenticity. Need to revisit this topic and validate his concerns while exploring the possibilities.',
      isShared: true,
      tags: ['creativity', 'art', 'emotions', 'ethics', 'different-perspectives'],
      promptId: '5',
      promptTitle: 'AI in Creative Fields',
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-01-28'),
      likes: ['user1'],
      comments: [
        {
          id: 'c7',
          userId: 'user1',
          userName: 'Sarah (Mom)',
          content: 'Alex\'s reaction shows he\'s really thinking deeply about this. Maybe we can explore how AI might help artists rather than replace them?',
          createdAt: new Date('2024-01-28')
        }
      ]
    },
    {
      id: '8',
      userId: 'user2',
      userName: 'Emma',
      userRole: 'child',
      title: 'AI Helping Climate Change?',
      content: 'Today we learned about how AI can help the environment! I didn\'t know computers could help save polar bears. Dad showed me how AI helps predict weather better and makes buildings use less energy. I want to learn more about this because I care about animals and the planet. Can AI help clean the oceans too? I have so many ideas now!',
      isShared: true,
      tags: ['environment', 'climate', 'solutions', 'motivation', 'future-career'],
      promptId: '9',
      promptTitle: 'AI and Climate Change',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      likes: ['user1', 'user3', 'user4'],
      comments: [
        {
          id: 'c8',
          userId: 'user4',
          userName: 'Alex',
          content: 'That\'s cool Emma! Maybe you could study environmental science and AI when you\'re older.',
          createdAt: new Date('2024-02-01')
        }
      ]
    },
    {
      id: '9',
      userId: 'user1',
      userName: 'Sarah (Mom)',
      userRole: 'parent',
      title: 'Recommendation Algorithms Reality Check',
      content: 'Had an eye-opening discussion about recommendation systems today. Started by looking at Emma\'s YouTube recommendations and Alex\'s music app. They quickly realized how these systems create "bubbles" - Emma mostly sees dance videos, Alex gets only rock music. We experimented by watching different types of content and saw how recommendations changed. Both kids now understand they need to actively seek diverse content. Planning to set up "exploration time" where they deliberately try new things.',
      isShared: true,
      tags: ['recommendations', 'algorithms', 'diversity', 'media-literacy', 'practical-changes'],
      promptId: '13',
      promptTitle: 'Recommendation Systems',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05'),
      likes: ['user3', 'user4'],
      comments: [
        {
          id: 'c9',
          userId: 'user3',
          userName: 'Dad',
          content: 'Great idea about exploration time! I think this applies to news and information too, not just entertainment.',
          createdAt: new Date('2024-02-05')
        }
      ]
    },
    {
      id: '10',
      userId: 'user4',
      userName: 'Alex',
      userRole: 'child',
      title: 'Future Jobs and AI - I\'m Worried',
      content: 'We talked about jobs and AI today and honestly, I\'m kind of scared. What if AI can do everything by the time I\'m an adult? Mom and Dad said AI will create new jobs too, but I don\'t really understand what those would be. They keep saying I should focus on creativity and critical thinking, but what if AI gets good at those too? I know I shouldn\'t worry too much, but it\'s hard not to think about it.',
      isShared: true,
      tags: ['future', 'careers', 'anxiety', 'uncertainty', 'honest-feelings'],
      promptId: '16',
      promptTitle: 'The Future of Work with AI',
      createdAt: new Date('2024-02-08'),
      updatedAt: new Date('2024-02-08'),
      likes: ['user1', 'user2', 'user3'],
      comments: [
        {
          id: 'c10',
          userId: 'user1',
          userName: 'Sarah (Mom)',
          content: 'Your feelings are completely valid, Alex. These are big questions that even adults are thinking about. Let\'s explore this more together.',
          createdAt: new Date('2024-02-08')
        },
        {
          id: 'c11',
          userId: 'user2',
          userName: 'Emma',
          content: 'I feel worried sometimes too. But maybe we can learn to work WITH AI instead of being replaced by it?',
          createdAt: new Date('2024-02-08')
        }
      ]
    },
    {
      id: '11',
      userId: 'user3',
      userName: 'Dad',
      userRole: 'parent',
      title: 'Chatbot Conversation Analysis',
      content: 'We spent time today talking to different chatbots and analyzing their responses. The kids quickly learned to spot when a chatbot didn\'t really understand context or gave generic answers. Emma tried to get the chatbot to be creative and was disappointed by the repetitive results. Alex focused on testing its logical reasoning and found several flaws. Both kids now have a better sense of AI limitations and are less likely to be fooled by sophisticated-sounding but empty responses.',
      isShared: true,
      tags: ['chatbots', 'critical-analysis', 'limitations', 'media-literacy'],
      promptId: '10',
      promptTitle: 'Chatbots and Conversational AI',
      createdAt: new Date('2024-02-12'),
      updatedAt: new Date('2024-02-12'),
      likes: ['user1', 'user2'],
      comments: [
        {
          id: 'c12',
          userId: 'user1',
          userName: 'Sarah (Mom)',
          content: 'This kind of hands-on testing is so valuable. They\'re developing real critical thinking skills.',
          createdAt: new Date('2024-02-12')
        }
      ]
    },
    {
      id: '12',
      userId: 'user2',
      userName: 'Emma',
      userRole: 'child',
      title: 'AI Translation Magic',
      content: 'Today we used translation apps to talk to my pen pal in France! It was so cool to write in English and have it turn into French instantly. But we also noticed some funny mistakes - it translated "it\'s raining cats and dogs" literally and my pen pal was very confused! Mom explained that idioms and cultural expressions are hard for AI. Now I\'m curious about what other things are difficult for AI to understand about human language.',
      isShared: true,
      tags: ['translation', 'language', 'cultural-understanding', 'limitations'],
      promptId: '18',
      promptTitle: 'Language Translation and AI',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
      likes: ['user1', 'user3', 'user4'],
      comments: [
        {
          id: 'c13',
          userId: 'user4',
          userName: 'Alex',
          content: 'That\'s hilarious about the cats and dogs! I bet there are lots of sayings that would confuse AI.',
          createdAt: new Date('2024-02-15')
        }
      ]
    }
  ];

  // Use mock data if no real entries exist (for demo purposes)
  const displayEntries = journalEntries.length > 0 ? journalEntries : mockEntries;
  
  const filteredEntries = displayEntries.filter(entry => {
    const matchesFilter = 
      selectedFilter === 'all' || 
      (selectedFilter === 'mine' && entry.userId === userProfile?.id) ||
      (selectedFilter === 'family' && entry.isShared);
    
    const matchesSearch = searchTerm === '' ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const analyzeEntryForTopics = async (content: string) => {
    if (!userProfile || !content.trim()) {
      setSuggestedTopics([]);
      return;
    }
    
    setLoadingTopics(true);
    try {
      const userAge = userProfile.role === 'child' ? 12 : 35;
      const topics = await aiService.analyzeJournalForTopics(
        content,
        userAge,
        userProfile.id
      );
      setSuggestedTopics(topics);
    } catch (error) {
      console.error('Error analyzing entry for topics:', error);
      setSuggestedTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const analyzeExistingEntry = async (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setLoadingEntryAnalysis(true);
    
    try {
      if (userProfile) {
        const userAge = userProfile.role === 'child' ? 12 : 35;
        const topics = await aiService.analyzeJournalForTopics(
          entry.content,
          userAge,
          userProfile.id
        );
        setEntryTopics(topics);
      }
    } catch (error) {
      console.error('Error analyzing entry:', error);
      setEntryTopics([]);
    } finally {
      setLoadingEntryAnalysis(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!userProfile || !newEntry.title || !newEntry.content) return;
    
    try {
      // Combine manual tags with AI-suggested topics
      const allTags = [...new Set([...newEntry.tags, ...suggestedTopics])];
      
      await journalService.createEntry({
        userId: userProfile.id,
        userName: userProfile.displayName,
        userRole: userProfile.role,
        title: newEntry.title,
        content: newEntry.content,
        isShared: newEntry.isShared,
        tags: allTags
      });
      
      setShowNewEntryModal(false);
      setNewEntry({ title: '', content: '', isShared: true, tags: [] });
      setSuggestedTopics([]);
      
      // Reload entries to show the new one
      await loadEntries();
    } catch (error) {
      console.error('Error creating journal entry:', error);
      // TODO: Show error message to user
    }
  };

  // Debounced topic analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newEntry.content.length > 50) {
        analyzeEntryForTopics(newEntry.content);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [newEntry.content, userProfile]);

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
              
              {entry.userId === userProfile?.id && (
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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
                <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
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
                <button 
                  onClick={() => analyzeExistingEntry(entry)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-purple-500 transition-colors"
                  title="Get AI topic suggestions"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm">AI Insights</span>
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
                
                {/* AI-Suggested Topics */}
                {(loadingTopics || suggestedTopics.length > 0) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                      AI-Suggested Topics
                    </label>
                    {loadingTopics ? (
                      <div className="flex items-center py-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        <span className="text-sm text-gray-600">Analyzing your entry...</span>
                      </div>
                    ) : (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-800 mb-3">
                          Based on your writing, here are some AI topics you might want to explore:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTopics.map((topic, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-300"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {topic}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          These topics will be automatically added as tags to help you track your learning journey.
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

      {/* Entry Analysis Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
                  AI Analysis: {selectedEntry.title}
                </h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Original Entry</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedEntry.content}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Suggested AI Topics to Explore
                  </h3>
                  {loadingEntryAnalysis ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                      <span className="text-gray-600">Analyzing entry for learning opportunities...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entryTopics.map((topic, index) => (
                        <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-medium text-gray-900 mb-2">{topic}</h4>
                          <p className="text-sm text-gray-600">
                            This topic builds on the insights you've shared and could lead to fascinating conversations.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Next Steps
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Visit the Conversation Prompts page to explore these topics</li>
                    <li>• Check the AI Glossary for any unfamiliar terms</li>
                    <li>• Share your discoveries with family members</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="btn-primary flex-1"
                >
                  Explore These Topics
                </button>
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
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