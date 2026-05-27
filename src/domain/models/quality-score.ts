export interface QualityScore {
  decision: "keep" | "reject";
  total: number;
  reusability: number;
  atomicity: number;
  novelty: number;
  actionability: number;
  reason: string;
}
