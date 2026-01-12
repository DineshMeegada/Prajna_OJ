export type Difficulty = "Easy" | "Medium" | "Hard" | string;

export interface ProblemSummary {
  id: number;
  uuid: string;
  title: string;
  difficulty: Difficulty;
  created_by: number | string;
  created_at: string;
}

export interface ProblemDetail extends ProblemSummary {
  statement: string;
}

