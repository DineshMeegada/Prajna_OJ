'use client';

import { useCompiler } from "./CompilerProvider";
import { SubmissionResult } from "./SubmissionResult";
import { AnimatePresence } from "framer-motion";

export function SubmissionResultManager() {
    const { submissionResult, closeSubmissionResult } = useCompiler();

    return (
        <AnimatePresence>
            {submissionResult && (
                <SubmissionResult
                    status={submissionResult.status}
                    message={submissionResult.message}
                    passedCases={submissionResult.passedCases}
                    totalCases={submissionResult.totalCases}
                    time={submissionResult.time}
                    memory={submissionResult.memory}
                    onClose={closeSubmissionResult}
                />
            )}
        </AnimatePresence>
    );
}
