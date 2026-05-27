export interface QualityGateConfig {
  enabled: boolean;
  threshold: number;
  logPath: string | null;
}

export function loadQualityGateConfig(): QualityGateConfig {
  return {
    enabled: process.env.MEMORY_GATE_ENABLED === "true",
    threshold: parseFloat(process.env.MEMORY_GATE_THRESHOLD || "0.5"),
    logPath: process.env.MEMORY_GATE_LOG || null,
  };
}
