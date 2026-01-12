
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium text-muted/80 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent-strong/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500 will-change-transform" />
                    <input
                        ref={ref}
                        className={twMerge(
                            clsx(
                                "relative w-full rounded-lg bg-panel-dark/80 border border-white/10 px-4 py-3 text-white placeholder-white/20 transition-all duration-200",
                                "focus:border-accent/50 focus:bg-panel-dark focus:outline-none focus:ring-1 focus:ring-accent/50",
                                "disabled:opacity-50",
                                error && "border-danger/50 focus:border-danger focus:ring-danger/50",
                                className
                            )
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-danger ml-1">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";
