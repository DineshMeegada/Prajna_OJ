
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const [requestReason, setRequestReason] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);
    const [myRequests, setMyRequests] = useState<any[]>([]);
    const [requestError, setRequestError] = useState('');
    const [requestSuccess, setRequestSuccess] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        if (user) {
            fetchMyRequests();
        }
    }, [user]);

    const fetchMyRequests = async () => {
        try {
            const { data } = await api.get('/my-requests/');
            // Handle pagination (if DRF pagination is enabled, results are in data.results)
            if (Array.isArray(data)) {
                setMyRequests(data);
            } else if (data && Array.isArray(data.results)) {
                setMyRequests(data.results);
            } else {
                setMyRequests([]);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestLoading(true);
        setRequestError('');
        setRequestSuccess('');

        try {
            await api.post('/request-master/', { request_reason: requestReason });
            setRequestSuccess('Request submitted successfully!');
            setRequestReason('');
            fetchMyRequests();
        } catch (error: any) {
            setRequestError(error.response?.data?.non_field_errors?.[0] || "Failed to submit request.");
        } finally {
            setRequestLoading(false);
        }
    };

    if (isLoading || !user) {
        return <div className="min-h-screen flex items-center justify-center text-accent animate-pulse">Loading workspace...</div>;
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Profile Section</h1>
                    <p className="text-muted">Manage your account and contributions, <span className="text-accent">{user.username}</span></p>
                </div>
                <div className="flex gap-4">
                    {user.role === 'ADMIN' && (
                        <Button onClick={() => router.push('/admin/requests')} variant="secondary" className="cursor-pointer">
                            Admin Panel
                        </Button>
                    )}
                    <Button onClick={logout} variant="danger" className="bg-danger/10 hover:bg-danger/20 cursor-pointer">
                        Logout
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <GlassCard className="h-full">
                    <h2 className="text-2xl font-bold text-white mb-6">User Details</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 transition-colors cursor-default">
                                <label className="text-xs uppercase tracking-wider text-muted/50">Role</label>
                                <p className="text-xl font-mono text-accent mt-1">{user.role}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 transition-colors cursor-default">
                                <label className="text-xs uppercase tracking-wider text-muted/50">Email</label>
                                <p className="text-sm font-mono text-white mt-1 truncate">{user.email}</p>
                            </div>
                            {/* Add more stats here later */}
                        </div>
                    </div>
                </GlassCard>

                {/* Master Access Request Form */}
                {user.role === 'CODER' && (
                    <div className="h-full relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-accent-strong rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <GlassCard className="h-full relative bg-black/40">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-6">Request Master Access</h2>
                            <form onSubmit={handleRequestAccess} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted">Why do you want to contribute?</label>
                                    <textarea
                                        className="w-full h-32 rounded-lg bg-panel-dark/80 border border-white/10 px-4 py-3 text-white focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all resize-none placeholder:text-muted/30"
                                        placeholder="I have solved 500 problems on LeetCode..."
                                        value={requestReason}
                                        onChange={(e) => setRequestReason(e.target.value)}
                                        required
                                    />
                                </div>

                                {requestError && <p className="text-danger text-sm bg-danger/10 p-2 rounded border border-danger/20">{requestError}</p>}
                                {requestSuccess && <p className="text-accent text-sm bg-accent/10 p-2 rounded border border-accent/20">{requestSuccess}</p>}

                                <Button type="submit" isLoading={requestLoading} variant="primary" className="w-full cursor-pointer shadow-lg shadow-accent/10 hover:shadow-accent/20">
                                    Submit Request
                                </Button>
                            </form>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* Request History */}
            <GlassCard>
                <h2 className="text-2xl font-bold text-white mb-6">Access Request History</h2>
                {myRequests.length === 0 ? (
                    <p className="text-muted text-center py-8">No requests found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left">
                                    <th className="py-4 px-4 text-xs uppercase tracking-wider text-muted/50">ID</th>
                                    <th className="py-4 px-4 text-xs uppercase tracking-wider text-muted/50">Status</th>
                                    <th className="py-4 px-4 text-xs uppercase tracking-wider text-muted/50">Date</th>
                                    <th className="py-4 px-4 text-xs uppercase tracking-wider text-muted/50">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {myRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 font-mono text-sm text-muted">#{req.id}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${req.status === 'APPROVED' ? 'bg-accent/10 text-accent border-accent/20' :
                                                req.status === 'REJECTED' ? 'bg-danger/10 text-danger border-danger/20' :
                                                    'bg-warning/10 text-warning border-warning/20'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-muted">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-muted max-w-xs truncate">
                                            {req.request_reason}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
