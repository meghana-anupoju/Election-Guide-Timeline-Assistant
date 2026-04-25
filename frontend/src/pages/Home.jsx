import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Map, ClipboardList, ArrowRight, CheckCircle, Users, Shield } from 'lucide-react';
import { CountdownClock } from '../components/UI/CountdownClock';
import { StateSelector } from '../components/UI/StateSelector';
import { useStateData } from '../hooks/useStateData';

// Election Day 2026: November 3
const ELECTION_DAY_2026 = '2026-11-03T23:59:59';

const FEATURE_CARDS = [
  {
    id: 'timeline',
    icon: Calendar,
    emoji: '📅',
    title: 'Interactive Timeline',
    description: 'See every key date from primaries to Election Day — with state-specific deadlines.',
    color: 'var(--color-primary)',
    bg: 'rgba(26, 58, 107, 0.06)',
    link: '/timeline',
    cta: 'View Timeline',
  },
  {
    id: 'wizard',
    icon: ClipboardList,
    emoji: '🗳️',
    title: 'Voter Wizard',
    description: 'Step-by-step guide tailored to your state, voter status, and ballot preferences.',
    color: 'var(--color-accent)',
    bg: 'rgba(200, 37, 60, 0.06)',
    link: '/guide',
    cta: 'Start Guide',
  },
  {
    id: 'polling',
    icon: Map,
    emoji: '📍',
    title: 'Find Polling Place',
    description: 'Search your ZIP code to find polling places, drop boxes, and early vote centers.',
    color: '#1a7a4a',
    bg: 'rgba(26, 122, 74, 0.06)',
    link: '/find-polling',
    cta: 'Find Location',
  },
];

const STATS = [
  { value: '50', label: 'States Covered', icon: Shield },
  { value: '435', label: 'House Seats', icon: Users },
  { value: '33', label: 'Senate Seats', icon: Shield },
  { value: 'Nov 3', label: 'Election Day 2026', icon: Calendar },
];

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
      style={{ textAlign: 'center', padding: '20px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'Inter', marginBottom: 4 }}>{stat.value}</div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { states, selectedState, setSelectedState, isLoadingStates } = useStateData();

  const handleStateQuickStart = (state) => {
    setSelectedState(state);
    navigate('/guide');
  };

  return (
    <main>
      {/* ──────────── HERO ──────────── */}
      <section className="hero-bg" style={{ padding: 'clamp(64px, 10vw, 96px) clamp(20px, 5vw, 80px)' }} aria-label="Hero section">
        <div className="stars-pattern" aria-hidden="true" />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 24 }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gold-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              🇺🇸 2026 Midterm Elections
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', marginBottom: 20, lineHeight: 1.15 }}
          >
            Your Complete
            <span style={{ display: 'block' }} className="gradient-text-gold">Election Guide</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.82)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.65 }}
          >
            Register. Plan. Vote. Everything you need to navigate the 2026 midterm elections — personalized to your state.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginBottom: 40 }}
          >
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 16 }}>
              Election Day Countdown
            </p>
            <CountdownClock targetDate={ELECTION_DAY_2026} />
          </motion.div>

          {/* Quick State Start */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ maxWidth: 480, margin: '0 auto 32px' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid rgba(255,255,255,0.2)' }}>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginBottom: 12, fontWeight: 500 }}>
                Quick Start — Select your state:
              </p>
              {!isLoadingStates && (
                <StateSelector
                  states={states}
                  value={null}
                  onChange={handleStateQuickStart}
                  placeholder="Choose your state to get started..."
                />
              )}
            </div>
          </motion.div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 600, margin: '0 auto' }}>
            {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
          </div>
        </div>
      </section>

      {/* ──────────── FEATURE CARDS ──────────── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 80px)', maxWidth: 1200, margin: '0 auto' }} aria-label="Features">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: 12 }}>
            Everything You Need to Vote
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 48, maxWidth: 520, margin: '0 auto 48px' }}>
            From registration to finding your polling place — we've got all 50 states covered.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {FEATURE_CARDS.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                className="glass-card card-hover"
                style={{ padding: '32px 28px' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: '1.75rem' }}>
                  {card.emoji}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'Inter', fontWeight: 700, marginBottom: 10, color: 'var(--color-text-primary)' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 24 }}>
                  {card.description}
                </p>
                <Link
                  to={card.link}
                  className="btn btn-ghost btn-sm"
                  style={{ color: card.color, borderColor: card.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  aria-label={`${card.cta} — ${card.title}`}
                >
                  {card.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ──────────── TRUST STRIP ──────────── */}
      <section style={{ background: 'var(--color-primary-dark)', padding: '32px clamp(20px, 5vw, 80px)' }} aria-label="Trust statement">
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap', textAlign: 'center' }}>
          {[
            { icon: '🔒', text: 'No data collected. No login required.' },
            { icon: '✅', text: 'Data sourced from official state election sites.' },
            { icon: '📱', text: 'Works on any device, any browser.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
