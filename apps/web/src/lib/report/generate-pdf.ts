import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import type { AnalysisResult } from '@cg/shared';
import { ReportDocument } from './pdf-template';

export async function generateReportPdf(
  analysis: AnalysisResult
): Promise<Uint8Array> {
  const document = createElement(ReportDocument, { analysis });
  // @ts-expect-error React 19 ReactElement type is incompatible with @react-pdf/renderer's expected type
  return await renderToBuffer(document);
}
