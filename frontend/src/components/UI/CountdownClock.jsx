import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CountdownClock({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculate = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true });
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        passed:  false,
      });
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  const units = [
    { label: 'Days',    value: timeLeft.days },
    { label: 'Hours',   value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div role="timer" aria-label="Countdown to Election Day" className="flex items-end gap-3 md:gap-5 flex-wrap justify-center">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-end gap-3 md:gap-5">
          <div className="countdown-unit">
            <AnimatePresence mode="wait">
              <motion.span
                key={unit.value}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2 }}
                className="countdown-number"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <span className="countdown-label">{unit.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="countdown-separator">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
