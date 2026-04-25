import { motion } from 'framer-motion';
import { Calendar, Info } from 'lucide-react';
import { ElectionTimeline } from '../components/Timeline/ElectionTimeline';
import { StateSelector } from '../components/UI/StateSelector';
import { useStateData } from '../hooks/useStateData';

export default function TimelinePage() {
  const { states, selectedState, setSelectedState, stateData, isLoadingStates, isLoadingState } = useStateData();

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 40px)' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(26, 58, 107, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color="var(--color-primary)" />
          </div>
          <span className="badge badge-upcoming">2026 Midterms</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 12 }}>
          Election Timeline
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 28, maxWidth: 580 }}>
          Every key date from first primaries through Election Day. Select your state to add state-specific deadlines.
        </p>
      </motion.div>

      {/* State Selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
            Filter by State (optional)
          </label>
          {!isLoadingStates && (
            <StateSelector
              states={states}
              value={selectedState}
              onChange={setSelectedState}
              placeholder="Select your state to add state-specific dates..."
            />
          )}
          {stateData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(26, 58, 107, 0.06)', borderRadius: 'var(--radius-md)' }}>
              <Info size={14} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                Showing global milestones + {stateData.name}-specific dates
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Timeline */}
      {isLoadingState ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⏳</div>
          Loading state data...
        </div>
      ) : (
        <ElectionTimeline stateData={stateData} />
      )}
    </main>
  );
}
