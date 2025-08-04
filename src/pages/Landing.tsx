import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, BookOpen, PenTool, Shield, Users, Lightbulb } from 'lucide-react';

const Landing: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Conversation Starters',
      description: 'Daily and weekly prompts to spark meaningful discussions about AI between parents and children.',
    },
    {
      icon: BookOpen,
      title: 'Parent-Friendly AI Dictionary',
      description: 'Simple, jargon-free explanations of AI terms that parents can understand and discuss with confidence.',
    },
    {
      icon: PenTool,
      title: 'Shared Family Journal',
      description: 'Document insights, questions, and reflections together as you navigate the world of AI.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Your family conversations and data are protected with enterprise-grade security.',
    },
    {
      icon: Users,
      title: 'Built for Families',
      description: 'Designed specifically for parents and children to learn and grow together.',
    },
    {
      icon: Lightbulb,
      title: 'Expert Guidance',
      description: 'Content curated by AI experts and child development specialists.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <nav className="relative flex items-center justify-between sm:h-10 lg:justify-start">
                <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <h1 className="text-2xl font-bold text-primary-600">BridgeAI</h1>
                  </div>
                </div>
                <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
                  <Link
                    to="/login"
                    className="font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </div>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Bridge the</span>{' '}
                  <span className="block text-primary-600 xl:inline">AI gap</span>{' '}
                  <span className="block xl:inline">in your family</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Help parents and children navigate AI together through guided conversations, 
                  simple explanations, and shared learning experiences.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Start Your Journey
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Already have an account?
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-primary-400 to-primary-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-white text-center">
              <MessageCircle className="h-24 w-24 mx-auto mb-4" />
              <p className="text-xl font-medium">Connect. Learn. Grow.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to bridge the AI gap
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              BridgeAI provides tools and resources designed specifically for families to learn about AI together.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="relative">
                    <div>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                    </div>
                    <div className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to bridge the gap?</span>
            <span className="block text-primary-600">Start your family's AI journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary-600">BridgeAI</h3>
            <p className="mt-2 text-sm text-gray-500">
              Connecting families through AI education and understanding.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              © 2024 BridgeAI. Built for families, by families.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;