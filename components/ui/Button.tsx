'use client'
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', loading = false, icon, iconPosition = 'left', children, disabled, className = '', ...props }, ref) => {
  const base = 'relative inline-flex items-center justify-center gap-2 font-display font-semibold transition-[background-color,transform,box-shadow,opacity] duration-quick ease-reveta-reveal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:ring-offset-2 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.97]'
  const variants = { primary: 'bg-interactive-primary text-neutral-50 hover:bg-interactive-primary-hover hover:-translate-y-0.5 hover:shadow-[var(--reveta-shadow-float)]', secondary: 'bg-transparent border border-border-default text-text-primary hover:bg-neutral-800 hover:border-neutral-600 hover:-translate-y-0.5', ghost: 'bg-transparent text-text-secondary hover:bg-neutral-800 hover:text-text-primary', danger: 'bg-error text-neutral-50 hover:opacity-90 hover:-translate-y-0.5' }
  const sizes = { sm: 'h-8 px-reveta-3 text-t-09 rounded-component', md: 'h-10 px-reveta-4 text-t-08 rounded-component', lg: 'h-12 px-reveta-5 text-t-07 rounded-large' }
  return (
    <button ref={ref} disabled={disabled || loading} aria-busy={loading} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading && <span className="reveta-ingest-spinner shrink-0" aria-hidden="true" />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children && <span className={loading ? 'opacity-0' : ''}>{children}</span>}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0" aria-hidden="true">{icon}</span>}
    </button>
  )
})
Button.displayName = 'Button'
export default Button
