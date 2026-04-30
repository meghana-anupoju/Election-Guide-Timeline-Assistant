import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import React from 'react';

// Mock matchMedia to fix potential JSDOM issues
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe('App Component', () => {
  it('renders the Navbar', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders the main content area', () => {
    const { container } = render(<App />);
    expect(container.querySelector('div[style*="flex: 1"]')).toBeInTheDocument();
  });
});
