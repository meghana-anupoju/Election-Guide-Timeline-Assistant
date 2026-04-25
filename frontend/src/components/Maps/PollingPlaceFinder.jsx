import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ExternalLink, AlertCircle, Map, Navigation } from 'lucide-react';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export function PollingPlaceFinder({ stateData }) {
  const [zip, setZip] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [mapMode, setMapMode] = useState('embed'); // 'embed' | 'places'

  const handleSearch = (e) => {
    e.preventDefault();
    if (zip.trim().length >= 4) setSubmitted(zip.trim());
  };

  const mapsSearchUrl = MAPS_API_KEY
    ? `https://www.google.com/maps/embed/v1/search?key=${MAPS_API_KEY}&q=polling+place+near+${submitted}&zoom=13`
    : `https://www.google.com/maps/embed?pb=!4v1&q=polling+places+near+${submitted}`;

  const mapsLinkUrl = `https://www.google.com/maps/search/polling+place+near+${submitted}`;
  const voteGovLink = `https://vote.gov/polling-place/`;
  const stateLink = stateData?.polling_place_url;

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            id="zip-search"
            type="text"
            value={zip}
            onChange={e => setZip(e.target.value)}
            placeholder="Enter your ZIP code (e.g., 30301)"
            maxLength={10}
            className="state-search-input"
            aria-label="ZIP code search"
            style={{ paddingLeft: 44 }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={zip.trim().length < 4}
          aria-label="Find polling places near this ZIP code"
          style={{ flexShrink: 0 }}
        >
          <Navigation size={16} /> Find
        </button>
      </form>

      {/* Additional quick links */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <a
          href={voteGovLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          aria-label="Find polling place on vote.gov"
        >
          <ExternalLink size={13} /> vote.gov Finder
        </a>
        {stateLink && (
          <a
            href={stateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            aria-label={`${stateData?.name || 'State'} official polling place finder`}
          >
            <MapPin size={13} /> {stateData?.name || 'State'} Official Site
          </a>
        )}
        {submitted && (
          <a
            href={mapsLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-calendar btn-sm"
            aria-label="Open Google Maps search"
          >
            <Map size={13} /> Open in Google Maps
          </a>
        )}
      </div>

      {/* Map Panel */}
      <div className="map-container">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="map-placeholder"
              style={{ height: 400 }}
              aria-label="Map will appear after ZIP code search"
            >
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                🗺️
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Enter your ZIP code above
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: 300 }}>
                  We'll search for polling places, early voting centers, and drop boxes near you.
                </div>
              </div>
            </motion.div>
          ) : MAPS_API_KEY ? (
            <motion.iframe
              key={submitted}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              src={mapsSearchUrl}
              width="100%"
              height="450"
              style={{ border: 'none', display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Polling places near ${submitted}`}
              aria-label={`Google Maps showing polling places near ZIP code ${submitted}`}
            />
          ) : (
            /* Fallback when no API key: show info card + direct link  */
            <motion.div
              key="no-key"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ padding: 32, height: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center' }}
            >
              <span style={{ fontSize: '3rem' }}>📍</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-text-primary)', marginBottom: 8 }}>
                  Polling Places Near {submitted}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: 400, lineHeight: 1.6 }}>
                  Click below to search Google Maps for polling places, or use your state's official finder for the most accurate results.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href={mapsLinkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <Map size={16} /> Search Google Maps
                </a>
                {stateLink && (
                  <a href={stateLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <ExternalLink size={15} /> {stateData?.name} Official Finder
                  </a>
                )}
              </div>
              <div style={{ padding: '10px 16px', background: 'rgba(180, 83, 9, 0.07)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(180, 83, 9, 0.2)', display: 'flex', gap: 8, alignItems: 'flex-start', maxWidth: 360 }}>
                <AlertCircle size={14} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.775rem', color: 'var(--color-warning)', lineHeight: 1.5 }}>
                  To embed an interactive map, add your Google Maps API key to <code>.env</code> as <code>VITE_GOOGLE_MAPS_API_KEY</code>.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {[
          { icon: '🔍', tip: 'Your polling place may not be the closest one—always confirm before Election Day.' },
          { icon: '📋', tip: 'Bring your valid ID. Requirements vary by state.' },
          { icon: '⏰', tip: 'If you\'re in line by closing time, you have the legal right to vote.' },
          { icon: '♿', tip: 'All polling places must provide accessibility accommodations.' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-light)' }}>
            <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
