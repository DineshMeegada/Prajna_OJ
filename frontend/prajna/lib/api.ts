import api from "@/lib/axios";
import { ProblemDetail, ProblemSummary } from "@/types/problems"; // Assuming these types exist

export async function fetchProblems(): Promise<ProblemSummary[]> {
  const { data } = await api.get<ProblemSummary[]>('/problems');
  return data;
}

export async function fetchProblemDetail(id: string): Promise<ProblemDetail> {
  const { data } = await api.get<ProblemDetail>(`/problems/${id}`);
  return data;
}

export async function fetchUserSubmissions(problemUuid: string): Promise<any[]> {
  const { data } = await api.get<any[]>(`/compiler/submissions/?problem_uuid=${problemUuid}`);
  return data;
}
