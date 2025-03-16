import { WriteFileUseCase } from "../../../domain/usecases/write-file.js";
import { WriteError } from "../../errors/index.js";
import {
  Controller,
  Request,
  Response,
  Validator,
} from "../../protocols/index.js";

export interface WriteRequest {
  projectName: string;
  fileName: string;
  content: string;
}

export type WriteResponse = string;

export {
  Controller,
  Request,
  Response,
  Validator,
  WriteError,
  WriteFileUseCase,
};
