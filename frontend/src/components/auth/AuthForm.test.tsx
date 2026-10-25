import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { API_URL } from '../../api/client';
import { server } from '../../test/server';
import { renderWithProviders } from '../../test/utils';
import { AuthForm } from './AuthForm';

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
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json(
          { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
          { status: 401 },
        ),
      ),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
  });

  it('stores the session and redirects to the inventory on success', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          token: 'abc.def.ghi',
          user: { id: '1', email: 'jane@example.com', role: 'USER' },
        }),
      ),
    );
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