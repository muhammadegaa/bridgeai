import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface RateLimitWarningProps {
  timeUntilReset: number;
  onClose?: () => void;
}

const RateLimitWarning: React.FC<RateLimitWarningProps> = ({ 
  timeUntilReset, 
  onClose 
}) => {
  const minutes = Math.ceil(timeUntilReset / 1000 / 60);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            AI Feature Temporarily Limited
          </h3>
          <p className="text-sm text-yellow-700 mb-2">
            You've reached the AI request limit. New personalized suggestions will be available in {minutes} minute{minutes !== 1 ? 's' : ''}.
          </p>
          <div className="flex items-center space-x-2 text-xs text-yellow-600">
            <Clock className="h-3 w-3" />
            <span>Don't worry - all other features work normally!</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-yellow-600 hover:text-yellow-800 text-lg"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default RateLimitWarning;