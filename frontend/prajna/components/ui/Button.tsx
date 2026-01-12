
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = ({ children, className, variant = 'primary', size = 'md', isLoading, ...props }: ButtonProps) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
        primary: "bg-accent text-panel hover:bg-accent-strong focus:ring-accent shadow-[0_0_20px_-5px_var(--color-accent)] hover:shadow-[0_0_25px_-5px_var(--color-accent)]",
        secondary: "bg-white/10 text-white hover:bg-white/20 focus:ring-white/50 border border-white/10",
        danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 focus:ring-danger",
        ghost: "bg-transparent text-muted hover:text-white hover:bg-white/5 focus:ring-white/20",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </span>
            ) : children}
        </motion.button>
    );
};
