import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import { Search, BookOpen, Lightbulb, Users, Shield, Cpu, Brain, Sparkles, RefreshCw } from 'lucide-react';

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
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<AITerm | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{
    simple: string;
    detailed: string;
    examples: string[];
    relatedTerms?: string[];
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Comprehensive AI glossary with parent-friendly explanations
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
    },
    {
      id: '9',
      term: 'Deep Learning',
      simpleExplanation: 'A more advanced type of machine learning that uses many layers of artificial neurons, like a very complex brain network.',
      technicalExplanation: 'A subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data.',
      examples: [
        'Advanced image recognition in medical scans',
        'Language models that can write stories',
        'Self-driving car vision systems'
      ],
      relatedTerms: ['Neural Networks', 'Machine Learning', 'Artificial Intelligence'],
      category: 'concepts',
      parentNotes: 'Explain as a more sophisticated version of machine learning, like adding more layers to understanding.'
    },
    {
      id: '10',
      term: 'Natural Language Processing (NLP)',
      simpleExplanation: 'Teaching computers to understand and work with human language, like reading, writing, and speaking.',
      technicalExplanation: 'A branch of AI that helps computers understand, interpret, and generate human language in a valuable way.',
      examples: [
        'Language translation apps',
        'Voice assistants understanding commands',
        'Autocorrect and grammar checking tools'
      ],
      relatedTerms: ['Chatbot', 'Language Models', 'Speech Recognition'],
      category: 'concepts',
      parentNotes: 'Start with familiar examples like autocorrect or translation apps they might use.'
    },
    {
      id: '11',
      term: 'Computer Vision',
      simpleExplanation: 'Teaching computers to "see" and understand images and videos, like recognizing objects or faces.',
      technicalExplanation: 'A field of AI that trains computers to interpret and make decisions based on visual data from the world.',
      examples: [
        'Photo apps automatically organizing pictures by people',
        'Medical imaging helping doctors diagnose diseases',
        'Security cameras detecting suspicious activity'
      ],
      relatedTerms: ['Image Recognition', 'Facial Recognition', 'Pattern Recognition'],
      category: 'concepts',
      parentNotes: 'Compare to human vision - how we recognize objects, people, and understand scenes.'
    },
    {
      id: '12',
      term: 'Recommendation System',
      simpleExplanation: 'AI that suggests things you might like based on your past choices and behavior.',
      technicalExplanation: 'Algorithms that analyze user data and behavior to predict and suggest relevant content, products, or services.',
      examples: [
        'Netflix suggesting movies based on what you\'ve watched',
        'Spotify creating personalized playlists',
        'Online stores recommending products you might buy'
      ],
      relatedTerms: ['Personalization', 'User Data', 'Algorithms'],
      category: 'tools',
      parentNotes: 'Discuss both the convenience and the potential for creating "filter bubbles" that limit exposure to new ideas.'
    },
    {
      id: '13',
      term: 'Supervised Learning',
      simpleExplanation: 'Teaching AI by showing it examples where we already know the right answer, like teaching with answer keys.',
      technicalExplanation: 'A machine learning approach where algorithms learn from labeled training data to make predictions on new, unseen data.',
      examples: [
        'Teaching AI to recognize cats by showing labeled cat photos',
        'Training email filters with examples of spam and not-spam',
        'Medical AI learning from diagnosed patient cases'
      ],
      relatedTerms: ['Training Data', 'Machine Learning', 'Labels'],
      category: 'concepts',
      parentNotes: 'Compare to learning with a teacher who provides correct answers and feedback.'
    },
    {
      id: '14',
      term: 'Unsupervised Learning',
      simpleExplanation: 'AI learning to find patterns in data without being told what to look for, like discovering hidden connections.',
      technicalExplanation: 'Machine learning that finds hidden patterns in data without labeled examples or specific guidance about what to find.',
      examples: [
        'Customer grouping based on shopping behavior',
        'Finding unusual patterns in network traffic',
        'Discovering topics in large collections of documents'
      ],
      relatedTerms: ['Pattern Recognition', 'Data Mining', 'Clustering'],
      category: 'concepts',
      parentNotes: 'Explain as detective work - finding patterns and clues without knowing what mystery you\'re solving.'
    },
    {
      id: '15',
      term: 'Reinforcement Learning',
      simpleExplanation: 'AI learning through trial and error, getting rewards for good choices and penalties for bad ones, like training a pet.',
      technicalExplanation: 'A learning method where an agent learns to make decisions by taking actions in an environment and receiving feedback in the form of rewards or penalties.',
      examples: [
        'AI learning to play chess by playing many games',
        'Self-driving cars learning from driving simulations',
        'Game AI learning strategies through gameplay'
      ],
      relatedTerms: ['Trial and Error', 'Rewards', 'Game AI'],
      category: 'concepts',
      parentNotes: 'Use the analogy of learning to ride a bike - you get better through practice and learning from mistakes.'
    },
    {
      id: '16',
      term: 'Generative AI',
      simpleExplanation: 'AI that can create new content like text, images, or music, rather than just analyzing existing content.',
      technicalExplanation: 'AI systems that can generate new, original content by learning patterns from existing data and creating similar but novel outputs.',
      examples: [
        'AI writing assistants that help compose text',
        'AI art generators creating original images',
        'AI music composers creating new songs'
      ],
      relatedTerms: ['Content Creation', 'Large Language Models', 'Creative AI'],
      category: 'tools',
      parentNotes: 'Discuss both the creative possibilities and questions about originality and human creativity.'
    },
    {
      id: '17',
      term: 'Large Language Model (LLM)',
      simpleExplanation: 'Very sophisticated AI trained on massive amounts of text to understand and generate human-like language.',
      technicalExplanation: 'Neural networks trained on vast amounts of text data to understand context, generate coherent text, and perform various language tasks.',
      examples: [
        'ChatGPT answering questions and having conversations',
        'AI writing assistants helping with emails and documents',
        'Language models powering smart search features'
      ],
      relatedTerms: ['Natural Language Processing', 'Generative AI', 'Text Generation'],
      category: 'tools',
      parentNotes: 'Explain that these models have read huge amounts of text but don\'t truly "understand" like humans do.'
    },
    {
      id: '18',
      term: 'Facial Recognition',
      simpleExplanation: 'Technology that can identify people by analyzing the unique features of their faces.',
      technicalExplanation: 'Biometric technology that maps facial features from photos or videos and compares them against databases to identify individuals.',
      examples: [
        'Unlocking your phone with Face ID',
        'Photo apps automatically tagging people',
        'Airport security systems identifying travelers'
      ],
      relatedTerms: ['Computer Vision', 'Biometrics', 'Privacy'],
      category: 'tools',
      parentNotes: 'Discuss both the convenience and privacy implications, helping kids understand when it\'s appropriate.'
    },
    {
      id: '19',
      term: 'Automation',
      simpleExplanation: 'Using AI and technology to do tasks automatically without human intervention.',
      technicalExplanation: 'The use of technology and AI to perform tasks or processes with minimal human intervention.',
      examples: [
        'Factory robots assembling products',
        'Automated customer service responses',
        'Smart home systems adjusting temperature automatically'
      ],
      relatedTerms: ['Robotics', 'Efficiency', 'Job Impact'],
      category: 'concepts',
      parentNotes: 'Discuss both the benefits of automation and its impact on different types of work.'
    },
    {
      id: '20',
      term: 'Ethics in AI',
      simpleExplanation: 'The study of what\'s right and wrong when creating and using AI systems.',
      technicalExplanation: 'The branch of ethics that examines moral implications of artificial intelligence development and deployment.',
      examples: [
        'Ensuring AI systems treat all people fairly',
        'Deciding when AI should make important decisions',
        'Protecting people\'s privacy when using AI'
      ],
      relatedTerms: ['Bias', 'Fairness', 'Responsibility'],
      category: 'ethics',
      parentNotes: 'Emphasize that humans are responsible for making sure AI is used in good and fair ways.'
    },
    {
      id: '21',
      term: 'Deepfake',
      simpleExplanation: 'AI-generated fake videos or images that look very realistic but show things that never actually happened.',
      technicalExplanation: 'Synthetic media created using deep learning techniques to replace a person\'s likeness in existing images or videos.',
      examples: [
        'Fake videos of celebrities saying things they never said',
        'Historical figures brought to life in documentaries',
        'Face-swapping apps for entertainment'
      ],
      relatedTerms: ['Synthetic Media', 'Misinformation', 'Media Literacy'],
      category: 'safety',
      parentNotes: 'Teach critical thinking about media and how to spot potentially fake content online.'
    },
    {
      id: '22',
      term: 'Data Mining',
      simpleExplanation: 'Searching through large amounts of data to find useful patterns and information.',
      technicalExplanation: 'The process of discovering patterns, correlations, and insights from large datasets using statistical and machine learning techniques.',
      examples: [
        'Stores analyzing purchase data to understand customer behavior',
        'Healthcare systems finding patterns in patient data',
        'Social media platforms understanding user engagement'
      ],
      relatedTerms: ['Big Data', 'Pattern Recognition', 'Analytics'],
      category: 'concepts',
      parentNotes: 'Compare to being a detective looking for clues in a large collection of evidence.'
    },
    {
      id: '23',
      term: 'Internet of Things (IoT)',
      simpleExplanation: 'Everyday objects connected to the internet that can collect data and communicate with other devices.',
      technicalExplanation: 'A network of physical devices embedded with sensors and software that can collect and exchange data over the internet.',
      examples: [
        'Smart thermostats that learn your schedule',
        'Fitness trackers monitoring your activity',
        'Smart speakers responding to voice commands'
      ],
      relatedTerms: ['Smart Devices', 'Sensors', 'Connected Home'],
      category: 'tools',
      parentNotes: 'Discuss the convenience versus privacy trade-offs of having connected devices in the home.'
    },
    {
      id: '24',
      term: 'Edge Computing',
      simpleExplanation: 'Processing data close to where it\'s created (like in your phone) instead of sending it far away to big computers.',
      technicalExplanation: 'Computing that brings data processing closer to the source of data generation rather than relying on centralized cloud servers.',
      examples: [
        'Your phone processing voice commands locally',
        'Smart cameras analyzing footage without internet',
        'Self-driving cars making split-second decisions'
      ],
      relatedTerms: ['Cloud Computing', 'Local Processing', 'Latency'],
      category: 'concepts',
      parentNotes: 'Explain as doing work locally versus sending it away - faster and more private.'
    },
    {
      id: '25',
      term: 'Artificial General Intelligence (AGI)',
      simpleExplanation: 'Hypothetical AI that could understand and learn any task that humans can, not just specific jobs.',
      technicalExplanation: 'Theoretical AI that possesses the ability to understand, learn, and apply intelligence across a wide range of tasks at a level comparable to human cognitive abilities.',
      examples: [
        'AI that could be a doctor, teacher, and artist equally well',
        'AI that could learn new skills as easily as humans',
        'AI that could adapt to completely new situations'
      ],
      relatedTerms: ['Human-level AI', 'Superintelligence', 'AI Safety'],
      category: 'concepts',
      parentNotes: 'Explain this is still theoretical and much more advanced than current AI, which is specialized for specific tasks.'
    },
    {
      id: '26',
      term: 'Quantum Computing',
      simpleExplanation: 'A completely different type of computer that could potentially solve certain problems much faster than regular computers.',
      technicalExplanation: 'Computing technology that uses quantum mechanical phenomena to process information in ways that could exponentially speed up certain calculations.',
      examples: [
        'Breaking encryption codes very quickly',
        'Simulating complex molecular interactions',
        'Optimizing very complicated logistics problems'
      ],
      relatedTerms: ['Quantum Algorithms', 'Cryptography', 'Superposition'],
      category: 'concepts',
      parentNotes: 'Keep this simple - it\'s a different way of computing that\'s still being developed and might help AI in the future.'
    },
    {
      id: '27',
      term: 'Algorithmic Transparency',
      simpleExplanation: 'Making AI systems understandable so people can see how they make decisions.',
      technicalExplanation: 'The principle that AI systems should be explainable and their decision-making processes should be open to scrutiny.',
      examples: [
        'Explaining why a loan application was rejected',
        'Showing how medical AI reached a diagnosis',
        'Revealing what factors influence social media feeds'
      ],
      relatedTerms: ['Explainable AI', 'Accountability', 'Trust'],
      category: 'ethics',
      parentNotes: 'Emphasize the importance of understanding how AI systems that affect our lives actually work.'
    },
    {
      id: '28',
      term: 'Sentiment Analysis',
      simpleExplanation: 'AI that can understand emotions and feelings in text, like knowing if a review is positive or negative.',
      technicalExplanation: 'Natural language processing technique that determines emotional tone, opinion, or attitude expressed in text.',
      examples: [
        'Social media platforms detecting cyberbullying',
        'Companies analyzing customer feedback',
        'Mental health apps monitoring emotional well-being'
      ],
      relatedTerms: ['Natural Language Processing', 'Emotion Recognition', 'Text Analysis'],
      category: 'tools',
      parentNotes: 'Discuss how AI can be helpful for understanding emotions but might miss important context that humans would catch.'
    },
    {
      id: '29',
      term: 'Adversarial AI',
      simpleExplanation: 'AI systems designed to fool or attack other AI systems, like creating puzzles that trick computer vision.',
      technicalExplanation: 'Techniques that exploit vulnerabilities in AI systems by crafting inputs designed to cause misclassification or malfunction.',
      examples: [
        'Images that look normal to humans but fool AI',
        'Audio that sounds like one thing but AI hears another',
        'Attacks on self-driving car vision systems'
      ],
      relatedTerms: ['AI Security', 'Robustness', 'Cybersecurity'],
      category: 'safety',
      parentNotes: 'Explain that understanding AI weaknesses helps us build better, safer systems.'
    },
    {
      id: '30',
      term: 'Synthetic Data',
      simpleExplanation: 'Artificial data created by computers that looks like real data but doesn\'t come from actual people or events.',
      technicalExplanation: 'Artificially generated data that maintains statistical properties of real data without containing actual personal information.',
      examples: [
        'Fake patient records for medical AI training',
        'Generated images for computer vision research',
        'Simulated sensor data for testing autonomous vehicles'
      ],
      relatedTerms: ['Data Generation', 'Privacy Protection', 'Training Data'],
      category: 'concepts',
      parentNotes: 'Explain how this can protect privacy while still allowing AI to learn effectively.'
    },
    {
      id: '31',
      term: 'Federated Learning',
      simpleExplanation: 'A way for AI to learn from many devices without collecting personal data in one place.',
      technicalExplanation: 'A machine learning approach where models are trained across decentralized data sources without centralizing the data.',
      examples: [
        'Your phone helping improve voice recognition without sharing your voice',
        'Hospitals improving AI without sharing patient data',
        'Smart keyboards learning while keeping your typing private'
      ],
      relatedTerms: ['Privacy Preservation', 'Distributed Learning', 'Data Security'],
      category: 'concepts',
      parentNotes: 'Emphasize how this allows AI improvement while better protecting personal information.'
    },
    {
      id: '32',
      term: 'Transfer Learning',
      simpleExplanation: 'Using knowledge an AI learned from one task to help it learn a different but related task faster.',
      technicalExplanation: 'Machine learning technique where a model trained on one task is adapted for a related task, leveraging previously learned knowledge.',
      examples: [
        'AI that learned to recognize cats helping learn to recognize dogs',
        'Language AI trained in English helping learn other languages',
        'Medical AI trained on X-rays helping with MRI analysis'
      ],
      relatedTerms: ['Knowledge Reuse', 'Model Adaptation', 'Efficiency'],
      category: 'concepts',
      parentNotes: 'Compare to how learning to play piano might help you learn other musical instruments.'
    },
    {
      id: '33',
      term: 'Robotic Process Automation (RPA)',
      simpleExplanation: 'Software robots that can do repetitive computer tasks that humans usually do.',
      technicalExplanation: 'Technology that uses software robots to automate routine, rule-based digital tasks typically performed by human workers.',
      examples: [
        'Automatically processing insurance claims',
        'Moving data between different computer systems',
        'Generating reports from spreadsheets'
      ],
      relatedTerms: ['Automation', 'Workflow', 'Digital Workers'],
      category: 'tools',
      parentNotes: 'Explain how this can free humans from boring, repetitive work to focus on more creative and important tasks.'
    },
    {
      id: '34',
      term: 'Ensemble Learning',
      simpleExplanation: 'Combining multiple AI systems to make better decisions together, like asking several experts for advice.',
      technicalExplanation: 'Machine learning technique that combines multiple models to create a stronger, more accurate predictor than any individual model.',
      examples: [
        'Medical diagnosis using multiple AI specialists',
        'Weather prediction combining different forecasting models',
        'Financial fraud detection using various detection methods'
      ],
      relatedTerms: ['Model Combination', 'Voting Systems', 'Accuracy Improvement'],
      category: 'concepts',
      parentNotes: 'Use the analogy of getting second opinions from doctors or asking multiple friends for advice.'
    },
    {
      id: '35',
      term: 'Explainable AI (XAI)',
      simpleExplanation: 'AI systems designed to explain their reasoning in ways humans can understand.',
      technicalExplanation: 'AI systems designed to provide clear, interpretable explanations for their decisions and predictions to human users.',
      examples: [
        'Medical AI explaining why it thinks a scan shows a problem',
        'Loan approval systems listing factors that influenced decisions',
        'AI tutors explaining why an answer is correct or incorrect'
      ],
      relatedTerms: ['Transparency', 'Interpretability', 'Trust'],
      category: 'ethics',
      parentNotes: 'Emphasize the importance of understanding AI decisions, especially in important areas like healthcare and education.'
    },
    {
      id: '36',
      term: 'Swarm Intelligence',
      simpleExplanation: 'AI inspired by how groups of simple creatures like bees or ants work together to solve complex problems.',
      technicalExplanation: 'Computational approach inspired by collective behavior of decentralized, self-organized systems like insect colonies.',
      examples: [
        'Delivery route optimization inspired by ant colonies',
        'Distributed problem solving like bee swarm decision-making',
        'Coordinated robot teams working together'
      ],
      relatedTerms: ['Collective Intelligence', 'Distributed Systems', 'Bio-inspired Computing'],
      category: 'concepts',
      parentNotes: 'Use examples from nature that kids can relate to, like how ants find the best path to food.'
    },
    {
      id: '37',
      term: 'AI Governance',
      simpleExplanation: 'Rules and policies that guide how AI should be developed and used responsibly.',
      technicalExplanation: 'Frameworks, policies, and practices that ensure AI systems are developed and deployed ethically, safely, and in alignment with societal values.',
      examples: [
        'Government regulations for self-driving cars',
        'Company policies for AI hiring tools',
        'International agreements on AI safety'
      ],
      relatedTerms: ['AI Policy', 'Regulation', 'Responsible AI'],
      category: 'ethics',
      parentNotes: 'Explain that just like we have rules for driving cars, we need rules for using AI safely and fairly.'
    },
    {
      id: '38',
      term: 'Cognitive Computing',
      simpleExplanation: 'AI systems designed to work alongside humans by understanding and reasoning more like people do.',
      technicalExplanation: 'Computing systems that simulate human thought processes to enhance human decision-making through natural interaction.',
      examples: [
        'AI assistants that understand context and nuance',
        'Medical AI that considers patient history and symptoms',
        'Educational systems that adapt to how students learn'
      ],
      relatedTerms: ['Human-AI Collaboration', 'Natural Interaction', 'Augmented Intelligence'],
      category: 'concepts',
      parentNotes: 'Emphasize collaboration rather than replacement - AI helping humans think and decide better.'
    },
    {
      id: '39',
      term: 'Multimodal AI',
      simpleExplanation: 'AI that can understand and work with different types of information like text, images, and sounds all together.',
      technicalExplanation: 'AI systems that can process and integrate multiple types of data inputs such as text, images, audio, and video simultaneously.',
      examples: [
        'AI that can describe what\'s happening in a video',
        'Systems that answer questions about images',
        'Virtual assistants that understand speech and gestures'
      ],
      relatedTerms: ['Cross-modal Learning', 'Fusion Systems', 'Integrated AI'],
      category: 'concepts',
      parentNotes: 'Compare to how humans naturally combine seeing, hearing, and reading to understand the world.'
    },
    {
      id: '40',
      term: 'AI Alignment',
      simpleExplanation: 'Making sure AI systems do what humans actually want them to do, not just what we think we told them to do.',
      technicalExplanation: 'The challenge of ensuring AI systems pursue goals and behave in ways that are beneficial to and aligned with human values and intentions.',
      examples: [
        'Ensuring a cleaning robot doesn\'t break valuable items to clean faster',
        'Making sure AI recommends truly helpful content, not just engaging content',
        'Designing AI assistants that prioritize user well-being over task completion'
      ],
      relatedTerms: ['AI Safety', 'Value Alignment', 'Goal Specification'],
      category: 'safety',
      parentNotes: 'Explain that this is about making sure AI helps us in the ways we actually want, considering the full picture of human values.'
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

  const getAIExplanation = async (term: AITerm) => {
    if (!userProfile) return;
    
    setLoadingAI(true);
    try {
      const userAge = userProfile.role === 'child' ? 12 : 35;
      const context = `Learning about AI with family`;
      
      const explanation = await aiService.explainAITerm(
        term.term,
        userAge,
        context,
        userProfile.id
      );
      
      setAiExplanation(explanation);
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      setAiExplanation(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleTermClick = (term: AITerm) => {
    setSelectedTerm(term);
    setAiExplanation(null);
    if (userProfile) {
      getAIExplanation(term);
    }
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
              onClick={() => handleTermClick(term)}
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
                {/* AI-Powered Explanation */}
                {userProfile && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                        AI-Personalized Explanation
                      </h3>
                      <button
                        onClick={() => getAIExplanation(selectedTerm)}
                        disabled={loadingAI}
                        className="p-2 text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50"
                        title="Get fresh AI explanation"
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingAI ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    
                    {loadingAI ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-2"></div>
                        <span className="text-gray-600">Generating personalized explanation...</span>
                      </div>
                    ) : aiExplanation ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Simple Explanation</h4>
                          <p className="text-gray-700 bg-white p-3 rounded border">{aiExplanation.simple}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">More Details</h4>
                          <p className="text-gray-700 bg-white p-3 rounded border">{aiExplanation.detailed}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Personalized Examples</h4>
                          <div className="space-y-2">
                            {aiExplanation.examples.map((example, index) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <span className="text-gray-700">{example}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {aiExplanation.relatedTerms && aiExplanation.relatedTerms.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">AI-Suggested Related Terms</h4>
                            <div className="flex flex-wrap gap-2">
                              {aiExplanation.relatedTerms.map((relatedTerm, index) => {
                                const related = aiTerms.find(t => t.term === relatedTerm);
                                return (
                                  <button
                                    key={index}
                                    onClick={() => related && handleTermClick(related)}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                                  >
                                    {relatedTerm}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 italic">Click the refresh button to get an AI explanation tailored to your age and interests.</p>
                    )}
                  </div>
                )}

                {/* Original Explanations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Standard Explanation
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
                            onClick={() => related && handleTermClick(related)}
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