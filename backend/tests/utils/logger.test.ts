import assert from "node:assert/strict";
import test from "node:test";
import { getConfiguredLogLevel, logger } from "../../src/utils/logger";

test("logger reads LOG_LEVEL at log time", () => {
  const originalLogLevel = process.env.LOG_LEVEL;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalLog = console.log;
  const messages: unknown[][] = [];

  console.log = (...args: unknown[]) => {
    messages.push(args);
  };

  try {
    process.env.NODE_ENV = "production";
    delete process.env.LOG_LEVEL;
    logger.info("hidden");

    process.env.LOG_LEVEL = "info";
    logger.info("shown");

    assert.deepEqual(messages, [["shown"]]);
  } finally {
    console.log = originalLog;
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test("logger normalizes LOG_LEVEL case and spaces", () => {
  const originalLogLevel = process.env.LOG_LEVEL;

  try {
    process.env.LOG_LEVEL = " INFO ";
    assert.equal(getConfiguredLogLevel(), "info");
  } finally {
    if (originalLogLevel === undefined) {
      delete process.env.LOG_LEVEL;
    } else {
      process.env.LOG_LEVEL = originalLogLevel;
    }
  }
});
