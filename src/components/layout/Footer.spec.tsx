import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import Footer from './Footer';

describe('Footer component', () => {
  it('renders copyright text with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`©\\s*${year}.*Fruitzy.*All rights reserved\\.`))
    ).toBeInTheDocument();
  });

  it('renders About Contact FAQ', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /faqs/i })).toBeInTheDocument();
  });

  it('renders links with correct href and color', () => {
    render(<Footer />);
    const aboutLink = screen.getByRole('link', { name: /about/i });
    const contactLink = screen.getByRole('link', { name: /contact/i });
    const faqsLink = screen.getByRole('link', { name: /faqs/i });

    [aboutLink, contactLink, faqsLink].forEach(link => {
      expect(link).toHaveAttribute('href', '/');  
      expect(link).toHaveStyle('color: inherit'); 
    });
  });
});
