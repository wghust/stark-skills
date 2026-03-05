# Next.js Debug — Reference

## Error Pattern Quick Lookup

| Log keyword / pattern | Class | Common cause | Next.js Docs |
|---|---|---|---|
| `Module not found: Can't resolve` | `MODULE_ERROR` | Missing file, wrong path casing, uninstalled package | [Resolving Modules](https://nextjs.org/docs/app/api-reference/config/typescript) |
| `Cannot find module '...'` | `MODULE_ERROR` | Package not installed, tsconfig paths misconfigured | [Path Aliases](https://nextjs.org/docs/app/getting-started/installation#set-up-absolute-imports-and-module-path-aliases) |
| `You're importing a component that needs` | `BOUNDARY_ERROR` | Client component without `"use client"` | [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components) |
| `Event handlers cannot be passed to Client Component` | `BOUNDARY_ERROR` | Passing non-serializable props across Server/Client boundary | [Passing Props to Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns) |
| `Hooks can only be called inside of the body of a function component` | `BOUNDARY_ERROR` | Hook used in Server Component (no `"use client"`) | [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components) |
| `async/await is not yet supported in Client Components` | `BOUNDARY_ERROR` | `async` keyword in a `"use client"` component | [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components) |
| `Type error: TS2307` | `COMPILE_ERROR` (→ `MODULE_ERROR`) | Cannot find module or its type declaration | [TypeScript](https://nextjs.org/docs/app/api-reference/config/typescript) |
| `SyntaxError:` | `COMPILE_ERROR` | JS/TS syntax mistake | [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling) |
| `Failed to compile` | `COMPILE_ERROR` | Compilation failure; see nested error for detail | [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling) |
| `Missing required environment variable` | `ENV_ERROR` | Variable not set in `.env*` files | [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) |
| `process.env.* is undefined` on client | `ENV_ERROR` | Variable lacks `NEXT_PUBLIC_` prefix | [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) |
| `Invalid next.config.js options` | `CONFIG_ERROR` | Unrecognized or removed config key | [next.config.js Options](https://nextjs.org/docs/app/api-reference/config/next-config-js) |
| `Unrecognized key(s) in object` | `CONFIG_ERROR` | Deprecated config option (e.g., `target`) | [Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading) |
| `Hydration failed` | `RUNTIME_ERROR` (hydration) | Server/client render mismatch | [Hydration Mismatch](https://nextjs.org/docs/messages/react-hydration-error) |
| `Text content did not match` | `RUNTIME_ERROR` (hydration) | Dynamic content differs between SSR and client | [Hydration Mismatch](https://nextjs.org/docs/messages/react-hydration-error) |
| `EADDRINUSE` | `RUNTIME_ERROR` (port) | Port 3000 (or specified port) already in use | — |
| `getServerSideProps` in `app/` | `CONFIG_ERROR` (version-specific) | Pages Router API used in App Router | [Data Fetching in App Router](https://nextjs.org/docs/app/building-your-application/data-fetching) |
| `<Image layout=` | `COMPILE_ERROR` (version-specific) | Removed `next/image` prop (Next.js < 13) | [Image Component](https://nextjs.org/docs/app/api-reference/components/image) |

---

## Version Compatibility Matrix

| Next.js | Min Node.js | Recommended Node.js | React | Notes |
|---|---|---|---|---|
| 15.x | 18.18.0 | 20.x LTS | 19.x | Turbopack default in dev; React 19 required |
| 14.x | 18.17.0 | 20.x LTS | 18.x | App Router stable; `use cache` experimental |
| 13.x | 16.14.0 | 18.x LTS | 18.x | App Router introduced (beta → stable in 13.4) |
| 12.x | 12.22.0 | 16.x LTS | 17–18 | Pages Router only |
| ≤ 11.x | 10.13.0 | 14.x LTS | 16–17 | Pages Router only |

**React/Next.js pairings to avoid:**
- `next@15` + `react@18` → Peer dep warning; may cause hydration issues with Server Actions
- `next@13/14` + `react@19` → Unsupported; `useFormState` and related APIs differ

---

## Deprecated & Removed APIs by Version

| API / Pattern | Removed/Changed in | Migration |
|---|---|---|
| `next/image` `layout`, `objectFit`, `objectPosition` props | Next.js 13 | Use `fill` + `style={{ objectFit }}` |
| `next/link` `<a>` child required | Next.js 13 | Wrap content directly in `<Link>` |
| `next.config.js` `target: 'serverless'` | Next.js 12 | Remove; use Vercel or custom server |
| `getServerSideProps` / `getStaticProps` in `app/` | Next.js 13 | Use async Server Components + `fetch()` |
| `next/head` in `app/` | Next.js 13 | Use `generateMetadata()` or `metadata` export |
| `next/router` in `app/` | Next.js 13 | Use `next/navigation` (`useRouter`, `usePathname`) |
| `<Script strategy="worker">` requires `nextScriptWorkers` flag | Next.js 13+ | Set `experimental.nextScriptWorkers: true` |
| `experimental.appDir` | Next.js 14 | Remove; App Router is stable by default |

---

## Code Search Patterns by Error Class

### MODULE_ERROR

```bash
# Find all import sites of a module
rg -n "from ['\"]<module-path>['\"]" app/ src/ lib/ components/ pages/

# Find a component file by name
find . -name "ComponentName.{tsx,ts,jsx,js}" -not -path "*/node_modules/*"
# or with glob
ls **/ComponentName.tsx 2>/dev/null

# Check tsconfig path aliases
rg -n "\"paths\"" tsconfig.json

# List all @/ imports to verify alias coverage
rg -n "from \"@/" app/ src/ --no-heading | head -20
```

### BOUNDARY_ERROR

```bash
# Find client components (should have "use client" on line 1)
rg -l "useState|useEffect|useRef|onClick|onChange" app/ --include="*.tsx"

# Find files with "use client" 
rg -l "\"use client\"" app/

# Find Server Components using client-only APIs
rg -n "cookies\(\)|headers\(\)|cache\(\)" app/ --include="*.tsx"
```

### ENV_ERROR

```bash
# Find all process.env usages
rg -n "process\.env\." app/ src/ lib/ --include="*.{ts,tsx,js,jsx}"

# Find client-side env access without NEXT_PUBLIC_
rg -n "process\.env\." app/ --include="*.{ts,tsx}" | grep -v "NEXT_PUBLIC_"

# List all env files
ls -la .env* 2>/dev/null
```

### CONFIG_ERROR

```bash
# Dump next.config content
cat next.config.js || cat next.config.ts || cat next.config.mjs

# Check for webpack callback in config (Turbopack won't run it)
rg -n "webpack:" next.config.*
```

### RUNTIME_ERROR (hydration)

```bash
# Find components using Date, Math.random, window in render
rg -n "new Date\(\)|Date\.now\(\)|Math\.random\(\)|window\." app/ --include="*.{ts,tsx}"

# Find useEffect-less window/document access
rg -n "typeof window|typeof document" app/ --include="*.{ts,tsx}"
```

### COMPILE_ERROR (TypeScript)

```bash
# Run type check without building
npx tsc --noEmit

# Check for TS errors in a specific file
npx tsc --noEmit --skipLibCheck src/app/page.tsx 2>&1 | head -20
```

---

## Common Fix Templates

### Duplicate React — package.json overrides

```json
// npm / pnpm
{
  "overrides": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}

// yarn
{
  "resolutions": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

### tsconfig paths alias

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Also requires in `next.config.js` (Next.js 12 only):
```js
const nextConfig = {
  experimental: { esmExternals: true }
}
```
Next.js 13+ reads `tsconfig.json` paths automatically.

### Port conflict

```bash
# macOS / Linux: kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or start on a different port
next dev -p 3001
```

### Clear stale .next cache

```bash
rm -rf .next && npm run dev    # npm
rm -rf .next && pnpm dev       # pnpm
rm -rf .next && yarn dev       # yarn
```
