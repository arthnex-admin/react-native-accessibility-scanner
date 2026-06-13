import { readFileSync } from "fs";
import { glob } from "glob";
import path from "path";
import type { ScanReport, ScanSummary, ScanOptions } from "../types";
import { loadConfig } from "./config-loader";
import { scanFile } from "./file-scanner";

const SUPPORTED_EXTENSIONS = ["tsx", "ts", "jsx", "js"];

export class AccessibilityScanner {
  /**
   * Scan a React Native project for accessibility issues.
   *
   * @example
   * const report = await AccessibilityScanner.scan({ path: "./src" });
   * console.log(report.summary.totalIssues);
   */
  static async scan(options: ScanOptions = {}): Promise<ScanReport> {
    const config = loadConfig(options);
    const startTime = Date.now();

    // Resolve source paths
    const paths = Array.isArray(config.path) ? config.path : [config.path];

    // Collect all matching files
    const allFiles = new Set<string>();
    for (const srcPath of paths) {
      const resolved = path.resolve(srcPath);
      const pattern = `${resolved}/**/*.{${SUPPORTED_EXTENSIONS.join(",")}}`;
      const matches = await glob(pattern, {
        ignore: config.ignore,
        absolute: true,
      });
      matches.forEach((f) => allFiles.add(f));
    }

    const fileList = Array.from(allFiles);

    // Scan each file
    const results = fileList.map((filePath) => {
      let source = "";
      try {
        source = readFileSync(filePath, "utf-8");
      } catch {
        return { filePath, issues: [] };
      }
      return scanFile(filePath, source, config);
    });

    // Build flat issue list
    const issues = results.flatMap((r) => r.issues);

    const summary: ScanSummary = {
      totalFiles: fileList.length,
      scannedFiles: fileList.length,
      totalIssues: issues.length,
      highIssues: issues.filter((i) => i.severity === "high").length,
      mediumIssues: issues.filter((i) => i.severity === "medium").length,
      lowIssues: issues.filter((i) => i.severity === "low").length,
      durationMs: Date.now() - startTime,
    };

    return { summary, results, issues };
  }
}
