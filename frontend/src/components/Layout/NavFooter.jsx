import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, Calendar, ClipboardList, Map, Home } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',             label: 'Home',         Icon: Home,          exact: true },
  { to: '/timeline',     label: 'Timeline',     Icon: Calendar },
  { to: '/guide',        label: 'Voter Guide',  Icon: ClipboardList },
  { to: '/find-polling', label: 'Find Polling', Icon: Map },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
      role="banner"
    >
      <nav
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} aria-label="Election Guide home">
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
            🗳️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary-dark)', lineHeight: 1.1, fontFamily: 'Merriweather, serif' }}>
              Election Guide
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
              2026 Midterms
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav" role="menubar">
          {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              role="menuitem"
              aria-label={`Navigate to ${label}`}
            >
              <Icon size={15} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* CTA */}
        <Link to="/guide" className="btn btn-primary btn-sm" style={{ display: 'none' }} id="nav-cta" aria-label="Get started with voter guide">
          Get Started
        </Link>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center' }}
          className="mobile-menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={22} color="var(--color-primary)" /> : <Menu size={22} color="var(--color-primary)" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border-light)', background: 'white' }}
            role="menu"
          >
            <div style={{ padding: '12px clamp(16px, 4vw, 40px) 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_ITEMS.map(({ to, label, Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ justifyContent: 'flex-start' }}
                  role="menuitem"
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 640px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          #nav-cta { display: inline-flex !important; }
        }
        @media (max-width: 639px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </header>
  );
}

export function Footer() {
  return (
    <footer style={{ background: 'var(--color-primary-dark)', color: 'rgba(255,255,255,0.7)', padding: 'clamp(32px, 5vw, 48px) clamp(20px, 5vw, 80px)', marginTop: 'auto' }} role="contentinfo">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: '1.25rem' }}>🗳️</span>
              <span style={{ fontFamily: 'Merriweather, serif', fontWeight: 700, color: 'white', fontSize: '1.0625rem' }}>Election Guide</span>
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.7, maxWidth: 240 }}>
              Helping Americans navigate the voting process with accurate, state-specific guidance.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: 12, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Navigate</div>
            {NAV_ITEMS.slice(1).map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 8, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: 12, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Official Resources</div>
            {[
              { href: 'https://vote.gov', label: 'vote.gov' },
              { href: 'https://www.usa.gov/absentee-voting', label: 'Absentee Voting (USA.gov)' },
              { href: 'https://ballotpedia.org', label: 'Ballotpedia' },
              { href: 'https://www.usa.gov/voter-registration', label: 'Voter Registration' },
            ].map(link => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: 8 }}
                onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.65)'}>
                ↗ {link.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.8rem' }}>© 2026 Election Guide. Educational purposes only. Verify deadlines with your official state election office.</span>
          <span style={{ fontSize: '0.8rem' }}>🇺🇸 Your vote matters.</span>
        </div>
      </div>
    </footer>
  );
}
