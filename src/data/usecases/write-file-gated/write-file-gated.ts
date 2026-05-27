import { WriteFileParams, WriteFileUseCase } from "../../../domain/usecases/write-file.js";
import { QualityScore } from "../../../domain/models/quality-score.js";
import { ScoreMemory } from "../score-memory/score-memory.js";

export type QualityGateLogger = (entry: object) => void;

export class WriteFileGated implements WriteFileUseCase {
  constructor(
    private readonly inner: WriteFileUseCase,
    private readonly scorer: ScoreMemory,
    private readonly logger?: QualityGateLogger
  ) {}

  async writeFile(params: WriteFileParams): Promise<string | null> {
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

    return this.inner.writeFile(params);
  }
}

export class QualityGateRejection extends Error {
  constructor(
    public readonly score: QualityScore,
    public readonly threshold: number
  ) {
    super(
      `Quality gate rejected (score: ${score.total.toFixed(2)}, threshold: ${threshold}). ` +
      `Reason: ${score.reason}. ` +
      `Reformulate the memory to be more reusable, atomic, and actionable.`
    );
    this.name = "QualityGateRejection";
  }
}
