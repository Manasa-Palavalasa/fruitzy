import React from 'react';
import { render, screen } from '@testing-library/react';
import * as AuthContext from '../contexts/AuthContext';
import { useRole } from './useRole.hooks';

const TestComponent = () => {
  const { isAdmin, isUser } = useRole();

  return (
    <div>
      <div data-testid="isAdmin">{String(isAdmin)}</div>
      <div data-testid="isUser">{String(isUser)}</div>
    </div>
  );
};

describe('useRole', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns nulls when isLoading is true', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      role: null,
      isLoading: true,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
      isAdmin: false,
    });

    render(<TestComponent />);
    expect(screen.getByTestId('isAdmin').textContent).toBe('null');
    expect(screen.getByTestId('isUser').textContent).toBe('null');
  });

  it('returns isAdmin = true when role is admin', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      role: 'admin',
      isLoading: false,
      token: null,
      login: function (): void {
        throw new Error('Function not implemented.');
      },
      logout: function (): void {
        throw new Error('Function not implemented.');
      },
      isAdmin: null
    });

    render(<TestComponent />);
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    expect(screen.getByTestId('isUser').textContent).toBe('false');
  });

  it('returns isUser = true when role is user', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      role: 'user',
      isLoading: false,
      token: null,
      login: function (): void {
        throw new Error('Function not implemented.');
      },
      logout: function (): void {
        throw new Error('Function not implemented.');
      },
      isAdmin: null
    });

    render(<TestComponent />);
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    expect(screen.getByTestId('isUser').textContent).toBe('true');
  });

  it('returns false for both when role is unknown', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      // @ts-expect-error Deliberately exercise an invalid runtime role.
      role: 'guest',
      isLoading: false,
    });

    render(<TestComponent />);
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
    expect(screen.getByTestId('isUser').textContent).toBe('false');
  });
});


