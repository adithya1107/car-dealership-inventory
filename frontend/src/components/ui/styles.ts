export type ButtonVariant = 'navy' | 'brand' | 'outline' | 'danger';

const variants: Record<ButtonVariant, string> = {
  navy: 'bg-navy text-white hover:bg-navy-light',
  brand: 'bg-brand text-white hover:bg-brand-dark',
  outline: 'border border-slate-300 bg-white text-navy hover:border-brand hover:text-brand',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

/** Shared by <Button> and by <Link>s that should look like buttons. */
export const buttonStyles = (variant: ButtonVariant = 'navy', extra = ''): string =>
  `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${extra}`.trim();

export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';