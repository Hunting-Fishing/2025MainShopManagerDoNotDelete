
import { toast } from "@/hooks/use-toast";

/**
 * Enhanced error handling utility for API calls
 * @param error The caught error
 * @param fallbackMessage Default message to show if error doesn't have a message
 */
export const handleApiError = (error: any, fallbackMessage = "An unexpected error occurred") => {
  console.error("API Error:", error);
  
  // Extract the most useful error message
  let errorMessage = fallbackMessage;
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error?.message) {
    errorMessage = error.error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Special handling for common database errors
  if (error?.code === '23503') {
    if (error.message.includes('profiles_id_fkey')) {
      errorMessage = "Unable to create team member: User authentication record not found.";
    } else if (error.details) {
      errorMessage = `Database constraint error: ${error.details}`;
    }
  }
  
  // Show toast notification
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
  
  // Return the formatted error for potential further handling
  return {
    message: errorMessage,
    originalError: error
  };
};

/**
 * Form submission error handler
 * @param error The caught error
 * @param formName Name of the form for better error context
 */
export const handleFormError = (error: any, formName: string) => {
  console.error(`${formName} form error:`, error);
  
  let errorMessage = `Error submitting ${formName.toLowerCase()}`;
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error?.message) {
    errorMessage = error.error.message;
  }
  
  toast({
    title: "Form Submission Failed",
    description: errorMessage,
    variant: "destructive",
  });
  
  return {
    message: errorMessage,
    originalError: error
  };
};

/**
 * Network error detection utility
 */
export const isNetworkError = (error: any): boolean => {
  return error?.message?.includes('Network Error') || 
         error?.message?.includes('Failed to fetch') ||
         error?.message?.includes('NetworkError') ||
         !navigator.onLine;
};

/**
 * Handle offline and network errors
 */
export const handleNetworkError = () => {
  const message = "Network connection issue. Please check your internet connection and try again.";
  
  toast({
    title: "Network Error",
    description: message,
    variant: "destructive",
  });
  
  return { message };
};
