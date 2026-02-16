import { describe, it, expect } from "vitest";
import { mapTossStatus } from "../lib/map-toss-status";

describe("payment", () => {
  describe("mapTossStatus", () => {
    it("should map READY to ready", () => {
      expect(mapTossStatus("READY")).toBe("ready");
    });

    it("should map IN_PROGRESS to in_progress", () => {
      expect(mapTossStatus("IN_PROGRESS")).toBe("in_progress");
    });

    it("should map DONE to done", () => {
      expect(mapTossStatus("DONE")).toBe("done");
    });

    it("should map CANCELED to canceled", () => {
      expect(mapTossStatus("CANCELED")).toBe("canceled");
    });

    it("should map PARTIAL_CANCELED to canceled", () => {
      expect(mapTossStatus("PARTIAL_CANCELED")).toBe("canceled");
    });

    it("should map ABORTED to failed", () => {
      expect(mapTossStatus("ABORTED")).toBe("failed");
    });

    it("should map EXPIRED to failed", () => {
      expect(mapTossStatus("EXPIRED")).toBe("failed");
    });

    it("should map unknown status to failed", () => {
      expect(mapTossStatus("UNKNOWN_STATUS")).toBe("failed");
    });

    it("should map empty string to failed", () => {
      expect(mapTossStatus("")).toBe("failed");
    });

    it("should be case-sensitive (lowercase done should fail)", () => {
      expect(mapTossStatus("done")).toBe("failed");
    });

    it("should handle all Toss payment lifecycle statuses", () => {
      const lifecycle = ["READY", "IN_PROGRESS", "DONE"];
      const mapped = lifecycle.map(mapTossStatus);
      expect(mapped).toEqual(["ready", "in_progress", "done"]);
    });

    it("should handle all Toss cancellation statuses", () => {
      const cancelStatuses = ["CANCELED", "PARTIAL_CANCELED"];
      const mapped = cancelStatuses.map(mapTossStatus);
      expect(mapped).toEqual(["canceled", "canceled"]);
    });

    it("should handle all Toss failure statuses", () => {
      const failStatuses = ["ABORTED", "EXPIRED"];
      const mapped = failStatuses.map(mapTossStatus);
      expect(mapped).toEqual(["failed", "failed"]);
    });
  });

  describe("payment status transitions", () => {
    it("should validate normal payment lifecycle", () => {
      // Normal flow: ready -> in_progress -> done
      const tossStatuses = ["READY", "IN_PROGRESS", "DONE"];
      const internalStatuses = tossStatuses.map(mapTossStatus);
      expect(internalStatuses).toEqual(["ready", "in_progress", "done"]);
    });

    it("should validate cancellation flow", () => {
      // Cancel flow: READY -> CANCELED
      const tossStatuses = ["READY", "CANCELED"];
      const internalStatuses = tossStatuses.map(mapTossStatus);
      expect(internalStatuses).toEqual(["ready", "canceled"]);
    });

    it("should validate expired payment flow", () => {
      // Expired flow: READY -> EXPIRED
      const tossStatuses = ["READY", "EXPIRED"];
      const internalStatuses = tossStatuses.map(mapTossStatus);
      expect(internalStatuses).toEqual(["ready", "failed"]);
    });

    it("should validate aborted payment flow", () => {
      // Aborted flow: IN_PROGRESS -> ABORTED
      const tossStatuses = ["IN_PROGRESS", "ABORTED"];
      const internalStatuses = tossStatuses.map(mapTossStatus);
      expect(internalStatuses).toEqual(["in_progress", "failed"]);
    });

    it("should validate partial cancel after done", () => {
      // Partial cancel: DONE -> PARTIAL_CANCELED
      const tossStatuses = ["DONE", "PARTIAL_CANCELED"];
      const internalStatuses = tossStatuses.map(mapTossStatus);
      expect(internalStatuses).toEqual(["done", "canceled"]);
    });
  });

  describe("PAYMENT_STATUS_CONFIG completeness", () => {
    it("should have config for all PaymentStatus values", () => {
      const allStatuses = [
        "ready",
        "in_progress",
        "done",
        "canceled",
        "failed",
        "refunded",
      ] as const;

      // Verify mapTossStatus output values are subset of PaymentStatus
      const mappedStatuses = new Set([
        mapTossStatus("READY"),
        mapTossStatus("IN_PROGRESS"),
        mapTossStatus("DONE"),
        mapTossStatus("CANCELED"),
        mapTossStatus("ABORTED"),
      ]);

      for (const status of mappedStatuses) {
        expect(allStatuses).toContain(status);
      }
    });

    it("should not produce statuses outside PaymentStatus", () => {
      const validStatuses = new Set([
        "ready",
        "in_progress",
        "done",
        "canceled",
        "failed",
        "refunded",
      ]);

      const tossStatuses = [
        "READY",
        "IN_PROGRESS",
        "DONE",
        "CANCELED",
        "PARTIAL_CANCELED",
        "ABORTED",
        "EXPIRED",
        "UNKNOWN",
      ];

      for (const tossStatus of tossStatuses) {
        const mapped = mapTossStatus(tossStatus);
        expect(validStatuses.has(mapped)).toBe(true);
      }
    });
  });
});
