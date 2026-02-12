import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

function getClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
) {
  const client = getClient();
  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return data;
}

export function getFileUrl(bucket: string, path: string): string {
  const client = getClient();
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, path: string) {
  const client = getClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw error;
}
