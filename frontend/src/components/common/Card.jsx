import React from 'react';

const Card = ({ title, children, className = '', headerContent = null }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">{title}</h3>
          {headerContent}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;