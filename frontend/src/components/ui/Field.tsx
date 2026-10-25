import type { InputHTMLAttributes } from 'react';
import { inputClass } from './styles';

type FieldProps = { id: string; label: string } & InputHTMLAttributes<HTMLInputElement>;

/** A labelled input. The label/id pairing keeps forms accessible and testable. */
export function Field({ id, label, ...inputProps }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input id={id} {...inputProps} className={inputClass} />
    </div>
  );
}