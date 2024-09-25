import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { createHtmlReport } from 'axe-html-reporter';

class AxeReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    const axeResults = result.attachments.find(a => a.name === 'accessibility-scan-results');
    if (axeResults && axeResults.body) {
      const results = JSON.parse(axeResults.body.toString());
      const pageName = this.extractPageName(test);
      this.generateAxeReport(test.title, results, pageName);
    }
  }

  private extractPageName(test: TestCase): string {
    let currentSuite = test.parent;
    while (currentSuite.parent) {
      if (currentSuite.type === 'describe') {
        return currentSuite.title.replace(/\s+/g, '_');
      }
      currentSuite = currentSuite.parent;
    }
    return 'unknown_page';
  }

  generateAxeReport(testTitle: string, results: any, pageName: string) {
    const reportDir = path.join('artifacts', 'axe-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportFileName = `${pageName}_${testTitle.replace(/\s+/g, '_')}_axe_report.html`;

    createHtmlReport({
      results,
      options: {
        projectKey: 'Activist',
        customSummary: `Accessibility report for ${pageName} - ${testTitle}`,
        doNotCreateReportFile: false,
        outputDir: reportDir,
        reportFileName: reportFileName
      }
    });
  }
}

export default AxeReporter;
