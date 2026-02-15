import pdfParse from "pdf-parse";
import { MIN_TEXT_LENGTH } from "@cg/shared";

export interface PdfParseResult {
  text: string;
  isScanned: boolean;
  pageCount: number;
}

export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const PARSE_TIMEOUT_MS = 30_000;

  const result = await Promise.race([
    pdfParse(buffer),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("PDF parsing timed out")), PARSE_TIMEOUT_MS)
    ),
  ]);

  const text = result.text.trim();
  const isScanned = text.length < MIN_TEXT_LENGTH;
  const pageCount = result.numpages;

  return {
    text,
    isScanned,
    pageCount,
  };
}
