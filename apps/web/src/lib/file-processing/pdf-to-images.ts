export interface PdfImage {
  data: string; // base64
  mediaType: "image/jpeg" | "image/png";
  page: number;
}

export async function convertPdfToImages(
  buffer: Buffer
): Promise<PdfImage[]> {
  // Dynamic import to avoid bundling issues
  const { pdf } = await import("pdf-to-img");
  const images: PdfImage[] = [];
  let page = 1;

  for await (const image of await pdf(buffer)) {
    const base64 = Buffer.from(image).toString("base64");
    images.push({
      data: base64,
      mediaType: "image/png",
      page,
    });
    page++;
  }

  return images;
}
