// ============================================
// SELECT COMPONENT
// ============================================

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
        
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={cn(
                        'w-full px-3 py-2 border rounded-lg text-sm',
                        'transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-[#D04A02] focus:border-transparent',
                        'bg-white appearance-none cursor-pointer',
                        'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")]',
                        'bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10',
                        error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 hover:border-gray-400',
                        'disabled:bg-gray-100 disabled:cursor-not-allowed',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
