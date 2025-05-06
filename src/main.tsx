
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Toaster } from "sonner"
import './index.css'
import { routes } from './routes'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationsProvider } from './context/notifications'

// Create a browser router with the routes
const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <NotificationsProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors closeButton />
      </NotificationsProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
