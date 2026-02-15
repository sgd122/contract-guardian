"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { UploadDropzone } from "@cg/ui";
import {
  MAX_FILE_SIZE,
  SUPPORTED_FORMATS,
  formatFileSize,
} from "@cg/shared";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUploadZone({ onFileSelect, disabled }: FileUploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      ext === "pdf";

    if (!isValidType) {
      setError("지원하지 않는 파일 형식입니다. PDF, JPEG, PNG 파일만 가능합니다.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `파일 크기가 너무 큽니다. 최대 ${formatFileSize(MAX_FILE_SIZE)}까지 가능합니다.`
      );
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <UploadDropzone
        onFileSelect={handleFileSelect}
        accept=".pdf,.jpg,.jpeg,.png"
        maxSize={MAX_FILE_SIZE}
        className={disabled ? "pointer-events-none opacity-50" : ""}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {selectedFile && !error && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
          <FileText className="h-8 w-8 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
