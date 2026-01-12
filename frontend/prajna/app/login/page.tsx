
"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const { loginWithCredentials, signup, googleLogin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Signup State
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                // tokenResponse.access_token is the one we need for Google Login adapter
                await googleLogin(tokenResponse.access_token);
                const next = searchParams.get('next') || '/dashboard';
                router.push(next);
            } catch (err) {
                setError('Google login failed. Please try again.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google login failed.'),
    });

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginWithCredentials(username, password);
            const next = searchParams.get('next') || '/dashboard';
            router.push(next);
        } catch (err: any) {
            setError(err.response?.data?.non_field_errors?.[0] || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (signupPassword !== signupConfirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await signup({
                username: signupUsername,
                email: signupEmail,
                password1: signupPassword,
                password2: signupConfirmPassword
            });
            const next = searchParams.get('next') || '/dashboard';
            router.push(next);
        } catch (err: any) {
            // Handle various error formats from DRF
            const data = err.response?.data;
            let msg = 'Signup failed. Please try again.';
            if (data) {
                if (data.username) msg = `Username: ${data.username[0]}`;
                else if (data.email) msg = `Email: ${data.email[0]}`;
                else if (data.password) msg = `Password Error: ${data.password.join(' ')}`; // Handle array of password errors
                else if (data.non_field_errors) msg = data.non_field_errors[0];
                else if (data.detail) msg = data.detail; // Generic DRF error
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md perspective-1000"
            >
                <GlassCard className="overflow-hidden relative">
                    <div className="mb-8 text-center">
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login-header"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Welcome Back</h1>
                                    <p className="mt-2 text-muted">Sign in to continue your coding journey</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup-header"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-strong bg-clip-text text-transparent">Join Prajna</h1>
                                    <p className="mt-2 text-muted">Begin your path to mastery</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-6">
                        <Button
                            className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-white/90"
                            onClick={() => handleGoogleLogin()}
                            isLoading={loading}
                            variant="secondary"
                        >
                            <FcGoogle className="text-xl" />
                            <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-panel px-2 text-muted/50">Or with email</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.form
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleLoginSubmit}
                                    className="space-y-4"
                                >
                                    <Input
                                        label="Username"
                                        type="text"
                                        placeholder="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => router.push('/forgot-password')} className="text-xs text-accent hover:text-accent-strong transition-colors cursor-pointer" suppressHydrationWarning>Forgot password?</button>
                                    </div>
                                    <Button type="submit" className="w-full cursor-pointer" isLoading={loading}>
                                        Sign In
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="signup-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleSignupSubmit}
                                    className="space-y-4"
                                >
                                    <Input
                                        label="Username"
                                        type="text"
                                        placeholder="username"
                                        value={signupUsername}
                                        onChange={(e) => setSignupUsername(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="testuser@gmail.com"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={signupConfirmPassword}
                                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" className="w-full cursor-pointer" isLoading={loading}>
                                        Create Account
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-danger text-center bg-danger/10 py-2 rounded-lg border border-danger/20"
                            >
                                {error}
                            </motion.p>
                        )}

                        <div className="text-center text-sm text-muted">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button onClick={toggleMode} className="text-accent hover:text-accent-strong font-medium transition-colors cursor-pointer" suppressHydrationWarning>
                                {isLogin ? "Sign up" : "Sign in"}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
