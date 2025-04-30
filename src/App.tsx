
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { RouterProvider } from 'react-router-dom';
import routes from './routes';

import './App.css';

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
    <>
      <Helmet>
        <title>Easy Shop Manager</title>
      </Helmet>

      <RouterProvider router={routes} />
      
      <Toaster />
    </>
  );
}

export default App;
