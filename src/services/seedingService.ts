/**
 * Data Seeding Service - Populates database with production-ready content
 */

import { databaseService } from './database';
import { 
  COLLECTIONS,
  ConversationPrompt,
  AITerm,
  SystemConfig,
  PromptContent,
  PromptMetadata,
  AITermExample
} from '../types/database';

export class SeedingService {
  private seeded = new Set<string>();

  // Main seeding orchestrator
  async seedAllData(): Promise<void> {
    console.log('Starting data seeding...');
    
    try {
      await Promise.all([
        this.seedConversationPrompts(),
        this.seedAITerms(),
        this.seedSystemConfig(),
      ]);
      
      console.log('Data seeding completed successfully');
    } catch (error) {
      console.error('Data seeding failed:', error);
      throw error;
    }
  }

  // Seed conversation prompts
  async seedConversationPrompts(): Promise<void> {
    if (this.seeded.has('prompts')) return;
    
    console.log('Seeding conversation prompts...');
    
    const prompts: Omit<ConversationPrompt, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Beginner Level Prompts
      {
        title: 'What is Artificial Intelligence?',
        description: 'Start with the basics - explore what AI really means in simple terms.',
        category: 'daily',
        ageGroups: ['8-10', '11-13', '14-16', '17-18'],
        difficulty: 'beginner',
        tags: ['basics', 'introduction', 'fundamentals'],
        estimatedTime: 15,
        content: {
          parentGuidance: 'Begin by asking what your child already knows about AI. Use everyday examples like voice assistants, recommendation systems, or smart toys. Keep the conversation light and focus on how AI helps people in daily life.',
          childQuestion: 'Can you think of any AI that you use every day without realizing it?',
          followUpQuestions: [
            'How do you think AI learns new things?',
            'What makes AI different from regular computer programs?',
            'What questions do you have about AI?',
            'Can you imagine a world without AI? What would be different?'
          ],
          resources: [
            {
              type: 'video',
              title: 'AI Explained for Kids',
              url: 'https://example.com/ai-basics-kids',
              description: 'A fun animated video explaining AI concepts',
              ageGroup: '8-10'
            }
          ],
          objectives: [
            'Understand what AI means in simple terms',
            'Identify AI in everyday life',
            'Develop curiosity about how AI works'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: 'AI in Your Smartphone',
        description: 'Discover how AI powers the apps and features you use on your phone every day.',
        category: 'daily',
        ageGroups: ['11-13', '14-16', '17-18'],
        difficulty: 'beginner',
        tags: ['smartphones', 'apps', 'daily-life', 'recognition'],
        estimatedTime: 20,
        content: {
          parentGuidance: 'Explore your child\'s phone together. Look at camera features, voice assistants, and app recommendations. Discuss how these features learn from user behavior.',
          childQuestion: 'Have you noticed how your phone seems to know what you want before you ask?',
          followUpQuestions: [
            'How does your phone recognize faces in photos?',
            'Why does your keyboard predict what you\'re typing?',
            'How does your music app know what songs you might like?',
            'What information does your phone collect to make these features work?'
          ],
          resources: [],
          objectives: [
            'Identify AI features in smartphones',
            'Understand how AI learns from user behavior',
            'Think about data collection and personalization'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Intermediate Level Prompts
      {
        title: 'AI in Social Media',
        description: 'Discuss how AI shapes what we see online and its impact on our daily lives.',
        category: 'weekly',
        ageGroups: ['14-16', '17-18'],
        difficulty: 'intermediate',
        tags: ['social-media', 'algorithms', 'ethics', 'influence'],
        estimatedTime: 25,
        content: {
          parentGuidance: 'Focus on algorithmic feeds and personalization. Discuss both benefits and potential concerns like echo chambers and misinformation. Encourage critical thinking about what they see online.',
          childQuestion: 'Have you noticed that your social media shows you things you\'re interested in? How do you think it knows?',
          followUpQuestions: [
            'How might AI algorithms influence what news and information you see?',
            'Are there any downsides to AI choosing what we see?',
            'How can we use social media more mindfully?',
            'What responsibility do social media companies have for their AI systems?'
          ],
          resources: [],
          objectives: [
            'Understand how social media algorithms work',
            'Recognize the influence of AI on information consumption',
            'Develop critical thinking about online content',
            'Consider ethical implications of algorithmic curation'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: 'AI and Privacy',
        description: 'Explore how AI uses our data and what that means for privacy.',
        category: 'weekly',
        ageGroups: ['11-13', '14-16', '17-18'],
        difficulty: 'intermediate',
        tags: ['privacy', 'data', 'ethics', 'protection'],
        estimatedTime: 20,
        content: {
          parentGuidance: 'Help your child understand data collection without creating fear. Focus on making informed choices and understanding privacy settings. Discuss the balance between convenience and privacy.',
          childQuestion: 'What information do you think apps and websites collect about us?',
          followUpQuestions: [
            'Why might companies want our data?',
            'How can we protect our privacy online?',
            'What are the benefits and risks of sharing data?',
            'How do you decide if an app is worth sharing your information with?'
          ],
          resources: [],
          objectives: [
            'Understand what data is collected and how it\'s used',
            'Learn about privacy protection strategies',
            'Make informed decisions about data sharing',
            'Balance convenience with privacy concerns'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: false
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Advanced Level Prompts
      {
        title: 'AI Bias and Fairness',
        description: 'Explore how AI systems can be biased and what we can do about it.',
        category: 'special',
        ageGroups: ['14-16', '17-18'],
        difficulty: 'advanced',
        tags: ['bias', 'fairness', 'ethics', 'discrimination'],
        estimatedTime: 30,
        content: {
          parentGuidance: 'This is a complex topic that requires careful discussion. Use real-world examples of AI bias in hiring, lending, or criminal justice. Emphasize that AI reflects human biases and the importance of diverse perspectives in AI development.',
          childQuestion: 'Do you think AI can be unfair to certain groups of people? How might this happen?',
          followUpQuestions: [
            'What are some examples of AI bias you\'ve heard about?',
            'How do you think we can make AI systems more fair?',
            'Who should be responsible for ensuring AI is unbiased?',
            'How can diverse teams help create better AI systems?'
          ],
          resources: [],
          objectives: [
            'Understand how bias enters AI systems',
            'Recognize the real-world impact of biased AI',
            'Think about solutions to AI bias',
            'Consider the importance of diverse perspectives in tech'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: false
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: 'The Future of AI Jobs',
        description: 'Discuss how AI might change the job market and what skills will be important.',
        category: 'special',
        ageGroups: ['14-16', '17-18'],
        difficulty: 'advanced',
        tags: ['future', 'jobs', 'skills', 'careers'],
        estimatedTime: 35,
        content: {
          parentGuidance: 'Focus on both challenges and opportunities. Discuss jobs that might be automated and new jobs that AI creates. Emphasize skills that remain uniquely human like creativity, empathy, and critical thinking.',
          childQuestion: 'How do you think AI will change the kinds of jobs people have in the future?',
          followUpQuestions: [
            'What jobs do you think AI could do better than humans?',
            'What skills do you think will be most important in an AI-powered world?',
            'How can people prepare for careers alongside AI?',
            'What new types of jobs might AI create?'
          ],
          resources: [],
          objectives: [
            'Consider the impact of AI on employment',
            'Identify skills that complement AI',
            'Think about career preparation in an AI world',
            'Understand both challenges and opportunities'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: false
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Fun and Engaging Prompts
      {
        title: 'AI in Video Games',
        description: 'Explore how AI creates challenging and fun gaming experiences.',
        category: 'daily',
        ageGroups: ['8-10', '11-13', '14-16'],
        difficulty: 'beginner',
        tags: ['gaming', 'entertainment', 'fun', 'npcs'],
        estimatedTime: 18,
        content: {
          parentGuidance: 'Use games your child plays as examples. Discuss how NPCs (non-player characters) behave, how games adjust difficulty, and how AI creates procedural content.',
          childQuestion: 'Have you ever wondered how video game characters know how to react to what you do?',
          followUpQuestions: [
            'How do games get harder or easier based on how well you play?',
            'What makes a game character seem smart or realistic?',
            'How might AI help create new game content?',
            'Could AI help make games more accessible for different players?'
          ],
          resources: [],
          objectives: [
            'Understand AI in game design',
            'Recognize adaptive game mechanics',
            'Think about AI\'s role in entertainment',
            'Consider AI in creating inclusive experiences'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: true
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        title: 'AI Creative Tools',
        description: 'Discover how AI is being used to create art, music, and stories.',
        category: 'weekly',
        ageGroups: ['11-13', '14-16', '17-18'],
        difficulty: 'intermediate',
        tags: ['creativity', 'art', 'music', 'writing'],
        estimatedTime: 25,
        content: {
          parentGuidance: 'Explore AI art generators, music composers, or writing assistants together. Discuss the creative process and whether AI can truly be creative or if it\'s just recombining existing ideas.',
          childQuestion: 'Do you think AI can be truly creative, or is it just copying what humans have made?',
          followUpQuestions: [
            'How might AI tools help human artists and musicians?',
            'What makes something truly original or creative?',
            'Could AI replace human creativity, or will it just be a tool?',
            'How might AI creativity affect how we value human-made art?'
          ],
          resources: [],
          objectives: [
            'Explore AI\'s role in creative processes',
            'Think about the nature of creativity',
            'Consider AI as a creative tool vs. replacement',
            'Discuss the value of human creativity'
          ]
        },
        metadata: {
          authorId: 'system',
          version: 1,
          completionCount: 0,
          averageRating: 0,
          ratingCount: 0,
          featured: false
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Create prompts in batches to avoid overwhelming the database
    for (const prompt of prompts) {
      try {
        await databaseService.create<ConversationPrompt>(
          COLLECTIONS.PROMPTS,
          prompt
        );
      } catch (error) {
        console.warn(`Failed to seed prompt: ${prompt.title}`, error);
      }
    }

    this.seeded.add('prompts');
    console.log(`Seeded ${prompts.length} conversation prompts`);
  }

  // Seed AI terms dictionary
  async seedAITerms(): Promise<void> {
    if (this.seeded.has('terms')) return;
    
    console.log('Seeding AI terms...');
    
    const terms: Omit<AITerm, 'id' | 'lastUpdated'>[] = [
      {
        term: 'Artificial Intelligence',
        aliases: ['AI', 'Machine Intelligence'],
        category: 'basics',
        definitions: {
          simple: 'Computer programs that can think and learn like humans do.',
          detailed: 'Artificial Intelligence is technology that enables computers to perform tasks that typically require human intelligence, such as understanding language, recognizing images, or making decisions.',
          technical: 'AI is a branch of computer science that aims to create systems capable of performing tasks that typically require human intelligence, including learning, reasoning, perception, and decision-making.'
        },
        examples: [
          {
            context: 'Virtual assistants like Siri or Alexa',
            explanation: 'These AI systems can understand speech and respond to questions',
            relatable: true
          },
          {
            context: 'Recommendation systems on Netflix or YouTube',
            explanation: 'AI analyzes what you watch to suggest new content you might like',
            relatable: true
          },
          {
            context: 'Self-driving cars',
            explanation: 'AI processes camera and sensor data to navigate roads safely',
            relatable: true
          }
        ],
        relatedTerms: ['Machine Learning', 'Neural Networks', 'Deep Learning'],
        ageAppropriate: ['8-10', '11-13', '14-16', '17-18'],
        isVerified: true
      },

      {
        term: 'Machine Learning',
        aliases: ['ML'],
        category: 'basics',
        definitions: {
          simple: 'Teaching computers to learn from examples, like showing them thousands of pictures to help them recognize cats.',
          detailed: 'Machine Learning is a method of teaching computers to find patterns in data and make predictions or decisions without being explicitly programmed for every situation.',
          technical: 'ML is a subset of AI that uses statistical techniques to enable computer systems to improve their performance on a specific task through experience, without being explicitly programmed.'
        },
        examples: [
          {
            context: 'Email spam detection',
            explanation: 'The system learns to identify spam by examining many examples of spam and legitimate emails',
            relatable: true
          },
          {
            context: 'Photo tagging on social media',
            explanation: 'AI learns to recognize faces and objects by studying millions of labeled photos',
            relatable: true
          },
          {
            context: 'Language translation',
            explanation: 'Translation systems learn by analyzing millions of text pairs in different languages',
            relatable: true
          }
        ],
        relatedTerms: ['Artificial Intelligence', 'Algorithm', 'Data Science'],
        ageAppropriate: ['11-13', '14-16', '17-18'],
        isVerified: true
      },

      {
        term: 'Algorithm',
        aliases: ['Algo'],
        category: 'basics',
        definitions: {
          simple: 'A set of step-by-step instructions that tell a computer how to solve a problem, like a recipe for baking cookies.',
          detailed: 'An algorithm is a sequence of rules or instructions designed to solve a specific problem or perform a particular task. In AI, algorithms process data to make decisions or predictions.',
          technical: 'A finite sequence of well-defined instructions for solving a computational problem or performing a task, forming the foundation of all computer programs and AI systems.'
        },
        examples: [
          {
            context: 'Search engines like Google',
            explanation: 'Algorithms decide which websites to show you based on your search terms',
            relatable: true
          },
          {
            context: 'Social media feeds',
            explanation: 'Algorithms choose which posts to show you first based on your interests and activity',
            relatable: true
          },
          {
            context: 'GPS navigation',
            explanation: 'Algorithms calculate the fastest route from your location to your destination',
            relatable: true
          }
        ],
        relatedTerms: ['Machine Learning', 'Programming', 'Data Processing'],
        ageAppropriate: ['8-10', '11-13', '14-16', '17-18'],
        isVerified: true
      },

      {
        term: 'Neural Network',
        aliases: ['Artificial Neural Network', 'ANN'],
        category: 'concepts',
        definitions: {
          simple: 'A computer system inspired by how the human brain works, with lots of connected parts that work together to learn and make decisions.',
          detailed: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information and learn patterns from data.',
          technical: 'A computational model consisting of interconnected nodes organized in layers, where each connection has a weight that adjusts during learning to minimize prediction errors.'
        },
        examples: [
          {
            context: 'Image recognition in cameras',
            explanation: 'Neural networks help cameras identify and focus on faces or objects',
            relatable: true
          },
          {
            context: 'Voice assistants understanding speech',
            explanation: 'Neural networks process sound waves to understand what words you\'re saying',
            relatable: true
          },
          {
            context: 'Automatic language translation',
            explanation: 'Neural networks learn patterns between languages to translate text automatically',
            relatable: true
          }
        ],
        relatedTerms: ['Deep Learning', 'Machine Learning', 'Artificial Intelligence'],
        ageAppropriate: ['14-16', '17-18'],
        isVerified: true
      },

      {
        term: 'Deep Learning',
        aliases: ['DL'],
        category: 'advanced',
        definitions: {
          simple: 'A special type of machine learning that uses many layers to understand complex patterns, like recognizing faces or understanding speech.',
          detailed: 'Deep Learning uses neural networks with multiple layers to analyze data and learn complex patterns. It\'s particularly good at tasks like image recognition, speech processing, and language understanding.',
          technical: 'A subset of machine learning utilizing neural networks with multiple hidden layers to model and understand complex patterns in large amounts of data.'
        },
        examples: [
          {
            context: 'Autonomous vehicles',
            explanation: 'Deep learning helps self-driving cars understand their surroundings from camera and sensor data',
            relatable: true
          },
          {
            context: 'Medical diagnosis',
            explanation: 'Deep learning analyzes medical images to help doctors detect diseases like cancer',
            relatable: false
          },
          {
            context: 'Language models like ChatGPT',
            explanation: 'Deep learning enables AI to understand and generate human-like text',
            relatable: true
          }
        ],
        relatedTerms: ['Neural Networks', 'Machine Learning', 'AI Models'],
        ageAppropriate: ['17-18'],
        isVerified: true
      },

      {
        term: 'Bias in AI',
        aliases: ['AI Bias', 'Algorithmic Bias'],
        category: 'ethics',
        definitions: {
          simple: 'When AI systems make unfair decisions because they learned from information that wasn\'t fair to all people.',
          detailed: 'AI bias occurs when artificial intelligence systems produce prejudiced or unfair results due to biased training data, flawed algorithms, or human biases in system design.',
          technical: 'Systematic and unfair discrimination in AI system outputs, often resulting from biased training data, problematic algorithm design, or inadequate consideration of fairness metrics during development.'
        },
        examples: [
          {
            context: 'Hiring algorithms',
            explanation: 'Some AI systems for hiring have been found to favor certain groups over others unfairly',
            relatable: false
          },
          {
            context: 'Photo recognition systems',
            explanation: 'Some systems work better for certain skin tones because they were trained on unrepresentative data',
            relatable: true
          },
          {
            context: 'Criminal justice algorithms',
            explanation: 'AI systems used in courts have sometimes shown bias against certain racial groups',
            relatable: false
          }
        ],
        relatedTerms: ['Ethics', 'Fairness', 'Machine Learning'],
        ageAppropriate: ['14-16', '17-18'],
        isVerified: true
      },

      {
        term: 'Computer Vision',
        aliases: ['CV', 'Machine Vision'],
        category: 'tools',
        definitions: {
          simple: 'Technology that helps computers "see" and understand what\'s in pictures and videos, like recognizing objects or people.',
          detailed: 'Computer Vision is a field of AI that enables computers to interpret and understand visual information from images and videos, similar to how humans see and recognize objects.',
          technical: 'An interdisciplinary field that enables computers to gain high-level understanding from digital images or videos, including tasks like object detection, image classification, and scene reconstruction.'
        },
        examples: [
          {
            context: 'Photo organization apps',
            explanation: 'Apps that automatically sort your photos by recognizing people, places, or objects',
            relatable: true
          },
          {
            context: 'Augmented reality filters',
            explanation: 'Apps like Snapchat use computer vision to track your face and add digital effects',
            relatable: true
          },
          {
            context: 'Medical imaging',
            explanation: 'Doctors use computer vision to analyze X-rays and scans for signs of illness',
            relatable: false
          }
        ],
        relatedTerms: ['Image Recognition', 'Pattern Recognition', 'Machine Learning'],
        ageAppropriate: ['11-13', '14-16', '17-18'],
        isVerified: true
      },

      {
        term: 'Natural Language Processing',
        aliases: ['NLP', 'Language AI'],
        category: 'tools',
        definitions: {
          simple: 'Technology that helps computers understand and use human language, like when you talk to Siri or get text translated.',
          detailed: 'Natural Language Processing enables computers to understand, interpret, and generate human language in a way that is both meaningful and useful.',
          technical: 'A branch of AI that gives computers the ability to understand, interpret, and manipulate human language, including tasks like sentiment analysis, translation, and text generation.'
        },
        examples: [
          {
            context: 'Voice assistants',
            explanation: 'Siri, Alexa, and Google Assistant use NLP to understand what you\'re asking and respond appropriately',
            relatable: true
          },
          {
            context: 'Language translation apps',
            explanation: 'Apps like Google Translate use NLP to convert text from one language to another',
            relatable: true
          },
          {
            context: 'Chatbots on websites',
            explanation: 'Customer service bots use NLP to understand your questions and provide helpful responses',
            relatable: true
          }
        ],
        relatedTerms: ['Language Models', 'Speech Recognition', 'Text Analysis'],
        ageAppropriate: ['11-13', '14-16', '17-18'],
        isVerified: true
      }
    ];

    // Create terms in database
    for (const term of terms) {
      try {
        await databaseService.create<AITerm>(
          COLLECTIONS.AI_TERMS,
          {
            ...term,
            lastUpdated: new Date()
          }
        );
      } catch (error) {
        console.warn(`Failed to seed term: ${term.term}`, error);
      }
    }

    this.seeded.add('terms');
    console.log(`Seeded ${terms.length} AI terms`);
  }

  // Seed system configuration
  async seedSystemConfig(): Promise<void> {
    if (this.seeded.has('config')) return;
    
    console.log('Seeding system configuration...');
    
    const configs: Omit<SystemConfig, 'lastUpdated'>[] = [
      {
        id: 'ai_features',
        feature: 'AI Features',
        enabled: true,
        config: {
          maxRequestsPerMinute: 10,
          fallbackEnabled: true,
          cacheEnabled: true,
          cacheTTL: 3600000, // 1 hour
          supportedModels: ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3-haiku'],
          defaultModel: 'anthropic/claude-3.5-sonnet'
        },
        version: '1.0.0'
      },
      {
        id: 'content_filtering',
        feature: 'Content Filtering',
        enabled: true,
        config: {
          strictMode: false,
          bannedWords: ['inappropriate', 'harmful'],
          ageRestrictions: {
            'under13': ['violence', 'adult-content'],
            'teen': ['adult-content']
          },
          reportingEnabled: true
        },
        version: '1.0.0'
      },
      {
        id: 'notifications',
        feature: 'Notifications',
        enabled: true,
        config: {
          emailEnabled: true,
          pushEnabled: false,
          reminderFrequency: 'weekly',
          quietHours: {
            start: '22:00',
            end: '07:00'
          }
        },
        version: '1.0.0'
      },
      {
        id: 'analytics',
        feature: 'Analytics',
        enabled: true,
        config: {
          collectUsageData: true,
          collectPerformanceData: true,
          dataRetentionDays: 90,
          anonymizeData: true
        },
        version: '1.0.0'
      },
      {
        id: 'rate_limiting',
        feature: 'Rate Limiting',
        enabled: true,
        config: {
          globalLimits: {
            requestsPerMinute: 100,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          userLimits: {
            requestsPerMinute: 10,
            requestsPerHour: 100,
            requestsPerDay: 500
          },
          familyLimits: {
            requestsPerMinute: 30,
            requestsPerHour: 300,
            requestsPerDay: 2000
          }
        },
        version: '1.0.0'
      }
    ];

    for (const config of configs) {
      try {
        await databaseService.create<SystemConfig>(
          COLLECTIONS.SYSTEM_CONFIG,
          {
            ...config,
            lastUpdated: new Date()
          }
        );
      } catch (error) {
        console.warn(`Failed to seed config: ${config.id}`, error);
      }
    }

    this.seeded.add('config');
    console.log(`Seeded ${configs.length} system configurations`);
  }

  // Check what needs to be seeded
  async checkSeedingStatus(): Promise<{
    prompts: boolean;
    terms: boolean;
    config: boolean;
    needsSeeding: boolean;
  }> {
    const [prompts, terms, configs] = await Promise.all([
      databaseService.query(COLLECTIONS.PROMPTS, { limit: 1 }),
      databaseService.query(COLLECTIONS.AI_TERMS, { limit: 1 }),
      databaseService.query(COLLECTIONS.SYSTEM_CONFIG, { limit: 1 })
    ]);

    const status = {
      prompts: prompts.length > 0,
      terms: terms.length > 0,
      config: configs.length > 0,
      needsSeeding: false
    };

    status.needsSeeding = !status.prompts || !status.terms || !status.config;

    return status;
  }

  // Seed only missing data
  async seedMissingData(): Promise<void> {
    const status = await this.checkSeedingStatus();
    
    if (!status.needsSeeding) {
      console.log('All data already seeded');
      return;
    }

    const promises: Promise<void>[] = [];

    if (!status.prompts) {
      promises.push(this.seedConversationPrompts());
    }

    if (!status.terms) {
      promises.push(this.seedAITerms());
    }

    if (!status.config) {
      promises.push(this.seedSystemConfig());
    }

    await Promise.all(promises);
    console.log('Missing data seeding completed');
  }

  // Reset seeding status (for development)
  resetSeedingStatus(): void {
    this.seeded.clear();
  }
}

export const seedingService = new SeedingService();