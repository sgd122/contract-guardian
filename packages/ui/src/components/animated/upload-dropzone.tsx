"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Upload, Check, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

type ValidationState = "idle" | "valid" | "invalid";

export function UploadDropzone({
  onFileSelect,
  accept = ".pdf",
  maxSize = 10 * 1024 * 1024,
  className,
}: UploadDropzoneProps) {
  const reducedMotion = useReducedMotion();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [validation, setValidation] = React.useState<ValidationState>("idle");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateAndSelect = React.useCallback(
    (file: File) => {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isValidType = acceptedTypes.some(
        (t) => t === ext || t === file.type
      );
      const isValidSize = file.size <= maxSize;

      if (isValidType && isValidSize) {
        setValidation("valid");
        onFileSelect(file);
      } else {
        setValidation("invalid");
      }

      setTimeout(() => setValidation("idle"), 2000);
    },
    [accept, maxSize, onFileSelect]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    },
    []
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    },
    []
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleClick = React.useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const icon =
    validation === "valid" ? (
      <Check className="h-10 w-10 text-risk-low" />
    ) : validation === "invalid" ? (
      <X className="h-10 w-10 text-risk-high" />
    ) : (
      <Upload className="h-10 w-10 text-muted-foreground" />
    );

  const label =
    validation === "valid"
      ? "파일이 선택되었습니다"
      : validation === "invalid"
        ? "지원하지 않는 파일 형식입니다"
        : isDragOver
          ? "파일을 놓으세요"
          : "PDF 파일을 드래그하거나 클릭하세요";

  const Wrapper = reducedMotion ? "div" : motion.div;
  const wrapperProps = reducedMotion
    ? {}
    : {
        animate: {
          scale: isDragOver ? 1.02 : 1,
        },
        transition: { duration: 0.2 },
      };

  return (
    <Wrapper
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-colors",
        isDragOver && "border-primary bg-primary/5",
        validation === "valid" && "border-risk-low bg-risk-low/5",
        validation === "invalid" && "border-risk-high bg-risk-high/5",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      {...wrapperProps}
    >
      {icon}
      <p className="text-sm text-muted-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        aria-label="파일 선택"
      />
    </Wrapper>
  );
}
