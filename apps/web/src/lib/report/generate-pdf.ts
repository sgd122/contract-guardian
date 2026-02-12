import { renderToBuffer } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { createElement } from 'react';
import type { AnalysisResult } from '@cg/shared';
import { ReportDocument } from './pdf-template';

export async function generateReportPdf(
  analysis: AnalysisResult
): Promise<Uint8Array> {
  const document = createElement(ReportDocument, { analysis }) as unknown as ReactElement<DocumentProps>;
  return await renderToBuffer(document);
}
