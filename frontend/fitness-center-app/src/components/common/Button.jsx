import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  onClick,
  className = '',
  disabled = false,
  isLoading = false,
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };

  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading} 
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        rounded-md flex items-center justify-center gap-2
        ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props} // isLoading özelliğini burada aktarmıyoruz, sadece geçerli props'ları aktarıyoruz
    >
      {/* Yükleme durumunda bir gösterge ekleyelim */}
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;