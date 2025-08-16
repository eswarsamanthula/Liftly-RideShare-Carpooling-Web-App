import React from 'react'                 // <-- Add this line
import { createRoot } from 'react-dom/client'
import { connectToMongoDB } from './lib/mongodb'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Connect to MongoDB when the application starts
connectToMongoDB()
  .then(() => {
    console.log('MongoDB connected successfully')
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
  })

// Render App wrapped in GoogleOAuthProvider
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
)
