import { MAX_PDF_PAGES } from "@cg/shared";

export interface PdfImage {
  data: string; // base64
  mediaType: "image/jpeg" | "image/png";
  page: number;
}

export interface ConvertPdfResult {
  images: PdfImage[];
  totalPages: number;
  truncated: boolean;
}

export async function convertPdfToImages(
  buffer: Buffer,
  maxPages: number = MAX_PDF_PAGES
): Promise<ConvertPdfResult> {
  // Dynamic import to avoid bundling issues
  const { pdf } = await import("pdf-to-img");
  const images: PdfImage[] = [];
  let page = 1;

  for await (const image of await pdf(buffer, { scale: 2.0 })) {
    if (page > maxPages) {
      // Count remaining pages without converting
      page++;
      continue;
    }

    const base64 = Buffer.from(image).toString("base64");
    images.push({
      data: base64,
      mediaType: "image/png",
      page,
    });
    page++;
  }

  const totalPages = page - 1;
  const truncated = totalPages > maxPages;

  if (truncated) {
    console.warn(
      `[PDF] Document has ${totalPages} pages, only first ${maxPages} pages converted for analysis`
    );
  }

  return { images, totalPages, truncated };
}
