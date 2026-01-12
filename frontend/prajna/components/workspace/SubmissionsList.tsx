'use client';

import { useEffect, useState, useCallback } from "react";
import { fetchUserSubmissions } from "@/lib/api";
import { FiCode, FiCheck, FiX, FiClock, FiAlertCircle } from "react-icons/fi";
import { CodeViewModal } from "./CodeViewModal";
import { useCompiler } from "./CompilerProvider";

interface Submission {
    id: number;
    status: string;
    language: string;
    timestamp: string;
    time: number | null;
    memory: number | null;
    passed_cases: number;
    total_cases: number;
    code: string;
}

interface Props {
    problemUuid: string;
}

export function SubmissionsList({ problemUuid }: Props) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState<{ code: string; language: string } | null>(null);
    const { submissionStatus } = useCompiler(); // To trigger refresh on new submission

    const loadSubmissions = useCallback(async () => {
        try {
            const data = await fetchUserSubmissions(problemUuid);
            setSubmissions(data);
        } catch (e) {
            console.error("Failed to load submissions", e);
        } finally {
            setLoading(false);
        }
    }, [problemUuid]);

    useEffect(() => {
        loadSubmissions();
    }, [loadSubmissions, submissionStatus]); // Reload when submissionStatus changes

    if (loading) {
        return <div className="text-white/50 p-4">Loading submissions...</div>;
    }

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-white/5 p-4 mb-4 text-white/20">
                    <FiCode size={24} />
                </div>
                <h3 className="text-lg font-medium text-white">No submissions yet</h3>
                <p className="text-sm text-white/50">
                    Run your code to see results here.
                </p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        if (['AC', 'Accepted'].includes(status)) return "text-green-400";
        if (['WA', 'Wrong Answer', 'RE', 'Runtime Error'].includes(status)) return "text-red-400";
        return "text-yellow-400";
    };

    const getStatusIcon = (status: string) => {
        if (['AC', 'Accepted'].includes(status)) return <FiCheck />;
        if (['WA', 'Wrong Answer', 'RE', 'Runtime Error'].includes(status)) return <FiX />;
        return <FiClock />;
    };

    return (
        <>
            <div className="space-y-3 pb-8">
                {submissions.map((sub) => (
                    <div
                        key={sub.id}
                        className="group flex flex-col gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-white/10 hover:bg-white/10"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ${getStatusColor(sub.status)}`}>
                                    {getStatusIcon(sub.status)}
                                </div>
                                <div>
                                    <div className={`text-sm font-bold ${getStatusColor(sub.status)}`}>
                                        {sub.status === "AC" ? "Accepted" : sub.status === "WA" ? "Wrong Answer" : sub.status}
                                    </div>
                                    <div className="text-xs text-white/40">
                                        {new Date(sub.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedCode({ code: sub.code, language: sub.language })}
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
                            >
                                View Code
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-white/30">Language</span>
                                <span className="text-xs font-medium text-white/70">{sub.language}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-white/30">Time</span>
                                <span className="text-xs font-medium text-white/70">
                                    {sub.time ? `${(sub.time * 1000).toFixed(0)} ms` :
                                        (sub.status === 'AC' ? "< 10 ms" : "-")}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-white/30">Testcases</span>
                                <span className="text-xs font-medium text-white/70">
                                    {sub.status === 'AC' || sub.status === 'Accepted' ? (
                                        <span className="text-green-400">All Passed</span>
                                    ) : sub.status === 'P' || sub.status === 'R' ? (
                                        <span className="text-blue-400 animate-pulse">Running...</span>
                                    ) : sub.passed_cases > 0 ? (
                                        `${sub.passed_cases} / ${sub.total_cases} Passed`
                                    ) : (
                                        <span className="text-white/30">None Passed</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CodeViewModal
                isOpen={!!selectedCode}
                onClose={() => setSelectedCode(null)}
                code={selectedCode?.code || ""}
                language={selectedCode?.language || "python"}
            />
        </>
    );
}
