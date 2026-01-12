"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
    const router = useRouter();

    // Step 1: Verify Identity
    const [step, setStep] = useState<1 | 2>(1);

    // Form States
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    // Step 2: Reset Password
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post("/password-reset/verify/", { username, email });
            setToken(data.token);
            setSuccessMessage("Identity verified! Please set your new password.");
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/password-reset/confirm/", { token, new_password: password });
            setSuccessMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Reset failed. Token may be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md perspective-1000"
            >
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-sm text-muted hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span>←</span> Back to Login
                    </button>
                </div>

                <GlassCard className="relative overflow-hidden">
                    <div className="mt-8 mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h1>
                        <p className="mt-2 text-muted">
                            {step === 1
                                ? 'Verify your identity to proceed'
                                : 'Enter your new password below'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="verify-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifySubmit}
                                className="space-y-4"
                            >
                                <Input
                                    label="Username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full cursor-pointer" isLoading={loading}>
                                    Verify Identity
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="reset-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleResetSubmit}
                                className="space-y-4"
                            >
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full cursor-pointer" isLoading={loading}>
                                    Reset Password
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-sm text-danger text-center bg-danger/10 py-2 rounded-lg border border-danger/20"
                        >
                            {error}
                        </motion.p>
                    )}

                    {successMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 text-sm text-green-400 text-center bg-green-400/10 py-2 rounded-lg border border-green-400/20"
                        >
                            {successMessage}
                        </motion.p>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
}
