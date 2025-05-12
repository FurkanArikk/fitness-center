import React from 'react';

const Card = ({ 
  children, 
  title,
  action,
  className = '',
  contentClassName = '',
  noPadding = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {title && (
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">{title}</h3>
          {action && action}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4'} ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;