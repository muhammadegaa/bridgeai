import { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

export const useAIFeatures = () => {
  const { userProfile } = useAuth();
  const [rateLimitStatus, setRateLimitStatus] = useState({
    canMakeRequest: true,
    timeUntilReset: 0
  });

  const checkRateLimit = () => {
    if (userProfile) {
      const status = aiService.getRateLimitStatus(userProfile.id);
      setRateLimitStatus(status);
    }
  };

  useEffect(() => {
    checkRateLimit();
    
    // Check rate limit every 10 seconds
    const interval = setInterval(checkRateLimit, 10000);
    
    return () => clearInterval(interval);
  }, [userProfile]);

  const makeAIRequest = async <T>(
    requestFn: () => Promise<T>,
    fallbackValue: T
  ): Promise<{ data: T; fromAI: boolean; error?: string }> => {
    if (!userProfile) {
      return { data: fallbackValue, fromAI: false, error: 'User not authenticated' };
    }

    if (!rateLimitStatus.canMakeRequest) {
      return { 
        data: fallbackValue, 
        fromAI: false, 
        error: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitStatus.timeUntilReset / 1000)} seconds.`
      };
    }

    try {
      const data = await requestFn();
      checkRateLimit(); // Update rate limit status after request
      return { data, fromAI: true };
    } catch (error: any) {
      console.error('AI request failed:', error);
      return { 
        data: fallbackValue, 
        fromAI: false, 
        error: error.message || 'AI request failed'
      };
    }
  };

  return {
    rateLimitStatus,
    makeAIRequest,
    checkRateLimit
  };
};

export default useAIFeatures;