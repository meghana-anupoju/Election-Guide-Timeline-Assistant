import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MapPin, X } from 'lucide-react';

export function StateSelector({ states, value, onChange, disabled = false, placeholder = 'Search for your state...' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = states.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.abbreviation.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => { if (!containerRef.current?.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (state) => {
    onChange(state);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }} aria-label="State selector">
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '14px 16px',
          border: `2px solid ${isOpen ? 'var(--color-primary-light)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          background: disabled ? 'var(--color-surface-2)' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 4px rgba(35, 83, 160, 0.12)' : 'none',
          transition: 'all var(--transition-fast)',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <MapPin size={18} color="var(--color-text-muted)" />
        {value ? (
          <span style={{ flex: 1, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            🏛️ {value.name}
          </span>
        ) : (
          <span style={{ flex: 1, color: 'var(--color-text-muted)' }}>{placeholder}</span>
        )}
        {value ? (
          <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }} aria-label="Clear selection">
            <X size={16} color="var(--color-text-muted)" />
          </button>
        ) : (
          <ChevronDown size={18} color="var(--color-text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: 'white', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden', marginTop: 6,
            }}
            role="listbox"
            aria-label="State list"
          >
            {/* Search within dropdown */}
            <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Search size={16} color="var(--color-text-muted)" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Type to search..."
                  style={{
                    border: 'none', outline: 'none', flex: 1,
                    fontSize: '0.9375rem', color: 'var(--color-text-primary)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  aria-label="Search states"
                />
              </div>
            </div>
            {/* State list */}
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  No states found for "{query}"
                </div>
              ) : (
                filtered.map(state => (
                  <button
                    key={state.id}
                    onClick={() => handleSelect(state)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '11px 16px',
                      background: value?.id === state.id ? 'rgba(26, 58, 107, 0.08)' : 'transparent',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      fontFamily: 'Inter, sans-serif', fontSize: '0.9375rem',
                      color: value?.id === state.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: value?.id === state.id ? 600 : 400,
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={e => { if (value?.id !== state.id) e.currentTarget.style.background = 'var(--color-surface-2)'; }}
                    onMouseLeave={e => { if (value?.id !== state.id) e.currentTarget.style.background = 'transparent'; }}
                    role="option"
                    aria-selected={value?.id === state.id}
                  >
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                      {state.abbreviation}
                    </span>
                    {state.name}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
