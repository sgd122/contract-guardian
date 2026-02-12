export function cleanExtractedText(text: string): string {
  let cleaned = text;

  // Normalize Unicode (NFC form for Korean)
  cleaned = cleaned.normalize("NFC");

  // Fix common OCR/extraction issues with Korean text
  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, "");

  // Normalize various whitespace characters to standard space
  cleaned = cleaned.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ");

  // Collapse multiple spaces to single space
  cleaned = cleaned.replace(/ {2,}/g, " ");

  // Collapse multiple newlines to double newline (paragraph break)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Remove leading/trailing whitespace from each line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // Remove empty lines at start/end
  cleaned = cleaned.trim();

  return cleaned;
}
