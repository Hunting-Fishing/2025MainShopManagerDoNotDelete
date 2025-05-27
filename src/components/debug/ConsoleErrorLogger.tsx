
import { useEffect } from 'react';

export const ConsoleErrorLogger = () => {
  useEffect(() => {
    // Override console.error to capture React errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
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
      
      // Check for notification-related errors
      if (errorMessage.includes('notification') || 
          errorMessage.includes('sound') || 
          errorMessage.includes('audio') ||
          errorMessage.includes('toast')) {
        console.log('🔔 Notification System Error:', {
          timestamp: new Date().toISOString(),
          message: errorMessage,
          context: 'notification_system'
        });
      }
      
      // Check for DOM manipulation errors (browser extension conflicts)
      if (errorMessage.includes('querySelector') || 
          errorMessage.includes('insertBefore') ||
          errorMessage.includes('Failed to execute')) {
        console.log('🌐 DOM Manipulation Error (possible extension conflict):', {
          timestamp: new Date().toISOString(),
          message: errorMessage,
          context: 'dom_manipulation'
        });
      }
    };
    
    console.warn = (...args) => {
      // Call original console.warn first
      originalWarn.apply(console, args);
      
      const warnMessage = args.join(' ');
      
      // Log notification sound warnings specifically
      if (warnMessage.includes('notification sound') || 
          warnMessage.includes('audio') ||
          warnMessage.includes('playback')) {
        console.log('🔊 Audio/Sound Warning:', {
          timestamp: new Date().toISOString(),
          message: warnMessage,
          context: 'audio_system'
        });
      }
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
};
