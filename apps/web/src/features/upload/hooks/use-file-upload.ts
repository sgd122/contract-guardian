"use client";

import { useState, useCallback } from "react";
import type { UploadResponse } from "@cg/shared";
import { API_ROUTES } from "@cg/shared";

interface UseFileUploadReturn {
  file: File | null;
  uploading: boolean;
  uploadResult: UploadResponse | null;
  error: string | null;
  selectFile: (file: File) => void;
  upload: () => Promise<UploadResponse>;
  reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectFile = useCallback((f: File) => {
    setFile(f);
    setUploadResult(null);
    setError(null);
  }, []);

  const upload = useCallback(async (): Promise<UploadResponse> => {
    if (!file) throw new Error("파일을 선택해주세요.");

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_ROUTES.upload, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ?? "파일 업로드에 실패했습니다."
        );
      }

      const result: UploadResponse = await response.json();
      setUploadResult(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "파일 업로드 중 오류가 발생했습니다.";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setUploading(false);
    setUploadResult(null);
    setError(null);
  }, []);

  return {
    file,
    uploading,
    uploadResult,
    error,
    selectFile,
    upload,
    reset,
  };
}
