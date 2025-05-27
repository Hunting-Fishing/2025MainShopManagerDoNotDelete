
import { useEffect } from 'react';

export const ConsoleErrorLogger = () => {
  useEffect(() => {
    // Override console.error to capture React errors
    const originalError = console.error;
    
    console.error = (...args) => {
      // Call original console.error first
      originalError.apply(console, args);
      
      // Check if this is a React error
      const errorMessage = args.join(' ');
      if (errorMessage.includes('Minified React error')) {
        console.log('🚨 React Error Detected:', {
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          args: args
        });
        
        // Extract error codes from minified errors
        const errorCodeMatch = errorMessage.match(/error #(\d+)/);
        if (errorCodeMatch) {
          const errorCode = errorCodeMatch[1];
          console.log(`📚 React Error #${errorCode} - Visit https://react.dev/errors/${errorCode} for details`);
        }
      }
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
};
