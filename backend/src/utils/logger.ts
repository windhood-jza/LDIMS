type LogLevel = "debug" | "info" | "warn" | "error";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const normalizeLevel = (level: string | undefined): LogLevel => {
  if (level === "debug" || level === "info" || level === "warn" || level === "error") {
    return level;
  }
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
};

const configuredLevel = normalizeLevel(process.env.LOG_LEVEL);

const shouldLog = (level: LogLevel): boolean => {
  return levelPriority[level] >= levelPriority[configuredLevel];
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog("debug")) console.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog("info")) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog("warn")) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog("error")) console.error(...args);
  },
};
