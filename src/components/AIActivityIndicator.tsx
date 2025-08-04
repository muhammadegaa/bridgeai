import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIActivityIndicatorProps {
  isActive: boolean;
  message?: string;
}

const AIActivityIndicator: React.FC<AIActivityIndicatorProps> = ({ 
  isActive, 
  message = "AI working..." 
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-40">
      <Sparkles className="h-4 w-4 animate-pulse" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default AIActivityIndicator;