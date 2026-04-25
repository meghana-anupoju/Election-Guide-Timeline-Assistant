import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, User, ClipboardList, CheckSquare, ArrowRight, ArrowLeft,
  CheckCircle, Circle, AlertTriangle, Info, ExternalLink, Calendar, RotateCcw
} from 'lucide-react';
import { StateSelector } from '../UI/StateSelector';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

const VOTER_STATUS_OPTIONS = [
  { id: 'first_time',  label: 'First-Time Voter',      icon: '🌟', description: 'Registering and voting for the first time' },
  { id: 'returning',   label: 'Returning Voter',        icon: '🗳️', description: 'Voted before, want to update or confirm my registration' },
  { id: 'mail_in',     label: 'Vote by Mail / Absentee', icon: '📬', description: 'Prefer to vote by mail rather than in person' },
  { id: 'overseas',    label: 'Overseas / Military',    icon: '✈️', description: 'Currently living abroad or serving in the military' },
];

const STEPS = [
  { id: 'state',    title: 'Your State',     icon: MapPin },
  { id: 'status',   title: 'Voter Status',   icon: User },
  { id: 'checklist',title: 'Your Checklist', icon: ClipboardList },
  { id: 'action',   title: 'Action Plan',    icon: CheckSquare },
];

function StepIndicator({ currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, padding: '0 4px' }} role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className={`wizard-step-number ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}`}
                aria-label={`Step ${i + 1}: ${step.title}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}>
                {isCompleted ? <CheckCircle size={16} /> : <Icon size={15} />}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? 'var(--color-primary)' : isCompleted ? 'var(--color-success)' : 'var(--color-text-muted)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                {step.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`wizard-connector ${i < currentStep ? 'active' : ''}`} style={{ margin: '0 8px', marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildChecklist(stateData, voterStatus) {
  if (!stateData) return [];
  const items = [];

  // Step 1: Registration
  const regDays = stateData.timeline?.registration_deadline_days_before;
  const sameDay = stateData.has_same_day_registration;
  const regDeadline = stateData.timeline?.registration_deadline;

  if (sameDay) {
    items.push({ id: 'reg', category: 'Registration', text: `${stateData.name} allows same-day registration — you can register and vote on Election Day!`, info: 'Bring valid ID when you register on Election Day.' });
  } else if (regDeadline) {
    const fmt = new Date(regDeadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    items.push({ id: 'reg', category: 'Registration', text: `Register to vote by ${fmt} (${regDays} days before Election Day)`, info: stateData.registration_deadline_type === 'online' ? 'Online registration is available at your state election website.' : 'In-person registration required — visit your county clerk.' });
  }

  // ID Requirements
  if (stateData.id_requirements?.length) {
    stateData.id_requirements.forEach((req, i) => {
      items.push({ id: `id_${i}`, category: 'ID Required', text: req, isWarning: i === 0 });
    });
  }

  // Mail-in specific
  if (voterStatus === 'mail_in' || voterStatus === 'overseas') {
    if (stateData.absentee_excuse_required) {
      items.push({ id: 'excuse', category: 'Absentee', text: '⚠️ Your state requires an excuse to vote absentee. Check valid reasons below.', isWarning: true });
    }
    if (stateData.mail_in_steps?.length) {
      stateData.mail_in_steps.forEach((step, i) => {
        items.push({ id: `mail_${i}`, category: 'Mail-in Steps', text: step });
      });
    }
  }

  // First-time voter extras
  if (voterStatus === 'first_time') {
    items.push({ id: 'ft1', category: 'First-Time Tips', text: 'Look up your polling place before Election Day — it may not be the closest location to you.' });
    items.push({ id: 'ft2', category: 'First-Time Tips', text: 'Bring more ID than required — it makes the process smoother.' });
    items.push({ id: 'ft3', category: 'First-Time Tips', text: 'Polls are typically open 6am–8pm. If you\'re in line by closing time, you have the right to vote.' });
  }

  // Early voting
  if (stateData.has_early_voting && stateData.timeline?.early_voting_start) {
    const start = new Date(stateData.timeline.early_voting_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(stateData.timeline.early_voting_end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    items.push({ id: 'ev', category: 'Early Voting', text: `Early in-person voting: ${start} – ${end}`, info: 'No excuse needed to vote early in person.' });
  }

  // Notes
  if (stateData.notes) {
    items.push({ id: 'note', category: 'Important Note', text: stateData.notes, isWarning: true });
  }

  return items;
}

function buildActionPlan(stateData) {
  const events = [];
  if (!stateData?.timeline) return events;
  const t = stateData.timeline;

  if (t.registration_deadline) {
    events.push({ title: `Register to Vote — ${stateData.name}`, startDate: t.registration_deadline, endDate: t.registration_deadline, description: `Voter registration deadline for ${stateData.name}. Register at: ${stateData.polling_place_url}` });
  }
  if (t.early_voting_start && stateData.has_early_voting) {
    events.push({ title: `Early Voting Opens — ${stateData.name}`, startDate: t.early_voting_start, endDate: t.early_voting_start, description: `Early in-person voting begins in ${stateData.name}.` });
  }
  if (t.primary_date) {
    events.push({ title: `${stateData.name} Primary Election`, startDate: t.primary_date, endDate: t.primary_date, description: `${stateData.name} primary election.` });
  }
  events.push({ title: '2026 General Election Day 🇺🇸', startDate: t.election_day, endDate: t.election_day, description: `The 2026 US Midterm Elections! All 435 House seats and 33 Senate seats on ballot. Polls open approximately 6am–8pm local time.` });

  return events;
}

const pageVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

export function VoterWizard({ states, stateData, onStateChange, isLoadingState }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [voterStatus, setVoterStatus] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [direction, setDirection] = useState(1);
  const [addedEvents, setAddedEvents] = useState({});
  const { buildCalendarLink } = useGoogleCalendar();

  const goTo = (step) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };
  const next = () => goTo(Math.min(currentStep + 1, STEPS.length - 1));
  const prev = () => goTo(Math.max(currentStep - 1, 0));
  const reset = () => { setCurrentStep(0); setVoterStatus(null); setCheckedItems({}); setAddedEvents({}); };

  const toggleCheck = (id) => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));

  const checklist = buildChecklist(stateData, voterStatus?.id);
  const actionPlan = buildActionPlan(stateData);
  const allChecked = checklist.length > 0 && checklist.every(item => checkedItems[item.id]);

  const handleAddEvent = (event, eventId) => {
    const link = buildCalendarLink(event);
    window.open(link, '_blank', 'noopener,noreferrer');
    setAddedEvents(prev => ({ ...prev, [eventId]: true }));
  };

  const handleAddAll = () => {
    actionPlan.forEach((event, i) => {
      setTimeout(() => {
        const link = buildCalendarLink(event);
        window.open(link, '_blank', 'noopener,noreferrer');
        setAddedEvents(prev => ({ ...prev, [i]: true }));
      }, i * 600);
    });
  };

  return (
    <div className="glass-card" style={{ padding: '32px 28px', maxWidth: 720, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      <StepIndicator currentStep={currentStep} />

      <div style={{ position: 'relative', minHeight: 380, overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
          >
            {/* ── Step 0: State ── */}
            {currentStep === 0 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--color-primary-dark)' }}>
                  Where are you registered to vote?
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9375rem' }}>
                  We'll customize your voting guide with state-specific rules, deadlines, and ID requirements.
                </p>
                <StateSelector
                  states={states}
                  value={stateData ? { id: stateData.id, name: stateData.name } : null}
                  onChange={onStateChange}
                  placeholder="Search your state or territory..."
                />
                {stateData && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(26, 58, 107, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(26, 58, 107, 0.15)' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '2rem' }}>🏛️</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>
                          {stateData.name} Selected
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          {stateData.has_same_day_registration ? '✅ Same-day registration available' : `📅 Register by ${stateData.timeline?.registration_deadline_days_before} days before Election Day`}
                          {' · '}
                          {stateData.has_early_voting ? '🏛️ Early voting available' : '⚠️ No early voting'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── Step 1: Voter Status ── */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--color-primary-dark)' }}>
                  What best describes you?
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9375rem' }}>
                  We'll tailor your checklist to your situation.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {VOTER_STATUS_OPTIONS.map(opt => (
                    <motion.button
                      key={opt.id}
                      onClick={() => setVoterStatus(opt)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px',
                        border: `2px solid ${voterStatus?.id === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)', background: voterStatus?.id === opt.id ? 'rgba(26, 58, 107, 0.06)' : 'white',
                        cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition-fast)',
                        boxShadow: voterStatus?.id === opt.id ? '0 0 0 3px rgba(26, 58, 107, 0.12)' : 'none',
                      }}
                      aria-pressed={voterStatus?.id === opt.id}
                    >
                      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: voterStatus?.id === opt.id ? 'var(--color-primary)' : 'var(--color-text-primary)', marginBottom: 3 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                          {opt.description}
                        </div>
                      </div>
                      {voterStatus?.id === opt.id && (
                        <CheckCircle size={18} color="var(--color-primary)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 2: Checklist ── */}
            {currentStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)' }}>
                    Your Personalized Checklist
                  </h2>
                  {allChecked && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: '1.5rem' }}>🎉</motion.span>
                  )}
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                  {stateData?.name} · {voterStatus?.label}
                  {' · '}Check each item as you complete it.
                </p>
                {checklist.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20, background: 'rgba(26, 122, 74, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(26, 122, 74, 0.2)' }}>
                    <Info size={20} color="var(--color-success)" />
                    <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Select a state and status to see your personalized checklist.</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Progress */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        <span>Progress</span>
                        <span>{Object.values(checkedItems).filter(Boolean).length} / {checklist.length} complete</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${(Object.values(checkedItems).filter(Boolean).length / checklist.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Group by category */}
                    {(() => {
                      const categories = [...new Set(checklist.map(i => i.category))];
                      return categories.map(cat => (
                        <div key={cat} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>
                            {cat}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {checklist.filter(i => i.category === cat).map(item => (
                              <motion.div
                                key={item.id}
                                className={`checklist-item ${checkedItems[item.id] ? 'checked' : ''}`}
                                onClick={() => toggleCheck(item.id)}
                                whileTap={{ scale: 0.99 }}
                                role="checkbox"
                                aria-checked={!!checkedItems[item.id]}
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') toggleCheck(item.id); }}
                              >
                                <div className={`checklist-checkbox ${checkedItems[item.id] ? 'checked' : ''}`}>
                                  {checkedItems[item.id] && <CheckCircle size={14} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.9rem', color: checkedItems[item.id] ? 'var(--color-text-muted)' : item.isWarning ? 'var(--color-warning)' : 'var(--color-text-primary)', textDecoration: checkedItems[item.id] ? 'line-through' : 'none', lineHeight: 1.5 }}>
                                    {item.isWarning && !checkedItems[item.id] && <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />}
                                    {item.text}
                                  </div>
                                  {item.info && !checkedItems[item.id] && (
                                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                                      ℹ️ {item.info}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 3: Action Plan ── */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--color-primary-dark)' }}>
                  Your Election Action Plan 🗳️
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                  Add all your key dates to Google Calendar so you never miss a deadline.
                </p>

                {/* Summary stats */}
                {stateData && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {[
                      { label: 'Reg. Deadline', value: stateData.has_same_day_registration ? 'Same Day ✅' : stateData.timeline?.registration_deadline ? new Date(stateData.timeline.registration_deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—', color: 'var(--color-primary)' },
                      { label: 'Early Voting', value: stateData.has_early_voting ? `From ${new Date(stateData.timeline?.early_voting_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Not Available', color: stateData.has_early_voting ? 'var(--color-success)' : 'var(--color-text-muted)' },
                      { label: 'Absentee Excuse', value: stateData.absentee_excuse_required ? 'Required ⚠️' : 'Not Required ✅', color: stateData.absentee_excuse_required ? 'var(--color-warning)' : 'var(--color-success)' },
                      { label: 'Photo ID', value: stateData.id_requirements?.[0]?.toLowerCase().includes('not required') ? 'Not Required ✅' : 'Required 📎', color: 'var(--color-primary)' },
                    ].map(stat => (
                      <div key={stat.label} style={{ padding: '14px 16px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{stat.label}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: stat.color, lineHeight: 1.3 }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calendar Events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {actionPlan.map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)', flexWrap: 'wrap' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: 2 }}>{event.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(event.startDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddEvent(event, i)}
                        className={`btn btn-sm ${addedEvents[i] ? '' : 'btn-calendar'}`}
                        style={addedEvents[i] ? { background: 'var(--color-success)', color: 'white' } : {}}
                        aria-label={`Add "${event.title}" to calendar`}
                      >
                        {addedEvents[i] ? <><CheckCircle size={13} /> Added</> : <><Calendar size={13} /> Add</>}
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Add All Button */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={handleAddAll} style={{ flex: 1 }} aria-label="Add all election dates to Google Calendar">
                    <Calendar size={16} /> Add All Dates to Calendar
                  </button>
                  {stateData?.polling_place_url && (
                    <a href={stateData.polling_place_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" aria-label={`Official ${stateData?.name} election website`}>
                      <ExternalLink size={15} /> Official Site
                    </a>
                  )}
                </div>

                {/* Success state */}
                {Object.keys(addedEvents).length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(26, 122, 74, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(26, 122, 74, 0.25)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <CheckCircle size={18} color="var(--color-success)" />
                    <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Dates added to Google Calendar! You're all set to vote. 🎉
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--color-border-light)' }}>
        <button
          onClick={currentStep === 0 ? reset : prev}
          className="btn btn-ghost btn-sm"
          style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
          aria-label="Previous step"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Step {currentStep + 1} of {STEPS.length}
        </span>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="btn btn-primary btn-sm"
            disabled={(currentStep === 0 && !stateData) || (currentStep === 1 && !voterStatus)}
            aria-label="Next step"
          >
            {isLoadingState ? 'Loading...' : 'Next'} <ArrowRight size={15} />
          </button>
        ) : (
          <button onClick={reset} className="btn btn-ghost btn-sm" aria-label="Start over">
            <RotateCcw size={14} /> Start Over
          </button>
        )}
      </div>
    </div>
  );
}
