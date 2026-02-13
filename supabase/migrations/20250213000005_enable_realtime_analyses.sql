-- Enable Realtime for the analyses table
-- This allows clients to subscribe to INSERT/UPDATE/DELETE events via Supabase Realtime
alter publication supabase_realtime add table analyses;
