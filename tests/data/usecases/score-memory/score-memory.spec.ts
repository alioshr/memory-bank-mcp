import { describe, expect, test } from "vitest";
import { ScoreMemory } from "../../../../src/data/usecases/score-memory/score-memory.js";

describe("ScoreMemory UseCase", () => {
  const sut = new ScoreMemory(0.5);

  describe("should KEEP good memories", () => {
    const keepExamples = [
      "Avalonia DataGrid is a separate NuGet package; must dotnet add package Avalonia.Controls.DataGrid before using it.",
      "Salesforce: always check field-level security after an Apex deploy; profile/permset changes do not deploy automatically with classes.",
      "Never accept 'done' claims without independent verification: build success, targeted tests, and requirement-by-requirement pass/fail.",
      "Prefer streaming generators over building a full list when the input may be larger than memory.",
      "Windows PowerShell 5.1 reads .ps1 files as ANSI unless they have a UTF-8 BOM; use ASCII separators in script literals to avoid mojibake.",
      "When a Vitest mock returns undefined, check that mockResolvedValue was called before the test exercises the SUT.",
      "In TypeScript, use satisfies for compile-time checks without widening the inferred type.",
      "Always pin GitHub Actions to a full commit SHA, not a tag; tags are mutable.",
      "PostgreSQL VACUUM FULL rewrites the table and requires an ACCESS EXCLUSIVE lock; prefer regular VACUUM on production.",
      "MuleSoft DataWeave: flatMap is not available in Mule 3; use flatten after map instead.",
    ];

    keepExamples.forEach((text, i) => {
      test(`keep example ${i + 1}: "${text.slice(0, 60)}..."`, () => {
        const result = sut.score(text);
        expect(result.decision).toBe("keep");
        expect(result.total).toBeGreaterThanOrEqual(0.5);
      });
    });
  });

  describe("should REJECT junk memories", () => {
    const rejectExamples = [
      { text: "Session started 2026-05-26 at 09:00 on office-pc.", category: "boot-noise" },
      { text: "Currently reading file src/foo.ts at line 42; about to scroll down.", category: "transient-state" },
      { text: "User is named John, works at Acme Corp, is 35 years old, and lives in Seattle.", category: "hallucinated-profile" },
      { text: "Code quality matters and we should care about it more.", category: "vague-truism" },
      { text: "Agent answered the user's question with confidence today.", category: "self-referential" },
      { text: "ok sounds good", category: "empty-agreement" },
      { text: "Thanks! Let me know if you need anything else.", category: "greeting" },
      { text: "I provided an excellent solution to the problem.", category: "self-praise" },
      { text: "Deploy completed at 14:32.", category: "status-ping" },
      { text: "Certainly! I'd be happy to help with that.", category: "filler" },
    ];

    rejectExamples.forEach(({ text, category }, i) => {
      test(`reject example ${i + 1} (${category}): "${text.slice(0, 50)}..."`, () => {
        const result = sut.score(text);
        expect(result.decision).toBe("reject");
        expect(result.total).toBeLessThan(0.5);
        expect(result.reason).not.toBe("");
      });
    });
  });

  describe("score dimensions", () => {
    test("empty content is rejected", () => {
      const result = sut.score("");
      expect(result.decision).toBe("reject");
      expect(result.reason).toBe("empty content");
    });

    test("whitespace-only content is rejected", () => {
      const result = sut.score("   \n  ");
      expect(result.decision).toBe("reject");
    });

    test("reusability penalizes timestamps", () => {
      const result = sut.score("Fixed the bug 2026-05-26 and deployed.");
      expect(result.reusability).toBeLessThan(0);
    });

    test("reusability penalizes machine names", () => {
      const result = sut.score("Running on office-pc with 16GB RAM.");
      expect(result.reusability).toBeLessThan(0);
    });

    test("atomicity rewards single sentences", () => {
      const result = sut.score("Always validate input at system boundaries.");
      expect(result.atomicity).toBeGreaterThan(0);
    });

    test("atomicity penalizes long compound content", () => {
      const result = sut.score(
        "First do this. Then do that. Also check the other thing. And verify the result. Finally deploy."
      );
      expect(result.atomicity).toBeLessThan(0);
    });

    test("actionability rewards specific practices", () => {
      const result = sut.score("Always run mkdocs --strict before pushing docs changes.");
      expect(result.actionability).toBeGreaterThan(0);
    });

    test("novelty is stubbed at 0", () => {
      const result = sut.score("Some content here.");
      expect(result.novelty).toBe(0);
    });
  });
});
