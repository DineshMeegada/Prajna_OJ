"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { RiUser3Line, RiLogoutBoxLine, RiCodeBoxLine, RiHome4Line, RiMenu3Line, RiCloseLine } from 'react-icons/ri';

export default function Navbar() {
    const { user, logout, isAuthenticated, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-strong shadow-[0_0_15px_rgba(0,255,204,0.3)] transition-all group-hover:shadow-[0_0_25px_rgba(0,255,204,0.5)]">
                        <span className="font-bold text-black text-lg">P</span>
                    </div>
                    <span className="text-lg font-bold tracking-wider text-white">PRAJNA</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link href="/" className="text-sm font-medium text-muted transition-colors hover:text-white">
                        Home
                    </Link>
                    <Link href="/problems" className="text-sm font-medium text-muted transition-colors hover:text-white">
                        Problems
                    </Link>
                    <Link href="/compiler" className="text-sm font-medium text-muted transition-colors hover:text-white">
                        Compiler
                    </Link>
                </div>

                {/* Desktop Auth */}
                <div className="hidden items-center gap-4 md:flex">
                    {!isLoading && (
                        isAuthenticated && user ? (
                            <div className="relative">
                                <button
                                    onClick={toggleProfile}
                                    className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-1 pr-4 transition-all hover:bg-white/10 hover:border-accent/30"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                                        <RiUser3Line />
                                    </div>
                                    <span className="text-sm font-medium text-white">{user.username}</span>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-panel-dark/95 p-1 shadow-xl backdrop-blur-xl z-50"
                                            >
                                                <Link
                                                    href="/dashboard"
                                                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-white"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <RiUser3Line className="text-lg" />
                                                    Profile
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsProfileOpen(false);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                                                >
                                                    <RiLogoutBoxLine className="text-lg" />
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button variant="primary" className="h-9 px-6 rounded-full text-sm">
                                    Sign In
                                </Button>
                            </Link>
                        )
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
                >
                    {isMenuOpen ? <RiCloseLine className="text-xl" /> : <RiMenu3Line className="text-xl" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/90 px-6 py-4 backdrop-blur-xl md:hidden overflow-hidden"
                    >
                        <div className="flex flex-col gap-4">
                            <Link href="/" className="text-sm font-medium text-white" onClick={() => setIsMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href="/problems" className="text-sm font-medium text-muted" onClick={() => setIsMenuOpen(false)}>
                                Problems
                            </Link>
                            <Link href="/compiler" className="text-sm font-medium text-muted" onClick={() => setIsMenuOpen(false)}>
                                Compiler
                            </Link>
                            <div className="h-px bg-white/10 my-2" />
                            {isAuthenticated ? (
                                <>
                                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-white" onClick={() => setIsMenuOpen(false)}>
                                        <RiUser3Line /> Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 text-sm font-medium text-danger"
                                    >
                                        <RiLogoutBoxLine /> Logout
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="primary" className="w-full justify-center">Sign In</Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
