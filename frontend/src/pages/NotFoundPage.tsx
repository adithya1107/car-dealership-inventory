import { Link } from 'react-router-dom';
import { buttonStyles } from '../components/ui/styles';

export function NotFoundPage() {
  return (
    <div className="px-6 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This road leads nowhere</h1>
      <Link to="/" className={buttonStyles('navy', 'mt-8')}>
        Back to home
      </Link>
    </div>
  );
}