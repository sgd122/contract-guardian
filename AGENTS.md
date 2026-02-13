# Contract Guardian (CG) - Agent Guidelines

This document provides instructions for AI agents operating within the Contract Guardian repository.

## 1. Project Overview & Architecture

- **Description**: AI-powered contract analysis platform (Web: Next.js 16, Mobile: Expo 52).
- **Monorepo**: pnpm workspaces + Turborepo.
- **Packages**:
  - `apps/web`: Next.js 16 (App Router), React 19, Tailwind CSS 3.4.
  - `apps/mobile`: Expo 52 (React Native).
  - `@cg/shared`: Shared types, Zod schemas, constants.
  - `@cg/api`: Supabase services, API clients.
  - `@cg/ui`: Radix UI components, animations.
  - `@cg/config`: Shared configs (tsconfig, eslint, tailwind).

## 2. Build & Test Commands

Use `pnpm` for all package management commands.

### General

- **Install Dependencies**: `pnpm install`
- **Build All**: `pnpm build` (Runs `turbo run build`)
- **Dev Server**: `pnpm dev` (Runs all apps via Turbo)
- **Web Only**: `pnpm dev:web`
- **Mobile Only**: `pnpm dev:mobile`
- **Typecheck**: `pnpm typecheck` (Runs `tsc --noEmit` across packages)
- **Lint**: `pnpm lint` (Runs ESLint)
- **Clean**: `pnpm clean` (Removes `.next`, `.turbo`, `dist`)

### Database (Supabase)

- **Generate Types**: `pnpm db:generate` (Updates `packages/shared/src/types/database.ts`)
- **Migrate**: `pnpm db:migrate` (Pushes schema changes)

### Testing (apps/web)

- **Run E2E Tests**: `pnpm --filter @cg/web test:e2e`
- **Run E2E UI**: `pnpm --filter @cg/web test:e2e:ui`
- **Run Headed**: `pnpm --filter @cg/web test:e2e:headed`
- **Run Single Test File**: `pnpm --filter @cg/web exec playwright test tests/example.spec.ts`

### Docker

- **Dev Build & Up**: `pnpm docker:dev:build`
- **Dev Up**: `pnpm docker:dev`
- **Dev Logs**: `pnpm docker:dev:logs`
- **Dev Down**: `pnpm docker:dev:down`
- **Prod Build**: `pnpm docker:prod:build`
- **Prod Up**: `pnpm docker:prod:up`

## 3. Code Style & Conventions

### Language & Frameworks

- **TypeScript**: Strict mode enabled. No `any`. Use interfaces for props/state.
- **React**: Functional components with hooks. `forwardRef` for UI library components.
- **Next.js**: App Router (`src/app`). Server Actions for mutations.
- **Styling**: Tailwind CSS.
  - Use `cn()` utility (`clsx` + `tailwind-merge`) for class merging.
  - Use `cva` (class-variance-authority) for component variants.
  - PascalCase for component names, kebab-case for filenames (e.g., `PricingCard` in `pricing-card.tsx`).

### Imports

- **Internal Packages**: Use workspace aliases:
  - `@cg/shared` for types/constants.
  - `@cg/ui` for UI components.
  - `@cg/api` for services.
- **Path Aliases**: Use `@/` for `src/` imports within `apps/web`.
- **Order**: React/Next.js -> 3rd Party -> Internal Packages -> Local Components -> Styles.

### Component Structure

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@cg/ui/lib/utils";

const componentVariants = cva("base-styles", {
  variants: { variant: { default: "...", outline: "..." } },
  defaultVariants: { variant: "default" },
});

export interface ComponentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
Component.displayName = "Component";

export { Component, componentVariants };
```

### State Management & Data Fetching

- **Server State**: Use React Query (if installed) or Next.js server components/actions.
- **Client State**: Minimal `useState` / `useReducer`.
- **Database**: Use factory pattern services from `@cg/api` (e.g., `createAnalysisService(client)`).

### Error Handling

- **API**: Return structured errors (e.g., `{ error: string, code: string }`).
- **UI**: Use `sonner` for toast notifications on user actions.
- **Validation**: Use Zod schemas from `@cg/shared` for form/API validation.

## 4. Workflow Rules

1.  **Atomic Commits**: Commits should be small and focused.
2.  **Lint/Typecheck**: Always run `pnpm lint` and `pnpm typecheck` before finalizing tasks.
3.  **Documentation**: Update JSDoc/comments for complex logic.
4.  **Deps**: Add dependencies to the correct `package.json` (workspace root or specific package).
