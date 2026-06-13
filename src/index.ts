// ─── Public API ───────────────────────────────────────────────────────────────

export { AccessibilityScanner } from "./scanner";
export { loadConfig } from "./scanner/config-loader";
export { scanFile } from "./scanner/file-scanner";
export { computeScore, scoreFile, scoreEmoji } from "./scanner/scorer";
export { registerRule, getRule, getAllRules } from "./rules";

// Reporters
export { ConsoleReporter } from "./reporters/console-reporter";
export { JsonReporter } from "./reporters/json-reporter";
export { MarkdownReporter } from "./reporters/markdown-reporter";

// Built-in rule classes (for extension / custom configs)
export {
  MissingLabelRule,
  MissingRoleRule,
  SmallTouchTargetRule,
  DuplicateLabelsRule,
  MissingHintRule,
  TouchableWithoutLabelRule,
} from "./rules";

// Types
export type {
  AccessibilityRule,
  AccessibilityIssue,
  ScanReport,
  ScanSummary,
  FileScanResult,
  ScanOptions,
  ScannerConfig,
  Severity,
  Reporter,
  TouchTargetConfig,
  RuleContext,
} from "./types";

export { DEFAULT_CONFIG } from "./types";
