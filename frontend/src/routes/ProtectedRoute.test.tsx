import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { saveAuth } from '../lib/storage';
import { renderWithProviders } from '../test/utils';
import { ProtectedRoute } from './ProtectedRoute';

const tree = (
  <Routes>
    <Route path="/login" element={<p>Login page</p>} />
    <Route element={<ProtectedRoute />}>
      <Route path="/inventory" element={<p>Secret inventory</p>} />
    </Route>
  </Routes>
);

describe('ProtectedRoute', () => {
  it('redirects anonymous visitors to /login', () => {
    renderWithProviders(tree, { route: '/inventory' });

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret inventory')).not.toBeInTheDocument();
  });

  it('renders the page for signed-in users', () => {
    saveAuth({ token: 't', user: { id: '1', email: 'a@b.com', role: 'USER' } });
    renderWithProviders(tree, { route: '/inventory' });

    expect(screen.getByText('Secret inventory')).toBeInTheDocument();
  });
});