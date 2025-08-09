
import { createRoot } from 'react-dom/client'
import { connectToMongoDB } from './api/mongodb'
import App from './App.tsx'
import './index.css'

// Initialize API connection
console.log('🚀 Starting Lifty Application...');
console.log('🔗 Attempting to connect to API...');

connectToMongoDB()
  .then((connected) => {
    if (connected) {
      console.log('✅ API connected successfully - all features available');
    } else {
      console.log('⚠️ API connection failed - running in offline mode');
    }
    console.log('🎉 Application initialized');
  })
  .catch((err) => {
    console.error('❌ Failed to initialize API connection:', err);
    console.log('🔄 Application will continue in offline mode');
  });

createRoot(document.getElementById("root")!).render(<App />);
