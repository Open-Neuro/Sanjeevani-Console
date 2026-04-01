import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

type ButtonProps = {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  variant = 'primary',
  icon,
  fullWidth = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-pharmlyGreen text-white hover:bg-teal-700 border-transparent',
    secondary: 'bg-pharmlyLightGreen text-pharmlyGreen hover:bg-amber-100 border-transparent',
    danger: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
    outline: 'bg-transparent text-pharmlyGreen border-pharmlyGreen hover:bg-gray-50',
  };

  return (
    <button
      className={twMerge(
        `flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
        border ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''}`,
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
