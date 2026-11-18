import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, disabled, label, description, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={generatedId}
        className={cn(
          'inline-flex items-start gap-2.5 cursor-pointer select-none text-left',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={generatedId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-4.5 h-4.5 rounded-md border transition-all flex items-center justify-center',
              checked
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'border-slate-300 bg-white hover:border-slate-400',
              'focus-within:ring-2 focus-within:ring-indigo-500/30'
            )}
          >
            {checked && <Check className="w-3.2 h-3.2 stroke-[3]" />}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-medium text-slate-800 leading-tight">{label}</span>}
            {description && <span className="text-xs text-slate-500 mt-0.5">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
