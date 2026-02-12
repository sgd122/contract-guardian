#!/bin/bash
set -e

echo "=== Creating Supabase roles and schemas ==="

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- =====================
  -- Roles (IF NOT EXISTS for supabase/postgres image compatibility)
  -- =====================
  DO \$\$
  BEGIN
    -- supabase_admin may already exist in supabase/postgres image
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
      CREATE ROLE supabase_admin LOGIN CREATEROLE CREATEDB REPLICATION BYPASSRLS;
    END IF;
    ALTER ROLE supabase_admin PASSWORD '$POSTGRES_PASSWORD';

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
      CREATE ROLE authenticator NOINHERIT LOGIN;
    END IF;
    ALTER ROLE authenticator PASSWORD '$POSTGRES_PASSWORD';

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
      CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
      CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
      CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
      CREATE ROLE supabase_auth_admin NOINHERIT LOGIN;
    END IF;
    ALTER ROLE supabase_auth_admin PASSWORD '$POSTGRES_PASSWORD';

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
      CREATE ROLE supabase_storage_admin NOINHERIT LOGIN;
    END IF;
    ALTER ROLE supabase_storage_admin PASSWORD '$POSTGRES_PASSWORD';

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'dashboard_user') THEN
      CREATE ROLE dashboard_user NOSUPERUSER CREATEDB CREATEROLE REPLICATION;
    END IF;

    -- Ensure postgres role exists (some supabase images omit it)
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
      CREATE ROLE postgres LOGIN SUPERUSER PASSWORD '$POSTGRES_PASSWORD';
    END IF;
  END
  \$\$;

  -- =====================
  -- Role grants
  -- =====================
  GRANT anon TO authenticator;
  GRANT authenticated TO authenticator;
  GRANT service_role TO authenticator;
  GRANT supabase_auth_admin TO supabase_admin;
  GRANT supabase_storage_admin TO supabase_admin;

  -- =====================
  -- Schemas
  -- =====================
  CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION supabase_auth_admin;
  CREATE SCHEMA IF NOT EXISTS storage AUTHORIZATION supabase_storage_admin;
  CREATE SCHEMA IF NOT EXISTS extensions;

  -- =====================
  -- Extensions
  -- =====================
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
  CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
  CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA extensions;

  -- =====================
  -- Schema permissions
  -- =====================
  GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
  GRANT USAGE ON SCHEMA auth TO supabase_admin;

  GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
  GRANT USAGE ON SCHEMA storage TO supabase_admin;

  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON SCHEMA public TO supabase_admin;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

  GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role, supabase_admin;
  ALTER DEFAULT PRIVILEGES IN SCHEMA extensions GRANT ALL ON TABLES TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA extensions GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

  -- =====================
  -- Database-level permissions (for service migrations)
  -- =====================
  GRANT CREATE ON DATABASE "$POSTGRES_DB" TO supabase_auth_admin;
  GRANT CREATE ON DATABASE "$POSTGRES_DB" TO supabase_storage_admin;

  -- =====================
  -- Search path
  -- =====================
  ALTER DATABASE "$POSTGRES_DB" SET search_path TO public, extensions;

  -- =====================
  -- Auth admin full privileges
  -- =====================
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;
  ALTER ROLE supabase_auth_admin SET search_path = auth;

  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO supabase_storage_admin;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO supabase_storage_admin;
  ALTER ROLE supabase_storage_admin SET search_path = storage;

EOSQL

echo "=== Supabase roles and schemas created ==="
