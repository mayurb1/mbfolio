const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '',
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = "font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:hover:bg-blue-600",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:hover:bg-red-600",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 disabled:hover:bg-green-600",
    ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 focus:ring-slate-500",
    outline: "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500"
  }
  
  const sizes = {
    xs: "px-2 py-1 text-xs min-h-[28px]",
    sm: "px-3 py-1.5 text-sm min-h-[32px]", 
    small: "px-3 py-1.5 text-sm min-h-[32px]",
    medium: "px-4 py-2 text-sm min-h-[36px]",
    large: "px-6 py-3 text-base min-h-[44px]"
  }

  return (
    <button 
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button