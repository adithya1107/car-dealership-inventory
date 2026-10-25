import type { ButtonHTMLAttributes } from 'react';
import { ChevronRight } from 'lucide-react';
import { buttonStyles, type ButtonVariant } from './styles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Adds the ">" arrow used by the Figma CTAs. */
  withArrow?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'navy',
  withArrow = false,
  loading = false,
  type = 'button',
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button {...rest} type={type} disabled={disabled || loading} className={buttonStyles(variant, className)}>
      {loading ? 'Please wait…' : children}
      {withArrow && !loading && <ChevronRight size={16} aria-hidden="true" />}
    </button>
  );
}