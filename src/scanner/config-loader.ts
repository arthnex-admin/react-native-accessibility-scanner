import { cosmiconfigSync } from "cosmiconfig";
import type { ScannerConfig, ScanOptions } from "../types";
import { DEFAULT_CONFIG } from "../types";

const MODULE_NAME = "accessibility-scanner";

export function loadConfig(options: ScanOptions = {}): ScannerConfig {
  if (options.config) {
    return mergeConfig(DEFAULT_CONFIG, options);
  }

  const explorer = cosmiconfigSync(MODULE_NAME, {
    searchPlaces: [
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.cjs`,
      `.${MODULE_NAME}rc`,
      `.${MODULE_NAME}rc.json`,
      "package.json",
    ],
  });

  let fileConfig: Partial<ScannerConfig> = {};
  try {
    const result = explorer.search();
    if (result && !result.isEmpty) {
      fileConfig = result.config as Partial<ScannerConfig>;
    }
  } catch {
    // No config file found — use defaults
  }

  return mergeConfig(DEFAULT_CONFIG, { ...fileConfig, ...options });
}

function mergeConfig(base: ScannerConfig, overrides: Partial<ScanOptions>): ScannerConfig {
  const touchTarget = {
    minWidth: overrides.touchTarget?.minWidth ?? base.touchTarget.minWidth,
    minHeight: overrides.touchTarget?.minHeight ?? base.touchTarget.minHeight,
  };
  return {
    path: overrides.path ?? base.path,
    ignore: overrides.ignore ?? base.ignore,
    failOnHigh: overrides.failOnHigh ?? base.failOnHigh,
    failOnMedium: overrides.failOnMedium ?? base.failOnMedium,
    touchTarget,
    disabledRules: overrides.disabledRules ?? base.disabledRules,
  };
}
