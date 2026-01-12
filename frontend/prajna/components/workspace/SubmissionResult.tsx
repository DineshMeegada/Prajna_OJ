'use client';

import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiClock, FiAlertOctagon } from "react-icons/fi";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface Props {
    status: string; // AC, WA, TLE, RE, CE, IE
    message?: string;
    passedCases?: number;
    totalCases?: number;
    time?: number | null;
    memory?: number | null;
    onClose?: () => void;
}

export function SubmissionResult({ status, message, passedCases, totalCases, time, memory, onClose }: Props) {
    const isSuccess = status === 'AC' || status === 'Accepted';

    useEffect(() => {
        if (isSuccess) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults, particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults, particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isSuccess]);

    const getIcon = () => {
        if (isSuccess) return <FiCheckCircle className="w-16 h-16 text-green-400" />;
        if (status === 'TLE' || status === 'Time Limit Exceeded') return <FiClock className="w-16 h-16 text-yellow-400" />;
        if (status === 'CE' || status === 'Compile Error') return <FiAlertTriangle className="w-16 h-16 text-yellow-400" />;
        if (status === 'RE' || status === 'Runtime Error') return <FiAlertOctagon className="w-16 h-16 text-red-400" />;
        return <FiXCircle className="w-16 h-16 text-red-400" />;
    };

    const getTitle = () => {
        if (status === 'AC' || status === 'Accepted') return 'Accepted';
        if (status === 'WA' || status === 'Wrong Answer') return 'Wrong Answer';
        if (status === 'TLE' || status === 'Time Limit Exceeded') return 'Time Limit Exceeded';
        if (status === 'CE' || status === 'Compile Error') return 'Compilation Error';
        if (status === 'RE' || status === 'Runtime Error') return 'Runtime Error';
        return 'Submission Failed';
    };

    const getColor = () => {
        if (isSuccess) return "bg-green-500/10 border-green-500/20";
        if (status === 'TLE' || status === 'CE' || status === 'Compile Error' || status === 'Time Limit Exceeded') return "bg-yellow-500/10 border-yellow-500/20";
        return "bg-red-500/10 border-red-500/20";
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-8 text-center`}
        >
            <div className={`p-8 rounded-3xl border ${getColor()} max-w-lg w-full flex flex-col items-center shadow-2xl relative`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition"
                >
                    <FiXCircle size={24} />
                </button>

                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="mb-6"
                >
                    {getIcon()}
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {getTitle()}
                </h2>

                {passedCases !== undefined && totalCases !== undefined && (
                    <div className="mt-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70">
                        {passedCases} / {totalCases} Testcases Passed
                    </div>
                )}

                {message && (
                    <div className="bg-black/30 w-full p-4 rounded-xl border border-white/5 mb-6 text-sm font-mono text-white/80 overflow-auto max-h-40 whitespace-pre-wrap text-left">
                        {message}
                    </div>
                )}

                <div className="flex gap-8 mb-6 text-white/60">
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-wider mb-1">Runtime</span>
                        <span className="font-mono text-lg text-white">
                            {time ? `${(time * 1000).toFixed(0)} ms` : "N/A"}
                        </span>
                    </div>
                    {/* Memory would go here if available */}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition shadow-lg active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
