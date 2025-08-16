import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RideProvider } from './contexts/RideContext';
import { AuthProvider } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';
import Logo from './assets/Logo.png';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import YourRides from './pages/YourRides';
import Publish from './pages/Publish';
import RideDetails from './pages/RideDetails';
import SearchResults from './pages/SearchResults';
import PublishConfirmation from './pages/PublishConfirmation';
import BookingConfirmation from './pages/BookingConfirmation';
import Inbox from './pages/Inbox';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import ContactDriver from './pages/ContactDriver';
import PublishedRideDetails from './pages/PublishedRideDetails';

// Optional: Google Login Popup
import GoogleLoginPopup from './components/features/GoogleLoginPopup';

function App() {
  const [showGooglePopup, setShowGooglePopup] = useState(false);

  useEffect(() => {
    const preloader = document.getElementById('preloader');
    const mainContent = document.getElementById('main-content');

    window.addEventListener('load', () => {
      setTimeout(() => {
        if (preloader) preloader.classList.add('loaded');
        if (mainContent) {
          mainContent.classList.remove('invisible');
          mainContent.classList.add('opacity-100');
        }
      }, 1200);
    });
  }, []);

  const handleGoogleAccountSelect = (account: any) => {
    console.log('Logged in user:', account);
    setShowGooglePopup(false);
    // You can store the account in AuthContext or localStorage
  };

  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="rideshare-ui-theme">
        <AuthProvider>
          <MessageProvider>
            <RideProvider>
              {/* Preloader */}
              <div
                id="preloader"
                className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center transition-opacity duration-700"
              >
                <img
                  src={Logo}
                  alt="Lifty Logo"
                  className="h-24 w-24 animate-fade-in-out"
                />
              </div>

              {/* Main content */}
              <div
                id="main-content"
                className="invisible opacity-0 transition-opacity duration-700"
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/your-rides" element={<YourRides />} />
                  <Route path="/publish" element={<Publish />} />
                  <Route path="/rides/:id" element={<RideDetails />} />
                  <Route
                    path="/published-rides/:id"
                    element={<PublishedRideDetails />}
                  />
                  <Route
                    path="/contact-driver/:id"
                    element={<ContactDriver />}
                  />
                  <Route path="/search" element={<SearchResults />} />
                  <Route
                    path="/publish-confirmation/:id"
                    element={<PublishConfirmation />}
                  />
                  <Route
                    path="/booking-confirmation/:id"
                    element={<BookingConfirmation />}
                  />
                  <Route path="/inbox" element={<Inbox />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Toaster for notifications */}
                <Toaster />

                {/* Optional Google Login Popup */}
                {showGooglePopup && (
                  <GoogleLoginPopup
                    onAccountSelect={handleGoogleAccountSelect}
                    onClose={() => setShowGooglePopup(false)}
                  />
                )}
              </div>
            </RideProvider>
          </MessageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
