import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border border-[var(--border-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gradient-primary)] focus:border-transparent transition-colors bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]'
  
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : ''
  
  const classes = `${baseClasses} ${errorClasses} ${className}`
  
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-sm text-[var(--text-secondary)]">{helperText}</span>
      )}
    </div>
  )
}

export default Input