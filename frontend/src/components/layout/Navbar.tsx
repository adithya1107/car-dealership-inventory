import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { buttonStyles } from '../ui/styles';

const leftLinks = [
  { label: 'Home', to: '/' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Services', to: '/#services' },
];
const rightLinks = [
  { label: 'Feedback', to: '/#feedback' },
  { label: 'Blogs', to: '/#blogs' },
];

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  const { pathname } = useLocation();
  const active = !to.includes('#') && pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`text-sm transition hover:text-brand ${active ? 'font-semibold text-brand' : 'text-slate-600'}`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

    const accountArea = isAuthenticated ? (
    <>
      <span className="max-w-40 truncate text-sm text-slate-600" title={user?.email}>
        {user?.email}
      </span>
      {user?.role === 'ADMIN' && (
        <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
          Admin
        </span>
      )}
      <button
        type="button"
        className={`${buttonStyles('outline')} shrink-0 whitespace-nowrap`}
        onClick={() => {
          logout();
          close();
          navigate('/');
        }}
      >
        Log out
      </button>
    </>
  ) : (
    <>
      <Link to="/login" onClick={close} className="text-sm text-slate-600 hover:text-brand">
        Log in
      </Link>
      <Link to="/register" onClick={close} className={buttonStyles('brand')}>
        Register
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:grid lg:grid-cols-3">
        <ul className="hidden items-center gap-8 lg:flex">
          {leftLinks.map((l) => (
            <li key={l.label}>
              <NavItem {...l} />
            </li>
          ))}
        </ul>

        <Link to="/" className="text-xl font-bold tracking-wide lg:justify-self-center">
          CAR <span className="ml-1 text-sm font-semibold text-brand">DEALERSHIP</span>
        </Link>

        <div className="hidden items-center justify-end gap-6 lg:flex">
          {rightLinks.map((l) => (
            <NavItem key={l.label} {...l} />
          ))}
          {accountArea}
        </div>

        <button
          className="rounded-lg p-2 lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 px-6 py-5 lg:hidden">
          <ul className="flex flex-col gap-4">
            {[...leftLinks, ...rightLinks].map((l) => (
              <li key={l.label}>
                <NavItem {...l} onClick={close} />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-4">{accountArea}</div>
        </div>
      )}
    </header>
  );
}