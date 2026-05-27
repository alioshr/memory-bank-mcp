import { beforeEach, describe, expect, test, vi } from "vitest";
import { UpdateFileGated } from "../../../../src/data/usecases/update-file-gated/update-file-gated.js";
import { QualityGateRejection } from "../../../../src/data/usecases/write-file-gated/write-file-gated.js";
import { ScoreMemory } from "../../../../src/data/usecases/score-memory/score-memory.js";
import { UpdateFileUseCase } from "../../../../src/domain/usecases/update-file.js";

describe("UpdateFileGated UseCase", () => {
  let sut: UpdateFileGated;
  let innerMock: UpdateFileUseCase;
  let scorer: ScoreMemory;

  beforeEach(() => {
    innerMock = {
      updateFile: vi.fn().mockResolvedValue("updated content"),
    };
    scorer = new ScoreMemory(0.5);
    sut = new UpdateFileGated(innerMock, scorer);
  });

  test("should delegate to inner UpdateFile when content passes the gate", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "PostgreSQL: always use EXPLAIN ANALYZE before optimizing queries; visual plans often mislead.",
    };

    const result = await sut.updateFile(params);

    expect(innerMock.updateFile).toHaveBeenCalledWith(params);
    expect(result).toBe("updated content");
  });

  test("should throw QualityGateRejection when content fails the gate", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "Agent answered the user's question with confidence today.",
    };

    await expect(sut.updateFile(params)).rejects.toThrow(QualityGateRejection);
    expect(innerMock.updateFile).not.toHaveBeenCalled();
  });

  test("should not throw for good content", async () => {
    const params = {
      projectName: "test-project",
      fileName: "memory.md",
      content: "In Docker multi-stage builds, always copy only the final artifact; never copy node_modules from the build stage.",
    };

    await expect(sut.updateFile(params)).resolves.toBe("updated content");
  });
});
