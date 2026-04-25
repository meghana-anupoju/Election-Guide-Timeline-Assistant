import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout/NavFooter';
import Home from './pages/Home';
import TimelinePage from './pages/Timeline';
import GuidePage from './pages/Guide';
import FindPollingPage from './pages/FindPolling';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
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
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
