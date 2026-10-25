import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/utils';
import { AuthForm } from './AuthForm';

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock('../../api/auth', () => ({
  login: loginMock,
  register: vi.fn(),
}));

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<AuthForm mode="login" />} />
      <Route path="/register" element={<AuthForm mode="register" />} />
      <Route path="/inventory" element={<p>Inventory page</p>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('AuthForm (login)', () => {
  it('shows the server error when credentials are wrong', async () => {
    loginMock.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        response: {
          data: { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        },
      }),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('stores the session and redirects to the inventory on success', async () => {
    loginMock.mockResolvedValue({
      token: 'abc.def.ghi',
      user: { id: '1', email: 'jane@example.com', role: 'USER' },
    });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Passw0rd!123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Inventory page')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('dealership.auth')!).token).toBe('abc.def.ghi');
  });
});

describe('AuthForm (register)', () => {
  it('rejects a short password without calling the API', async () => {
    renderWithProviders(<AuthForm mode="register" />);

    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);
  });
});