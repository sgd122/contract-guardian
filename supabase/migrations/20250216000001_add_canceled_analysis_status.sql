-- Add 'canceled' value to analysis_status enum for refunded analyses
ALTER TYPE analysis_status ADD VALUE IF NOT EXISTS 'canceled';
