/**
 * Utility functions to manage AI activity indicators across the app
 */

export const startAIActivity = (message?: string) => {
  const event = new CustomEvent('ai-request-start', { 
    detail: { message } 
  });
  document.dispatchEvent(event);
};

export const endAIActivity = () => {
  const event = new CustomEvent('ai-request-end');
  document.dispatchEvent(event);
};

/**
 * Wrapper function to automatically handle AI activity indicators
 */
export const withAIActivity = async <T>(
  asyncFunction: () => Promise<T>,
  message?: string
): Promise<T> => {
  try {
    startAIActivity(message);
    const result = await asyncFunction();
    return result;
  } finally {
    endAIActivity();
  }
};

export default {
  start: startAIActivity,
  end: endAIActivity,
  wrap: withAIActivity
};