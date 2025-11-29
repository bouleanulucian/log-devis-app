import React from 'react';

interface EditableFieldProps {
  value: string | number;
  onChange: (value: any) => void;
  type?: 'text' | 'number' | 'date';
  className?: string;
  placeholder?: string;
  currency?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  value, 
  onChange, 
  type = 'text', 
  className = '', 
  placeholder,
  currency 
}) => {
  return (
    <div className="relative group w-full">
      {currency && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">{currency}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        className={`w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1 px-1 transition-colors ${currency ? 'pl-6' : ''} ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};