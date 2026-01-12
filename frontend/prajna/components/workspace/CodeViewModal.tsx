'use client';

import { Editor } from "@monaco-editor/react";
import { FiX, FiCopy, FiCheck } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    code: string;
    language: string;
}

export function CodeViewModal({ isOpen, onClose, code, language }: Props) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
                            <h3 className="text-lg font-medium text-white">Submission Code</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${copied
                                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                                            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {copied ? <FiCheck /> : <FiCopy />}
                                    {copied ? "Copied!" : "Copy Code"}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white transition"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="h-[60vh] w-full">
                            <Editor
                                height="100%"
                                language={language.toLowerCase()}
                                value={code}
                                theme="vs-dark"
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    padding: { top: 16, bottom: 16 },
                                    lineNumbers: 'on',
                                    renderLineHighlight: 'none',
                                }}
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
