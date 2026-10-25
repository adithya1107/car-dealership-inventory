// RegisterPage.tsx
import { AuthForm } from '../components/auth/AuthForm';

export function RegisterPage() {
  return (
    <div className="px-6 py-10">
      <AuthForm mode="register" />
    </div>
  );
}