import { WriteFile } from "../../../data/usecases/write-file/write-file.js";
import { WriteFileGated } from "../../../data/usecases/write-file-gated/write-file-gated.js";
import { ScoreMemory } from "../../../data/usecases/score-memory/score-memory.js";
import { WriteFileUseCase } from "../../../domain/usecases/write-file.js";
import { FsFileRepository } from "../../../infra/filesystem/index.js";
import { FsProjectRepository } from "../../../infra/filesystem/repositories/fs-project-repository.js";
import { env } from "../../config/env.js";
import { loadQualityGateConfig } from "../../config/quality-gate.js";
import { makeJsonlLogger } from "./quality-gate-logger.js";

export const makeWriteFile = (): WriteFileUseCase => {
  const projectRepository = new FsProjectRepository(env.rootPath);
  const fileRepository = new FsFileRepository(env.rootPath);
  const base = new WriteFile(fileRepository, projectRepository);

  const gateConfig = loadQualityGateConfig();
  if (!gateConfig.enabled) return base;

  const scorer = new ScoreMemory(gateConfig.threshold);
  const logger = gateConfig.logPath ? makeJsonlLogger(gateConfig.logPath) : undefined;
  return new WriteFileGated(base, scorer, logger);
};
