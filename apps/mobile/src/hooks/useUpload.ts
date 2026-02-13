import { useState, useCallback } from 'react';
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from '@cg/shared';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../providers/AuthProvider';

interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

interface UseUploadReturn extends UploadState {
  upload: (file: UploadFile) => Promise<string>;
  reset: () => void;
}

function validateFile(file: UploadFile): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `파일 크기가 ${MAX_FILE_SIZE / (1024 * 1024)}MB를 초과합니다.`,
    );
  }

  const mimeType = file.type.toLowerCase();
  if (!SUPPORTED_FORMATS.includes(mimeType as (typeof SUPPORTED_FORMATS)[number])) {
    throw new Error('지원하지 않는 파일 형식입니다. PDF, JPEG, PNG만 가능합니다.');
  }
}

export function useUpload(): UseUploadReturn {
  const { user } = useAuthContext();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  const upload = useCallback(
    async (file: UploadFile): Promise<string> => {
      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      try {
        validateFile(file);

        setState({ isUploading: true, progress: 0, error: null });

        // Step 1: Read file as blob from URI
        setState((prev) => ({ ...prev, progress: 0.1 }));
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // Step 2: Upload to Supabase storage
        setState((prev) => ({ ...prev, progress: 0.3 }));
        const fileExt = file.name.split('.').pop() ?? 'pdf';
        const storagePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('contracts')
          .upload(storagePath, blob, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setState((prev) => ({ ...prev, progress: 0.7 }));

        // Step 3: Create analysis record
        const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';

        const { data: analysisData, error: insertError } = await supabase
          .from('analyses')
          .insert({
            user_id: user.id,
            original_filename: file.name,
            file_path: storagePath,
            file_type: fileType,
            file_size_bytes: file.size,
            status: 'pending_payment',
            clauses: [],
            improvements: [],
          })
          .select('id')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        setState({ isUploading: false, progress: 1, error: null });
        return analysisData.id;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ isUploading: false, progress: 0, error });
        throw error;
      }
    },
    [user],
  );

  return { upload, reset, ...state };
}
