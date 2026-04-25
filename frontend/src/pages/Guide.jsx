import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { VoterWizard } from '../components/Wizard/VoterWizard';
import { useStateData } from '../hooks/useStateData';

export default function GuidePage() {
  const { states, setSelectedState, stateData, isLoadingStates, isLoadingState } = useStateData();

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(32px, 6vw, 56px) clamp(16px, 4vw, 40px)' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(200, 37, 60, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} color="var(--color-accent)" />
          </div>
          <span className="badge badge-election">Step-by-Step</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 12 }}>
          Voter Guide Wizard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 36, maxWidth: 560 }}>
          Answer a few questions and we'll build your personalized voting checklist and action plan.
        </p>
      </motion.div>

      {!isLoadingStates && (
        <VoterWizard
          states={states}
          stateData={stateData}
          onStateChange={setSelectedState}
          isLoadingState={isLoadingState}
        />
      )}
    </main>
  );
}
