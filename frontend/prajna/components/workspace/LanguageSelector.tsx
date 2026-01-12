'use client';

import { useEffect, useRef, useState } from "react";

interface Language {
    label: string;
    value: string;
}

interface Props {
    value: string;
    onChange: (value: string) => void;
    options: Language[];
}

export function LanguageSelector({ value, onChange, options }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find((opt) => opt.value === value)?.label ?? value;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 hover:border-white/20 ${isOpen ? "border-accent/50 bg-white/10" : ""
                    }`}
            >
                <span>{selectedLabel}</span>
                <svg
                    className={`h-4 w-4 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1a1d24] p-1 shadow-xl ring-1 ring-black/50 backdrop-blur-xl">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${option.value === value
                                    ? "bg-accent/10 text-accent"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {option.label}
                            {option.value === value && (
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
