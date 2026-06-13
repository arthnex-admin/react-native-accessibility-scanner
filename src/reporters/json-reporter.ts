import type { Reporter, ScanReport } from "../types";

export class JsonReporter implements Reporter {
  report(scan: ScanReport): string {
    return JSON.stringify(
      {
        summary: scan.summary,
        issues: scan.issues,
      },
      null,
      2
    );
  }
}
