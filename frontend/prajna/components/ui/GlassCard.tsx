
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
    return (
        <div
            className={twMerge(
                clsx(
                    "relative overflow-hidden rounded-2xl border border-white/10 bg-panel/60 p-8 backdrop-blur-xl shadow-card",
                    className
                )
            )}
            {...props}
        >
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity hover:opacity-100" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
