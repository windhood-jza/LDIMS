type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const normalizeLevel = (level: string | undefined): LogLevel => {
  const normalizedLevel = level?.trim().toLowerCase();
  if (
    normalizedLevel === "debug" ||
    normalizedLevel === "info" ||
    normalizedLevel === "warn" ||
    normalizedLevel === "error"
  ) {
    return normalizedLevel;
  }
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
};

export const getConfiguredLogLevel = (): LogLevel => {
  return normalizeLevel(process.env.LOG_LEVEL);
};

const shouldLog = (level: LogLevel): boolean => {
  const configuredLevel = getConfiguredLogLevel();
  return levelPriority[level] >= levelPriority[configuredLevel];
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog("debug")) console.log(...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog("info")) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog("warn")) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog("error")) console.error(...args);
  },
};
