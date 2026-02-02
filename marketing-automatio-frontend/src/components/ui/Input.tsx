import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = ({ 
  label, 
  error, 
  helperText, 
  className, 
  id,
  ...props 
}: InputProps) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-3 border rounded-lg text-sm transition-colors',
          'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  // Password-specific props can be added here if needed
}

export const PasswordInput = (props: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-12', props.className)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-[42px] -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export const TextArea = ({ 
  label, 
  error, 
  helperText, 
  className,
  id,
  rows = 4,
  ...props 
}: TextAreaProps) => {
  const inputId = id || `textarea-${label?.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 border rounded-lg text-sm transition-colors resize-none',
          'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = ({ label, className, id, ...props }: CheckboxProps) => {
  const inputId = id || `checkbox-${label.toLowerCase().replace(/\s/g, '-')}`;

  return (
    <div className="flex items-center gap-2">
      <input
        id={inputId}
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-gray-300 text-indigo-600',
          'focus:ring-2 focus:ring-indigo-500',
          className
        )}
        {...props}
      />
      <label htmlFor={inputId} className="text-sm text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  );
};
