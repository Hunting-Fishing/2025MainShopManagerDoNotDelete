
import { useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient();

// Create a browser router with the routes
const router = createBrowserRouter(routes);

function App() {
  const [authToken, setAuthToken] = useState(null);
  
  // Logic to handle authentication (not relevant to this task)
  const isLoggedIn = !!authToken; // Example: Check if authToken exists
  
  const handleLogin = (token: string) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <HelmetProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <QueryClientProvider client={queryClient}>
            <Helmet>
              <title>Easy Shop Manager</title>
            </Helmet>

            <RouterProvider router={router} />
            
            <Toaster />
          </QueryClientProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
