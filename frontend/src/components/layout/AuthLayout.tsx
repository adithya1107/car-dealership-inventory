import { ArrowLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

/** Bare layout for login and register: no navbar or footer, just a way back home. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <Link
        to="/"
        className="mx-auto mb-6 flex w-full max-w-5xl items-center gap-2 text-sm text-slate-600 transition hover:text-brand"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to home
      </Link>

      <main id="main" className="flex flex-1 items-center justify-center">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}