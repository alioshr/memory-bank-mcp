import { UpdateFileParams, UpdateFileUseCase } from "../../../domain/usecases/update-file.js";
import { QualityScore } from "../../../domain/models/quality-score.js";
import { ScoreMemory } from "../score-memory/score-memory.js";
import { QualityGateRejection } from "../write-file-gated/write-file-gated.js";

export type QualityGateLogger = (entry: object) => void;

export class UpdateFileGated implements UpdateFileUseCase {
  constructor(
    private readonly inner: UpdateFileUseCase,
    private readonly scorer: ScoreMemory,
    private readonly logger?: QualityGateLogger
  ) {}

  async updateFile(params: UpdateFileParams): Promise<string | null> {
    const score = this.scorer.score(params.content);

    if (this.logger) {
      this.logger({
        ...score,
        file: params.fileName,
        project: params.projectName,
        timestamp: new Date().toISOString(),
      });
    }

    if (score.decision === "reject") {
      throw new QualityGateRejection(score, this.scorer.getThreshold());
    }

    return this.inner.updateFile(params);
  }
}
