
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Toaster } from "sonner"
import './index.css'
import { routes } from './routes'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationsProvider } from './context/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a browser router with the routes
const router = createBrowserRouter(routes);

// Create a client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationsProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
      </NotificationsProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
