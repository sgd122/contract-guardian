import pdfParse from "pdf-parse";
import { MIN_TEXT_LENGTH } from "@cg/shared";

export interface PdfParseResult {
  text: string;
  isScanned: boolean;
  pageCount: number;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const result = await pdfParse(buffer);

  const text = result.text.trim();
  const isScanned = text.length < MIN_TEXT_LENGTH;
  const pageCount = result.numpages;

  return {
    text,
    isScanned,
    pageCount,
  };
}
