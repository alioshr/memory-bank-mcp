import { beforeEach, describe, expect, test, vi } from "vitest";
import { WriteFileGated, QualityGateRejection } from "../../../../src/data/usecases/write-file-gated/write-file-gated.js";
import { ScoreMemory } from "../../../../src/data/usecases/score-memory/score-memory.js";
import { WriteFileUseCase } from "../../../../src/domain/usecases/write-file.js";

describe("WriteFileGated UseCase", () => {
  let sut: WriteFileGated;
  let innerMock: WriteFileUseCase;
  let scorer: ScoreMemory;
  let logEntries: object[];

  beforeEach(() => {
    innerMock = {
      writeFile: vi.fn().mockResolvedValue("written content"),
    };
    scorer = new ScoreMemory(0.5);
    logEntries = [];
    sut = new WriteFileGated(innerMock, scorer, (entry) => logEntries.push(entry));
  });

  test("should delegate to inner WriteFile when content passes the gate", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "Always validate input at system boundaries; never trust external data without sanitization.",
    };

    const result = await sut.writeFile(params);

    expect(innerMock.writeFile).toHaveBeenCalledWith(params);
    expect(result).toBe("written content");
  });

  test("should throw QualityGateRejection when content fails the gate", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "Session started 2026-05-26 at 09:00 on office-pc.",
    };

    await expect(sut.writeFile(params)).rejects.toThrow(QualityGateRejection);
    expect(innerMock.writeFile).not.toHaveBeenCalled();
  });

  test("should include score details in rejection error", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "ok sounds good",
    };

    try {
      await sut.writeFile(params);
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(QualityGateRejection);
      const rejection = e as QualityGateRejection;
      expect(rejection.score.decision).toBe("reject");
      expect(rejection.message).toContain("Quality gate rejected");
      expect(rejection.message).toContain("Reformulate");
    }
  });

  test("should log keep decisions", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "Never use SELECT * in production queries; always specify columns explicitly.",
    };

    await sut.writeFile(params);

    expect(logEntries).toHaveLength(1);
    expect(logEntries[0]).toHaveProperty("decision", "keep");
    expect(logEntries[0]).toHaveProperty("file", "memory.md");
    expect(logEntries[0]).toHaveProperty("project", "test-project");
    expect(logEntries[0]).toHaveProperty("timestamp");
  });

  test("should log reject decisions", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "Thanks! Let me know if you need anything else.",
    };

    try {
      await sut.writeFile(params);
    } catch {
      // expected
    }

    expect(logEntries).toHaveLength(1);
    expect(logEntries[0]).toHaveProperty("decision", "reject");
  });

  test("should work without a logger", async () => {
    const noLogSut = new WriteFileGated(innerMock, scorer);
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "Always pin dependencies to exact versions in production Dockerfiles.",
    };

    const result = await noLogSut.writeFile(params);
    expect(result).toBe("written content");
  });
});
