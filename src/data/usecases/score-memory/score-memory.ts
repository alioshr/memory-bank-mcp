import { QualityScore } from "../../../domain/models/quality-score.js";

const REUSABILITY_NEGATIVE_PATTERNS: RegExp[] = [
  /\b(today|yesterday|tomorrow|just now)\b/i,
  /\b(at|on)\s+\d{1,2}[:.]\d{2}\b/i,
  /\b20\d{2}-\d{2}-\d{2}\b/,
  /\b(office-pc|workstation|laptop-\w+)\b/i,
  /\bline\s+\d+\b/i,
  /\bsrc\/[a-zA-Z0-9_./-]+/,
  /\bfeature\/[a-zA-Z0-9._-]+/,
  /\bsprint-?\d+\b/i,
  /\b(named|aged?\s+\d+|years old|lives in)\b/i,
  /\bacme\b|\bcustomer-\w+\b/i,
];

const ACTIONABILITY_NEGATIVE_PATTERNS: RegExp[] = [
  /\b(matters|important|should care|we should)\b.*\b(about|more)\b/i,
  /^(ok|okay|sounds good|got it|sure|yes|no|right|exactly|agreed)\b/i,
  /\b(agent|assistant|I provided|I helped|I answered|I gave)\b/i,
  /^(thanks|thank you|hello|hi there|hey|let me know|cheers)\b/i,
  /\b(excellent|perfect|great job|well done|I did a great)\b/i,
  /\bI'm\s+\d+%\s+(sure|confident|certain)\b/i,
  /^(certainly|absolutely|of course|happy to help)\b/i,
  /\b(deploy(ed|ing)?|push(ed|ing)?|commit(ted|ting)?)\s+(at|on)\s+\d/i,
  /\b(status|state|progress):\s/i,
  /^\s*-\s+\w+\s*$/,
];

const ACTIONABILITY_POSITIVE_PATTERNS: RegExp[] = [
  /\b(must|always|never|avoid|prefer|use|ensure)\b.*\b[A-Za-z]{3,}/i,
  /:\s+\S/,
  /\b(package|module|library|gem|crate|pip|npm|nuget|cargo)\b/i,
  /\b(error|bug|fix|workaround|gotcha|caveat|trap|pitfall)\b/i,
  /;\s+\b(use|prefer|avoid|check|run|set|add|ensure)\b/i,
];

export class ScoreMemory {
  constructor(private readonly threshold: number = 0.5) {}

  score(content: string): QualityScore {
    const text = content.trim();
    if (!text) {
      return {
        decision: "reject",
        total: -1,
        reusability: 0,
        atomicity: 0,
        novelty: 0,
        actionability: -1,
        reason: "empty content",
      };
    }

    const reusability = this.scoreReusability(text);
    const atomicity = this.scoreAtomicity(text);
    const novelty = 0.0;
    const actionability = this.scoreActionability(text);
    const total = reusability + atomicity + novelty + actionability;
    const decision = total >= this.threshold ? "keep" : "reject";
    const reason =
      decision === "reject"
        ? this.buildReason(reusability, atomicity, actionability)
        : "";

    return { decision, total, reusability, atomicity, novelty, actionability, reason };
  }

  getThreshold(): number {
    return this.threshold;
  }

  private scoreReusability(text: string): number {
    let hits = 0;
    for (const pattern of REUSABILITY_NEGATIVE_PATTERNS) {
      if (pattern.test(text)) hits++;
    }
    if (hits > 0) return -1.0;
    return 0.3;
  }

  private scoreAtomicity(text: string): number {
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const count = sentences.length;
    if (count <= 1) return 0.3;
    if (count <= 3) return 0.1;
    return -0.5;
  }

  private scoreActionability(text: string): number {
    for (const pattern of ACTIONABILITY_NEGATIVE_PATTERNS) {
      if (pattern.test(text)) return -1.0;
    }

    let score = 0.0;
    for (const pattern of ACTIONABILITY_POSITIVE_PATTERNS) {
      if (pattern.test(text)) {
        score += 0.25;
      }
    }
    return Math.min(score, 0.5);
  }

  private buildReason(
    reusability: number,
    atomicity: number,
    actionability: number
  ): string {
    const parts: string[] = [];
    if (reusability < 0) parts.push(`reusability=${reusability}`);
    if (atomicity < 0) parts.push(`atomicity=${atomicity}`);
    if (actionability < 0) parts.push(`actionability=${actionability}`);
    return parts.join(", ") || `total below threshold (${this.threshold})`;
  }
}
