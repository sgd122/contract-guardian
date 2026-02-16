import { describe, it, expect } from "vitest";
import { validateMagicBytes } from "./validate-magic-bytes";

describe("validateMagicBytes", () => {
  describe("PDF validation", () => {
    it("should validate correct PDF magic bytes", () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      expect(validateMagicBytes(pdfBuffer, "application/pdf")).toBe(true);
    });

    it("should reject invalid PDF magic bytes", () => {
      const invalidBuffer = Buffer.from([0x00, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      expect(validateMagicBytes(invalidBuffer, "application/pdf")).toBe(false);
    });

    it("should reject buffer with wrong first byte", () => {
      const invalidBuffer = Buffer.from([0xff, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      expect(validateMagicBytes(invalidBuffer, "application/pdf")).toBe(false);
    });
  });

  describe("JPEG validation", () => {
    it("should validate correct JPEG magic bytes", () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(validateMagicBytes(jpegBuffer, "image/jpeg")).toBe(true);
    });

    it("should validate JPEG with different APP marker", () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10, 0x45, 0x78]);
      expect(validateMagicBytes(jpegBuffer, "image/jpeg")).toBe(true);
    });

    it("should reject invalid JPEG magic bytes", () => {
      const invalidBuffer = Buffer.from([0xff, 0xd8, 0x00, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(validateMagicBytes(invalidBuffer, "image/jpeg")).toBe(false);
    });

    it("should reject buffer with wrong start bytes", () => {
      const invalidBuffer = Buffer.from([0x00, 0x00, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(validateMagicBytes(invalidBuffer, "image/jpeg")).toBe(false);
    });
  });

  describe("PNG validation", () => {
    it("should validate correct PNG magic bytes", () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(validateMagicBytes(pngBuffer, "image/png")).toBe(true);
    });

    it("should reject invalid PNG magic bytes", () => {
      const invalidBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x00, 0x0a,
      ]);
      expect(validateMagicBytes(invalidBuffer, "image/png")).toBe(false);
    });

    it("should reject buffer with wrong first byte", () => {
      const invalidBuffer = Buffer.from([
        0x00, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(validateMagicBytes(invalidBuffer, "image/png")).toBe(false);
    });

    it("should reject buffer with wrong last byte", () => {
      const invalidBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x00,
      ]);
      expect(validateMagicBytes(invalidBuffer, "image/png")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should reject buffer shorter than 8 bytes", () => {
      const shortBuffer = Buffer.from([0x25, 0x50, 0x44]);
      expect(validateMagicBytes(shortBuffer, "application/pdf")).toBe(false);
    });

    it("should reject empty buffer", () => {
      const emptyBuffer = Buffer.from([]);
      expect(validateMagicBytes(emptyBuffer, "application/pdf")).toBe(false);
    });

    it("should reject buffer with exactly 7 bytes", () => {
      const shortBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a]);
      expect(validateMagicBytes(shortBuffer, "image/png")).toBe(false);
    });

    it("should reject unsupported MIME type", () => {
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
      expect(validateMagicBytes(buffer, "application/zip")).toBe(false);
    });

    it("should reject text/plain MIME type", () => {
      const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
      expect(validateMagicBytes(buffer, "text/plain")).toBe(false);
    });
  });

  describe("MIME type mismatch", () => {
    it("should reject PDF bytes with JPEG MIME type", () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
      expect(validateMagicBytes(pdfBuffer, "image/jpeg")).toBe(false);
    });

    it("should reject JPEG bytes with PNG MIME type", () => {
      const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
      expect(validateMagicBytes(jpegBuffer, "image/png")).toBe(false);
    });

    it("should reject PNG bytes with PDF MIME type", () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(validateMagicBytes(pngBuffer, "application/pdf")).toBe(false);
    });
  });
});
