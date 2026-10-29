import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { items: [{ quantity: 3 }] } }),
}));

const mockPush = jest.fn();
const mockLogout = jest.fn();

function setup({ token = 'token', role = 'user' }: { token?: string; role?: string } = {}) {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (useAuth as jest.Mock).mockReturnValue({ token, role, logout: mockLogout });
  return render(<Header />);
}

describe('Header', () => {
  beforeEach(() => {
    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));
    jest.clearAllMocks();
  });

  it('renders logo and title', () => {
    setup();
    expect(screen.getAllByText('Fruitzy')[0]).toBeInTheDocument();
  });


  it('shows Products button', () => {
    setup();
    expect(screen.getByRole('button', { name: /products/i })).toBeInTheDocument();
  });

  it('navigates to /products when Products is clicked', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /products/i }));
    expect(mockPush).toHaveBeenCalledWith('/products');
  });

  it('shows cart icon and badge for user role', () => {
    setup({ token: 'token', role: 'user' });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByRole('button').some(btn => btn.textContent?.includes('3'))).toBe(true);
  });

  it('shows admin menu for admin role', () => {
    setup({ token: 'token', role: 'admin' });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows user menu when avatar is clicked', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout on logout menu click', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('navigates to profile page from menu', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    fireEvent.click(screen.getByText('Profile'));
    expect(mockPush).toHaveBeenCalledWith('/user/profile');
  });

  it('mobile drawer opens when menu icon clicked', () => {
    window.innerWidth = 400;
    window.dispatchEvent(new Event('resize'));
    setup();
    fireEvent.click(screen.getAllByRole('button')[0]); 
    expect(screen.getAllByText('Products')[0]).toBeInTheDocument();
  });
});