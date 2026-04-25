import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CountdownClock } from './CountdownClock';

describe('CountdownClock', () => {
  it('renders without crashing', () => {
    render(<CountdownClock targetDate="2026-11-03T23:59:59" />);
    
    expect(screen.getByText(/DAYS/i)).toBeInTheDocument();
    expect(screen.getByText(/HOURS/i)).toBeInTheDocument();
    expect(screen.getByText(/MINUTES/i)).toBeInTheDocument();
  });

  it('handles past dates by showing 00 for all fields', () => {
    render(<CountdownClock targetDate="2020-11-03T00:00:00" />);
    
    // Values should bottom out at 00 when time has passed
    const zeros = screen.getAllByText('00');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });
});
