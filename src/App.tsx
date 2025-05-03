
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './routes';
import './App.css';

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
    <>
      <Helmet>
        <title>Easy Shop Manager</title>
      </Helmet>

      <RouterProvider router={router} />
      
      <Toaster />
    </>
  );
}

export default App;
