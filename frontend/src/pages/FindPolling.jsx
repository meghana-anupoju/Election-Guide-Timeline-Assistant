import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { PollingPlaceFinder } from '../components/Maps/PollingPlaceFinder';
import { StateSelector } from '../components/UI/StateSelector';
import { useStateData } from '../hooks/useStateData';

export default function FindPollingPage() {
  const { states, selectedState, setSelectedState, stateData, isLoadingStates } = useStateData();

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 40px)' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(26, 122, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Map size={22} color="#1a7a4a" />
          </div>
          <span className="badge" style={{ background: 'rgba(26,122,74,0.1)', color: '#1a7a4a', border: '1px solid rgba(26,122,74,0.2)' }}>Polling Locator</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 12 }}>
          Find My Polling Place
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, maxWidth: 580 }}>
          Enter your ZIP code to find polling places, early voting centers, and ballot drop boxes near you.
        </p>
      </motion.div>

      {/* Optional state context */}
      {!isLoadingStates && (
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
            Your State (for official site link)
          </label>
          <StateSelector
            states={states}
            value={selectedState}
            onChange={setSelectedState}
            placeholder="Select your state..."
          />
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <PollingPlaceFinder stateData={stateData} />
      </div>
    </main>
  );
}
