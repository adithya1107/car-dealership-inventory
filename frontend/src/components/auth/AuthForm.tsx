import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/error';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = mode === 'login';

  // ProtectedRoute stores where the visitor was heading; send them back there.
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search}` : '/inventory';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) return setError('Please enter a valid email address.');
    if (!isLogin && password.length < 8) return setError('Password must be at least 8 characters.');

    setSubmitting(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
      {/* Decorative panel, hidden on small screens */}
      <div className="relative hidden flex-col justify-between bg-navy p-10 text-white md:flex">
        <p className="text-sm uppercase tracking-widest text-white/60">Car Dealership</p>
        <img src="/images/hero/audi.png" alt="" className="my-8 w-full object-contain drop-shadow-2xl" />
        <p className="text-2xl font-semibold leading-snug">
          Find your dream <span className="text-red-400">car</span> in a few clicks.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 p-8 sm:p-12">
        <div>
          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin ? 'Log in to browse and buy vehicles.' : 'Register to start browsing the inventory.'}
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand">
            {error}
          </p>
        )}

        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" variant="brand" loading={submitting} className="w-full">
          {isLogin ? 'Log in' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          {isLogin ? 'New here? ' : 'Already registered? '}
          <Link to={isLogin ? '/register' : '/login'} state={location.state} className="font-medium text-brand hover:underline">
            {isLogin ? 'Create an account' : 'Log in'}
          </Link>
        </p>
      </form>
    </div>
  );
}