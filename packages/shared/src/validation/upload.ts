import { z } from 'zod';
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from '../constants/analysis';

export const UploadFileSchema = z.object({
  size: z
    .number()
    .max(MAX_FILE_SIZE, `파일 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다`),
  type: z
    .string()
    .refine(
      (type): type is (typeof SUPPORTED_FORMATS)[number] =>
        (SUPPORTED_FORMATS as readonly string[]).includes(type),
      `지원하는 형식: PDF, JPEG, PNG`,
    ),
});

export type UploadFileInput = z.infer<typeof UploadFileSchema>;
