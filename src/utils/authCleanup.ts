
/**
 * Authentication cleanup utility to prevent limbo states and session conflicts
 */

export const cleanupAuthState = () => {
  console.log('Cleaning up authentication state...');
  
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('Removing localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          console.log('Removing sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Clear any impersonation state
    localStorage.removeItem('impersonatedCustomer');
    
    console.log('Auth state cleanup completed');
  } catch (error) {
    console.error('Error during auth cleanup:', error);
  }
};

export const performAuthRecovery = async () => {
  console.log('Performing auth recovery...');
  
  try {
    // Clean up existing state
    cleanupAuthState();
    
    // Force a page reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  } catch (error) {
    console.error('Error during auth recovery:', error);
  }
};
