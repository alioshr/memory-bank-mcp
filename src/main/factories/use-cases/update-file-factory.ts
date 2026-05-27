import { UpdateFile } from "../../../data/usecases/update-file/update-file.js";
import { UpdateFileGated } from "../../../data/usecases/update-file-gated/update-file-gated.js";
import { ScoreMemory } from "../../../data/usecases/score-memory/score-memory.js";
import { UpdateFileUseCase } from "../../../domain/usecases/update-file.js";
import { FsFileRepository } from "../../../infra/filesystem/index.js";
import { FsProjectRepository } from "../../../infra/filesystem/repositories/fs-project-repository.js";
import { env } from "../../config/env.js";
import { loadQualityGateConfig } from "../../config/quality-gate.js";
import { makeJsonlLogger } from "./quality-gate-logger.js";

export const makeUpdateFile = (): UpdateFileUseCase => {
  const projectRepository = new FsProjectRepository(env.rootPath);
  const fileRepository = new FsFileRepository(env.rootPath);
  const base = new UpdateFile(fileRepository, projectRepository);

  const gateConfig = loadQualityGateConfig();
  if (!gateConfig.enabled) return base;

  const scorer = new ScoreMemory(gateConfig.threshold);
  const logger = gateConfig.logPath ? makeJsonlLogger(gateConfig.logPath) : undefined;
  return new UpdateFileGated(base, scorer, logger);
};
