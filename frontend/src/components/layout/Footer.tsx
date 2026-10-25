import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const columns: { title: string; links: [string, string][] }[] = [
  {
    title: 'Buying & Selling',
    links: [
      ['Find A Car', '/inventory'],
      ['Listings By City', '/inventory'],
      ['Sell Your Car', '/inventory'],
      ['Compare Side By Side', '/inventory'],
    ],
  },
  {
    title: 'Resource',
    links: [
      ['Blog', '/#blogs'],
      ['Guides', '/#blogs'],
      ['FAQ', '/'],
      ['Help Center', '/'],
    ],
  },
  {
    title: 'About',
    links: [
      ['Company', '/'],
      ['Career', '/'],
      ['Contact', '/'],
    ],
  },
];

const socials = [
  { label: 'X (Twitter)', text: 'X', color: 'bg-sky-500', href: 'https://x.com' },
  { label: 'Facebook', text: 'f', color: 'bg-blue-700', href: 'https://facebook.com' },
  { label: 'LinkedIn', text: 'in', color: 'bg-blue-600', href: 'https://linkedin.com' },
];

export function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');

  // Front-end only: there is no newsletter endpoint in the spec.
  function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) return toast.error('Please enter a valid email address.');
    toast.success('Thanks for subscribing!');
    setEmail('');
  }

  return (
    <footer className="bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <h2 className="text-sm font-semibold">Subscribe To The Newsletter</h2>
          <form onSubmit={subscribe} className="mt-4 flex max-w-sm items-center rounded-full bg-white p-1.5 shadow-sm">
            <label htmlFor="newsletter" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="grid size-10 place-items-center rounded-full bg-brand text-white hover:bg-brand-dark"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </form>
          <div className="mt-6 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className={`grid size-8 place-items-center rounded-full text-xs font-bold text-white ${s.color}`}
              >
                {s.text}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-6 pb-8 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Car Dealership</p>
        <p className="flex gap-6">
          <span>Terms Of Service</span>
          <span>Privacy Policy</span>
          <span>Trust &amp; Safety</span>
        </p>
      </div>
    </footer>
  );
}