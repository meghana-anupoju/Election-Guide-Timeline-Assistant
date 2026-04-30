import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout/NavFooter';
import React, { Suspense, useEffect } from 'react';
import { analytics } from './services/firebase';

const Home = React.lazy(() => import('./pages/Home'));
const TimelinePage = React.lazy(() => import('./pages/Timeline'));
const GuidePage = React.lazy(() => import('./pages/Guide'));
const FindPollingPage = React.lazy(() => import('./pages/FindPolling'));

// Loading fallback for lazy components
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: '#1A3A6B', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function App() {
  useEffect(() => {
    if (analytics) {
      console.log('Firebase Analytics initialized');
    }
  }, []);

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"             element={<Home />} />
              <Route path="/timeline"     element={<TimelinePage />} />
              <Route path="/guide"        element={<GuidePage />} />
              <Route path="/find-polling" element={<FindPollingPage />} />
              <Route path="*"             element={
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 16 }}>🗺️</div>
                  <h1 style={{ marginBottom: 8 }}>Page Not Found</h1>
                  <a href="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Go Home</a>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
