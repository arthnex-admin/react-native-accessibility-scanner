// ─── Severity ─────────────────────────────────────────────────────────────────

export type Severity = "low" | "medium" | "high";

// ─── Issue ────────────────────────────────────────────────────────────────────

export interface AccessibilityIssue {
  /** Rule that produced this issue */
  ruleId: string;
  /** Short human-readable rule name */
  ruleName: string;
  /** Full description of what's wrong */
  message: string;
  /** Actionable suggestion shown to the developer */
  suggestion: string;
  severity: Severity;
  /** Absolute or relative file path */
  file: string;
  /** 1-based line number */
  line: number;
  /** 1-based column number */
  column: number;
  /** The source snippet around the issue */
  codeSnippet?: string;
}

// ─── Rule ─────────────────────────────────────────────────────────────────────

export interface RuleContext {
  /** Absolute file path */
  filePath: string;
  /** Raw source code of the file */
  sourceCode: string;
  /** Resolved scanner config */
  config: ScannerConfig;
}

export interface AccessibilityRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  /** Given an AST node and context, return any issues found */
  run(node: import("@babel/types").Node, context: RuleContext): AccessibilityIssue[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface TouchTargetConfig {
  minWidth: number;
  minHeight: number;
}

export interface ScannerConfig {
  /** Source path(s) to scan */
  path: string | string[];
  /** Glob patterns to ignore */
  ignore: string[];
  /** Exit code 1 when high severity issues found (CLI) */
  failOnHigh: boolean;
  /** Exit code 1 when medium or higher severity issues found (CLI) */
  failOnMedium: boolean;
  /** Platform-specific touch target sizes */
  touchTarget: TouchTargetConfig;
  /** Rule IDs to disable */
  disabledRules: string[];
}

export const DEFAULT_CONFIG: ScannerConfig = {
  path: "./src",
  ignore: ["**/*.stories.tsx", "**/*.stories.ts", "**/*.test.tsx", "**/*.test.ts", "**/node_modules/**"],
  failOnHigh: false,
  failOnMedium: false,
  touchTarget: { minWidth: 44, minHeight: 44 },
  disabledRules: [],
};

// ─── Report ───────────────────────────────────────────────────────────────────

export interface FileScanResult {
  filePath: string;
  issues: AccessibilityIssue[];
}

export interface ScanSummary {
  totalFiles: number;
  scannedFiles: number;
  totalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  durationMs: number;
}

export interface ScanReport {
  summary: ScanSummary;
  results: FileScanResult[];
  /** All issues flattened for convenience */
  issues: AccessibilityIssue[];
}

// ─── Reporter ─────────────────────────────────────────────────────────────────

export interface Reporter {
  report(scanReport: ScanReport): string | void;
}

// ─── Scan Options (programmatic API) ──────────────────────────────────────────

export interface ScanOptions {
  path?: string | string[];
  ignore?: string[];
  failOnHigh?: boolean;
  failOnMedium?: boolean;
  touchTarget?: Partial<TouchTargetConfig>;
  disabledRules?: string[];
  /** Override config file loading */
  config?: Partial<ScannerConfig>;
}
