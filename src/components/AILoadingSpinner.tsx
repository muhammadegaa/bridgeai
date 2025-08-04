import React from 'react';
import { Sparkles } from 'lucide-react';

interface AILoadingSpinnerProps {
  message?: string;
  className?: string;
}

const AILoadingSpinner: React.FC<AILoadingSpinnerProps> = ({ 
  message = "AI is thinking...", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center justify-center py-6 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          <Sparkles className="absolute inset-0 h-6 w-6 text-purple-600 animate-pulse" />
        </div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
};

export default AILoadingSpinner;