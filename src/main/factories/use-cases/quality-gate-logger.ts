import { appendFileSync, mkdirSync } from "fs";
import { dirname } from "path";

export function makeJsonlLogger(logPath: string): (entry: object) => void {
  mkdirSync(dirname(logPath), { recursive: true });
  return (entry: object) => {
    appendFileSync(logPath, JSON.stringify(entry) + "\n", "utf-8");
  };
}
