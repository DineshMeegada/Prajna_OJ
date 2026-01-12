'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "@/lib/axios";

type ExecutionPhase = "idle" | "running" | "completed" | "error";
type TabType = "Description" | "Solution" | "Submissions" | "AI Review";

interface CompilerContextValue {
  language: string;
  setLanguage: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  input: string;
  setInput: (value: string) => void;
  output: string;
  statusLabel: string;
  executionTime: number | null;
  phase: ExecutionPhase;
  isRunning: boolean;
  errorMessage: string | null;
  runCode: () => Promise<void>;
  submissionStatus: string;
  submitCode: (problemUuid: string) => Promise<void>;
  submissionResult?: any;
  closeSubmissionResult?: () => void;
  aiReviewResult: string;
  isReviewing: boolean;
  requestAiReview: () => Promise<void>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  remainingAiReviews: number | null;
}

// ... types

const CompilerContext = createContext<CompilerContextValue | null>(null);

const DEFAULT_PYTHON = "# Write your solution here\n";
const DEFAULT_CPP = "// Write your solution here\n";

export function CompilerProvider({ children, problemUuid }: { children: ReactNode; problemUuid?: string }) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_PYTHON);
  const [input, setInput] = useState("");
  // ... (other states remain same)
  const [output, setOutput] = useState("");
  const [statusLabel, setStatusLabel] = useState("Ready");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [phase, setPhase] = useState<ExecutionPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>("Description");
  const [remainingAiReviews, setRemainingAiReviews] = useState<number | null>(null);

  const [submissionStatus, setSubmissionStatus] = useState<string>("Ready");
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Persistence Logic
  const storageKey = useMemo(() => {
    const id = problemUuid || 'playground';
    return `code_${id}_${language}`;
  }, [problemUuid, language]);

  // Load code on mount or key change
  useEffect(() => {
    const savedCode = localStorage.getItem(storageKey);
    if (savedCode) {
      setCode(savedCode);
    } else {
      // Set default if nothing saved
      if (language === "python") setCode(DEFAULT_PYTHON);
      else if (language === "cpp") setCode(DEFAULT_CPP);
    }
  }, [storageKey, language]);

  // Save code on change (debounced slightly by nature of React updates, but for strictness we use useEffect)
  useEffect(() => {
    localStorage.setItem(storageKey, code);
  }, [code, storageKey]);


  const runCode = useCallback(async () => {
    // ... (rest of runCode implementation)
    setPhase("running");
    setStatusLabel("Running code...");
    setErrorMessage(null);
    setOutput("");
    setExecutionTime(null);
    setSubmissionResult(null);

    try {
      const response = await api.post('/compiler/execute/', {
        code,
        language,
        input_data: input,
      });

      const payload = response.data as {
        status?: string;
        output?: string | { output?: string; status?: string; time_ms?: number };
        time_ms?: number;
      };

      // Handle nested output structure if present
      let finalOutput = "";
      let finalStatus = "Completed";
      let finalTime: number | null = null;

      if (typeof payload.output === "object" && payload.output !== null) {
        finalOutput = payload.output.output ?? "";
        finalStatus = payload.output.status ?? payload.status ?? "Completed";
        finalTime = payload.output.time_ms ?? payload.time_ms ?? null;
      } else {
        finalOutput = payload.output ?? "";
        finalStatus = payload.status ?? "Completed";
        finalTime = payload.time_ms ?? null;
      }

      setOutput(finalOutput);
      setStatusLabel(finalStatus);
      setExecutionTime(finalTime);
      setPhase("completed");
    } catch (error: any) {
      setPhase("error");
      setStatusLabel("Execution failed");
      setOutput("");
      setExecutionTime(null);
      const msg = error.response?.data?.output || error.message || "Unknown error";
      setErrorMessage(msg);
    }
  }, [code, input, language]);

  const pollSubmission = useCallback(async (submissionId: number) => {
    // ... (rest of pollSubmission implementation same as before)
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/compiler/submission/${submissionId}/`);
        const data = res.data;
        const status = data.status;

        if (['AC', 'WA', 'TLE', 'RE', 'CE', 'IE'].includes(status)) {
          clearInterval(interval);
          setSubmissionStatus(status);
          setPhase("completed");
          setSubmissionResult({
            status: status,
            message: data.output || (status === 'AC' ? "All cases passed" : "Submission Failed"),
            passedCases: data.passed_cases,
            totalCases: data.total_cases,
            time: data.time,
            memory: data.memory
          });
        } else {
          setSubmissionStatus(status); // P or R
        }
      } catch (err) {
        console.error("Polling error", err);
        clearInterval(interval);
        setSubmissionStatus("Error");
      }
    }, 2000);
  }, []);

  const submitCode = useCallback(async (problemUuidRaw: string) => {
    // Use the passed uuid or the one from props (though button passes it usually)
    // Actually submitCode takes an argument in the context definition.
    // We will keep using the argument directly.
    setPhase("running");
    setSubmissionStatus("Submitting...");
    setSubmissionResult(null);

    try {
      const response = await api.post('/compiler/submit/', {
        code,
        language,
        problem_uuid: problemUuidRaw,
      });

      const data = response.data;
      setSubmissionStatus("Pending");
      pollSubmission(data.submission_id);

    } catch (error: any) {
      setPhase("error");
      setSubmissionStatus("Error");
      const msg = error.response?.data?.message || error.message || "Submission failed";
      setErrorMessage(msg);
    }
  }, [code, language, pollSubmission]);


  const [aiReviewResult, setAiReviewResult] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  // Load AI review from local storage
  useEffect(() => {
    if (problemUuid) {
      const savedReview = localStorage.getItem(`ai-review-${problemUuid}`);
      if (savedReview) {
        setAiReviewResult(savedReview);
      } else {
        setAiReviewResult("");
      }
    }
  }, [problemUuid]);

  const requestAiReview = useCallback(async () => {
    if (!problemUuid) return;
    setIsReviewing(true);
    try {
      const response = await api.post('/compiler/ai-review/', {
        code,
        language,
        problem_uuid: problemUuid
      });

      const review = response.data.review;
      const remaining = response.data.remaining_requests;

      setRemainingAiReviews(remaining);
      setAiReviewResult(review);
      localStorage.setItem(`ai-review-${problemUuid}`, review);

    } catch (error: any) {
      // Handle error (maybe set error message in existing state or new one)
      const msg = error.response?.data?.message || "Failed to get AI review";
      console.error(msg); // For now
      // Maybe set a temporary error in result
      setAiReviewResult("### ⚠️ Error\nFailed to fetch AI review. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  }, [code, language, problemUuid]);


  const value = useMemo(
    () => ({
      language,
      setLanguage,
      code,
      setCode,
      input,
      setInput,
      output,
      statusLabel,
      executionTime,
      phase,
      isRunning: phase === "running",
      errorMessage,
      runCode,
      submissionStatus,
      submitCode,
      submissionResult,
      closeSubmissionResult: () => setSubmissionResult(null),
      aiReviewResult,
      isReviewing,
      requestAiReview,
      activeTab,
      setActiveTab,
      remainingAiReviews,
    }),
    [code, errorMessage, executionTime, input, language, output, phase, runCode, statusLabel, submissionStatus, submitCode, submissionResult, aiReviewResult, isReviewing, requestAiReview, activeTab, remainingAiReviews]
  );

  return (
    <CompilerContext.Provider value={value}>
      {children}
    </CompilerContext.Provider>
  );
}

export function useCompiler() {
  const context = useContext(CompilerContext);
  if (!context) {
    throw new Error("useCompiler must be used inside <CompilerProvider />");
  }
  return context;
}


