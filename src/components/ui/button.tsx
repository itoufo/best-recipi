import { type ButtonHTMLAttributes } from 'react'
import Link from 'next/link'

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

const variantStyles = {
  primary: 'bg-accent text-white hover:bg-accent-dark',
  secondary: 'bg-accent-secondary text-white hover:bg-accent-secondary-light',
  outline: 'border border-border text-foreground hover:bg-muted',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  ...buttonProps
}: ButtonProps) {
  const baseClass = `inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {children}
      </Link>
    )
  }

  return (
    <button className={baseClass} {...buttonProps}>
      {children}
    </button>
  )
}
