import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer Component', () => {
  const renderFooter = () => {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  };

  it('renders the branding logo and description', () => {
    renderFooter();
    const description = screen.getByText(/The definitive platform for tracking/i);
    expect(description).toBeInTheDocument();
  });

  it('renders all platform navigation links', () => {
    renderFooter();
    const links = ['Home', 'Leaderboard', 'Pollution Map', 'Pollution Reports', 'Volunteers', 'My Achievements'];
    links.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('renders contact information correctly', () => {
    renderFooter();
    expect(screen.getByText(/hello@pureocean.org/i)).toBeInTheDocument();
    expect(screen.getByText(/\+94 11 234 5678/i)).toBeInTheDocument();
  });

  it('displays the current year in the copyright notice', () => {
    renderFooter();
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear, 'i'))).toBeInTheDocument();
  });
});
