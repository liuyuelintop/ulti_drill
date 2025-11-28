import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-br from-primary-500 to-primary-600
    text-white
    font-semibold
    border-none
    shadow-lg shadow-primary-500/20
    hover:shadow-xl hover:shadow-primary-500/30
  `,
  secondary: `
    bg-white
    text-slate-700
    border border-slate-200
    shadow-sm
    hover:bg-slate-50
    hover:border-slate-300
    hover:text-slate-900
  `,
  success: `
    bg-gradient-to-br from-emerald-500 to-emerald-600
    text-white
    font-semibold
    border-none
    shadow-lg shadow-emerald-500/20
  `,
  danger: `
    bg-white
    text-red-600
    border border-red-200
    hover:bg-red-50
    hover:border-red-300
    shadow-sm
  `,
  ghost: `
    bg-transparent
    text-slate-500 
    hover:text-slate-900
    border border-transparent
    hover:bg-slate-100
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-[18px] py-[10px] text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-medium
  rounded-lg
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
  disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
  hover:-translate-y-[1px]
  active:translate-y-0
  select-none
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      children,
      className = '',
      disabled,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const combinedClassName = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
