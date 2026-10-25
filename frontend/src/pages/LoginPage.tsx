// LoginPage.tsx
import { AuthForm } from '../components/auth/AuthForm';

export function LoginPage() {
  return (
    <div className="px-6 py-10">
      <AuthForm mode="login" />
    </div>
  );
}