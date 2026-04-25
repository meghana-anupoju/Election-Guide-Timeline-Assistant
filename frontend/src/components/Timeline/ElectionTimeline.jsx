import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ExternalLink, CheckCircle, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { getTimeline } from '../../services/api';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';

const TYPE_CONFIG = {
  election_day: { dotClass: 'timeline-dot-election', badgeClass: 'badge-election', label: 'Election Day' },
  primary:      { dotClass: 'timeline-dot-primary',  badgeClass: 'badge-primary',  label: 'Primary' },
  early_voting: { dotClass: 'timeline-dot-upcoming', badgeClass: 'badge-upcoming', label: 'Early Voting' },
  deadline:     { dotClass: 'timeline-dot-upcoming', badgeClass: 'badge-warning',  label: 'Deadline' },
  awareness:    { dotClass: 'timeline-dot-awareness', badgeClass: 'badge-today',   label: 'Awareness' },
  state:        { dotClass: 'timeline-dot-upcoming', badgeClass: 'badge-upcoming', label: 'State Date' },
};

function getDateStatus(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  if (d < today) return 'passed';
  if (d.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getDaysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function AddToCalendarBtn({ event, buildCalendarLink }) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    const link = buildCalendarLink({
      title: event.title,
      startDate: event.date,
      endDate: event.date,
      description: event.description,
    });
    window.open(link, '_blank', 'noopener,noreferrer');
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`btn btn-sm btn-calendar`}
      whileTap={{ scale: 0.96 }}
      aria-label={`Add ${event.title} to Google Calendar`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      {added ? (
        <><CheckCircle size={14} /> Added!</>
      ) : (
        <><Calendar size={14} /> Add to Calendar</>
      )}
    </motion.button>
  );
}

function TimelineItem({ event, index, stateItems }) {
  const [expanded, setExpanded] = useState(false);
  const { buildCalendarLink } = useGoogleCalendar();
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.state;
  const status = getDateStatus(event.date);

  const isPassed = status === 'passed';
  const isToday = status === 'today';

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: 8 }}
    >
      {/* Connector line drawn by parent */}
      
      {/* Dot */}
      <div className={`timeline-dot ${isPassed ? 'timeline-dot-passed' : config.dotClass}`} style={{ opacity: isPassed ? 0.5 : 1 }}>
        {event.icon}
      </div>

      {/* Card */}
      <div
        className={`glass-card card-hover`}
        style={{
          flex: 1, padding: '18px 20px', marginBottom: 4,
          opacity: isPassed ? 0.72 : 1,
          border: isToday ? '2px solid var(--color-gold)' : undefined,
          boxShadow: isToday ? '0 0 20px rgba(212, 175, 55, 0.25)' : undefined,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span className={`badge ${config.badgeClass}`}>{config.label}</span>
              {isToday && <span className="badge badge-today">⭐ Today!</span>}
              {isPassed && <span className="badge badge-passed">✓ Passed</span>}
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontFamily: 'Inter', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 4 }}>
              {event.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Clock size={13} color="var(--color-text-muted)" />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {formatDate(event.date)}
              </span>
              <span style={{ fontSize: '0.75rem', color: isPassed ? 'var(--color-text-muted)' : (isToday ? '#8B6914' : 'var(--color-primary)'), fontWeight: 600, marginLeft: 4 }}>
                • {getDaysUntil(event.date)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
            {!isPassed && (
              <AddToCalendarBtn event={event} buildCalendarLink={buildCalendarLink} />
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}
              aria-expanded={expanded}
            >
              {expanded ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Details</>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--color-border-light)', marginTop: 8 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {event.description}
                </p>
                {event.source && (
                  <a href={event.source} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--color-primary-light)', marginTop: 8 }}>
                    <ExternalLink size={12} /> Official Source
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function ElectionTimeline({ stateData }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimeline(2026).then(data => {
      setMilestones(data.milestones || []);
      setLoading(false);
    });
  }, []);

  // Build combined list: global milestones + state-specific items
  const allItems = (() => {
    const items = [...milestones];

    if (stateData?.timeline) {
      const t = stateData.timeline;
      const stateName = stateData.name;

      if (t.registration_deadline && !stateData.has_same_day_registration) {
        items.push({
          id: 'state_reg',
          title: `${stateName} Voter Registration Deadline`,
          date: t.registration_deadline,
          description: `The last day to register to vote in ${stateName} for the 2026 general election. ${stateData.registration_deadline_type === 'online' ? 'Online registration available.' : ''} Register at your state's official election website.`,
          type: 'deadline',
          icon: '📝',
          source: stateData.polling_place_url,
        });
      }

      if (t.early_voting_start && stateData.has_early_voting) {
        items.push({
          id: 'state_ev_start',
          title: `${stateName} Early Voting Begins`,
          date: t.early_voting_start,
          description: `Early in-person voting opens in ${stateName}. You can vote before Election Day at designated early vote centers.`,
          type: 'early_voting',
          icon: '🏛️',
          source: stateData.polling_place_url,
        });
        items.push({
          id: 'state_ev_end',
          title: `${stateName} Early Voting Ends`,
          date: t.early_voting_end,
          description: `Last day for early in-person voting in ${stateName}.`,
          type: 'early_voting',
          icon: '🏛️',
        });
      }

      if (t.primary_date) {
        items.push({
          id: 'state_primary',
          title: `${stateName} Primary Election`,
          date: t.primary_date,
          description: `${stateName}'s primary election to determine party nominees for the November general election.`,
          type: 'primary',
          icon: '🗳️',
          source: stateData.polling_place_url,
        });
      }
    }

    return items.sort((a, b) => a.date.localeCompare(b.date));
  })();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-surface-3)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 12, background: 'var(--color-surface-3)', borderRadius: 6, width: '60%', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 10, background: 'var(--color-surface-3)', borderRadius: 6, width: '40%', animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: 24, top: 24, bottom: 24, width: 2, background: 'linear-gradient(to bottom, var(--color-primary-light), var(--color-border-light))' }} aria-hidden="true" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {allItems.map((event, index) => (
          <TimelineItem key={event.id} event={event} index={index} />
        ))}
      </div>
    </div>
  );
}
