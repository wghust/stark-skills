---
name: copy-web
description: Full-stack clone of any public website. Use when the user wants to clone, copy, replicate, mirror, rebuild, or recreate a website from a URL. Performs deep CSS/API/service analysis, then generates a complete monorepo with Next.js 14 frontend, NestJS 10 backend, MySQL + Redis via Docker, and a credentials report listing every required API key. 全栈复刻任意公开网站。当用户提供网址并要求复刻、仿写、克隆、参考实现时使用。深度分析页面 CSS/API/第三方服务，生成包含 Next.js 前端、NestJS 后端、MySQL/Redis Docker 服务的完整 monorepo 项目。
---

# copy-web — Full-Stack Website Cloner

> **Language / 语言**：Detect the user's language and respond in the same language throughout.

---

## Prerequisites 前置确认

Before starting, confirm:

1. **Target URL(s)** — ask if not provided; confirm the site is publicly accessible (no login wall)
2. **Page scope** — list discovered top-level nav links; ask user to confirm which pages to include (max 5)
3. **Output directory** — default: `./<domain>-clone`; ask if user wants a different name

---

## Phase 1 · Deep Analysis 深度分析

Use **browser-use** for all fetching. Execute the following for each confirmed page.

### 1a · Screenshots

Capture full-page screenshots at three viewports: **375 px** (mobile), **768 px** (tablet), **1440 px** (desktop).

### 1b · Pixel-Level CSS Extraction

For each major DOM section (identified by landmark roles or positional heuristics):

1. Call `window.getComputedStyle(element)` on the section root **and** its key direct children
2. Record the following properties per element:

| Property Group | Properties to capture |
|---|---|
| Color | `color`, `background-color`, `border-color`, `outline-color` |
| Background | `background-image` (full gradient string), `background-size`, `background-position` |
| Typography | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-transform` |
| Spacing | `padding` (all 4), `margin` (all 4), `gap`, `row-gap`, `column-gap` |
| Layout | `display`, `flex-direction`, `align-items`, `justify-content`, `grid-template-columns` |
| Decoration | `border-radius`, `box-shadow`, `opacity`, `backdrop-filter` |
| Motion | `transition` (full shorthand), `animation` (full shorthand) |

3. Extract all CSS custom properties from `:root` and any theme class (`[data-theme]`, `.dark`)
4. Note hover/focus states by triggering them and capturing the delta

### 1c · Network Request Interception 网络请求监听

During page load and basic interactions (scroll, hover nav items, click any visible button):

1. Capture every XHR / fetch request:
   - HTTP method
   - URL (normalize path params: `/users/123` → `/users/:id`)
   - Request headers (note presence of `Authorization: Bearer`, `Cookie`, `x-api-key`)
   - Response JSON — record top-level shape: `{ field: type, ... }`
2. Classify each captured URL:
   - **List endpoint**: response is an array or `{ data: [...], total: N }`
   - **Detail endpoint**: response is a single object
   - **Auth endpoint**: URL matches `/login`, `/auth`, `/token`, `/session`, `/oauth`
   - **Mutation endpoint**: method is POST / PATCH / PUT / DELETE

### 1d · Third-Party Service Scan 第三方服务扫描

Scan every script `src`, inline script, and API URL for the following patterns:

| Service | Detection Pattern | Required Credentials |
|---------|------------------|----------------------|
| Google Maps | `maps.googleapis.com`, `google-maps`, `MapView` | `GOOGLE_MAPS_API_KEY` |
| Mapbox | `api.mapbox.com`, `mapboxgl` | `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Stripe | `js.stripe.com`, `data-stripe`, `StripeElement` | `NEXT_PUBLIC_STRIPE_PK`, `STRIPE_SK` |
| OpenAI | `api.openai.com`, `openai`, `gpt-` in responses | `OPENAI_API_KEY` (backend only) |
| Anthropic | `api.anthropic.com`, `claude-` | `ANTHROPIC_API_KEY` (backend only) |
| Firebase | `firebaseapp.com`, `firebase/app` | Firebase project config object |
| Clerk | `clerk.com`, `@clerk/` | `NEXT_PUBLIC_CLERK_PK`, `CLERK_SK` |
| Auth0 | `auth0.com`, `@auth0/` | `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` |
| Cloudinary | `cloudinary.com` | `CLOUDINARY_URL` |
| Algolia | `algolianet.com`, `algoliasearch` | `ALGOLIA_APP_ID`, `ALGOLIA_API_KEY` |
| reCAPTCHA | `recaptcha` | `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` |
| SendGrid | `sendgrid.com`, `@sendgrid/` | `SENDGRID_API_KEY` (backend only) |
| Pusher / Ably | `pusher.com`, `ably.com` | `PUSHER_APP_KEY`, `PUSHER_APP_SECRET` |
| Supabase | `supabase.co`, `@supabase/` | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY` |

For each detected service record: name, confidence (High / Medium / Low), required env vars, whether backend-only.

### 1e · Authentication Flow Detection 认证流检测

- Detect login / register / logout pages or modal triggers
- Note whether auth uses: JWT Bearer token, session cookie, OAuth redirect, third-party provider
- Mark which API endpoints require `Authorization` header

### 1f · Redis Signal Detection Redis 需求检测

Enable Redis if any of the following are detected:
- Session-based authentication (cookie session store)
- WebSocket / real-time features (`ws://`, `socket.io`, `SSE`)
- API rate-limiting headers (`X-RateLimit-*`)
- High-frequency data endpoints called multiple times per page load

---

## Phase 2 · site-analysis.md 分析文档（用户审查门）

Write `site-analysis.md` to the working directory. **Present to user and wait for confirmation before continuing.**

> "Here is the full analysis of [URL]. Please review—especially the inferred data models and API endpoints—then tell me to proceed."

### site-analysis.md Template

```markdown
# Site Analysis: [URL]

Analyzed: [date] | Pages: [N]

---

## Pages

| # | URL | Fetch Status | Notes |
|---|-----|-------------|-------|
| 1 | https://example.com/ | ✅ | Home |

---

## Layout Sections — [Page Name]

| # | Label | BG Color | Columns | Height (approx) | Key Elements |
|---|-------|----------|---------|-----------------|-------------|
| 1 | Navbar | #ffffff | 2 | 64px | Logo, 5 links, CTA button |
| 2 | Hero | #0f172a | 2 | 100vh | H1, subtext, 2 CTAs, illustration |

---

## Precise CSS Values

| Element | Property | Value | Notes |
|---------|----------|-------|-------|
| body | background-color | #0f172a | |
| :root | --color-primary | #6366f1 | CSS custom property |
| .hero h1 | font-size | 56px | desktop |
| .card | box-shadow | 0 4px 24px rgba(0,0,0,0.12) | |
| .btn-primary | transition | all 0.2s ease | |

---

## Responsive Differences (desktop → mobile)

| Section | Desktop | Mobile | Tailwind classes |
|---------|---------|--------|-----------------|
| FeatureGrid | 3 columns | 1 column | `grid-cols-1 md:grid-cols-3` |

---

## Discovered API Endpoints

| Method | URL Pattern | Auth Required | Response Shape | Classification |
|--------|-------------|---------------|----------------|----------------|
| GET | /api/posts | No | `{ data: Post[], total: number }` | List |
| POST | /api/auth/login | No | `{ access_token: string }` | Auth |

---

## Inferred Data Models (Entities)

### Entity: Post
| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| id | number | No | PK, auto-increment |
| title | string | No | |
| content | text | Yes | |
| createdAt | Date | No | auto |

### Relations
- User hasMany Post (one-to-many)

---

## Interactive Elements

| Element | Type | Trigger | Transition | shadcn/ui Component |
|---------|------|---------|-----------|---------------------|
| Nav item | Dropdown | hover | 0.15s ease | NavigationMenu |
| Hero CTA | Modal open | click | 0.2s ease | Dialog |

---

## Third-Party Services

| Service | Confidence | Required Env Vars | Backend Only? |
|---------|------------|-------------------|---------------|
| Google Maps | High | GOOGLE_MAPS_API_KEY | No |

---

## Authentication

- Auth type: JWT Bearer
- Auth endpoints: POST /api/auth/login, POST /api/auth/register
- Protected routes: /dashboard, /profile

---

## Redis Signal

- Needed: Yes / No
- Reason: [e.g. session storage detected]
```

---

## Phase 3 · credentials-report.md 凭证报告

Generate `credentials-report.md` immediately after analysis, **before any code is generated**.

If there are `Required` credentials, present the report and say:
> "The following credentials are required. Please confirm you have them (or note which ones you'll add later), then tell me to proceed."

**Wait for explicit user acknowledgment.**

If user confirms they lack a credential, proceed and add `// TODO: [ENV_VAR] required — see credentials-report.md` at every usage site.

### credentials-report.md Template

```markdown
# Credentials Report: [domain]

> ⚠️  Fill **Required** items in `.env` before starting. Optional items can be omitted.

## Required Credentials

| Credential | Service | Env Variable | How to Obtain |
|---|---|---|---|
| Maps API Key | Google Maps | `GOOGLE_MAPS_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/apis/) → Enable Maps JavaScript API → Create API Key |

## Optional Credentials

| Credential | Service | Env Variable | Feature Impact if Missing |
|---|---|---|---|

## Security Notes

- ⚠️ `STRIPE_SK`, `OPENAI_API_KEY`, and all `*_SECRET*` vars are **server-side only** — never use in `NEXT_PUBLIC_*` or frontend code
- All secrets must be in `.env` (gitignored), never committed

## No Credentials Needed

[List any services that require no developer key, or state "None"]
```

---

## Phase 4a · Next.js Frontend Generation 前端生成

### Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout: next/font, Providers, global metadata
│   ├── page.tsx            # Home page
│   ├── globals.css         # @tailwind directives + :root CSS custom properties
│   └── (routes)/
│       └── [route]/page.tsx
├── components/
│   ├── ui/                 # shadcn/ui components (generate only what's needed)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── sections/           # One file per identified section
│       ├── Hero.tsx
│       └── [SectionName].tsx
├── lib/
│   ├── api.ts              # Axios instance: baseURL = NEXT_PUBLIC_API_URL
│   ├── query-client.ts     # TanStack Query client
│   └── utils.ts            # cn() helper
├── hooks/                  # Custom hooks (useAuth, useInfiniteScroll, etc.)
├── types/
│   └── index.ts            # TypeScript interfaces mirroring backend DTOs
├── public/
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json           # strict: true
└── package.json
```

### package.json dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.51.0",
    "zustand": "^4.5.4",
    "axios": "^1.7.3",
    "react-hook-form": "^7.52.2",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",
    "framer-motion": "^11.3.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.414.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.6",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40"
  }
}
```

> Add `next-auth` if auth detected. Add `@radix-ui/*` packages as shadcn/ui installs them.

### Pixel-Perfect CSS Rules 像素级复刻规则

**RULE: Never approximate. Always use extracted exact values.**

```tsx
// ✅ Correct — exact extracted value
<div className="bg-[#0f172a] rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.12)]">

// ❌ Wrong — nearest Tailwind preset
<div className="bg-slate-900 rounded-xl shadow-lg">
```

Apply exact values via:
1. **Tailwind arbitrary values** for one-off values: `bg-[#hex]`, `text-[16px]`, `rounded-[8px]`
2. **CSS custom properties** in `globals.css` for values used 3+ times:
   ```css
   :root {
     --color-primary: #6366f1;
     --color-bg: #0f172a;
     --radius-card: 12px;
   }
   ```
3. **`style` prop** for complex values (multi-stop gradients, multi-layer shadows):
   ```tsx
   <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
   ```

### Font Setup (next/font)

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], weight: ['400', '600', '700'] })
```

Replace all `<link>` Google Fonts imports with `next/font`.

### Image Setup (next/image)

```tsx
import Image from 'next/image'
// Use extracted width/height from computed styles
<Image src="/images/hero.png" alt="Hero" width={600} height={400} priority />
// For external images not bundled:
<Image src="https://placehold.co/600x400?text=Hero" alt="Hero" width={600} height={400} unoptimized />
```

### shadcn/ui Component Mapping

| Original Pattern | shadcn/ui Component | Install Command |
|---|---|---|
| Dropdown nav | `NavigationMenu` | `npx shadcn-ui@latest add navigation-menu` |
| Modal/overlay | `Dialog` | `npx shadcn-ui@latest add dialog` |
| Mobile drawer | `Sheet` | `npx shadcn-ui@latest add sheet` |
| Accordion/FAQ | `Accordion` | `npx shadcn-ui@latest add accordion` |
| Toast/notification | `Sonner` | `npx shadcn-ui@latest add sonner` |
| Tooltip | `Tooltip` | `npx shadcn-ui@latest add tooltip` |
| Select / combobox | `Select` | `npx shadcn-ui@latest add select` |

### Framer Motion Animation Rules

Match the extracted `transition` / `animation` values:

```tsx
import { motion } from 'framer-motion'

// Hover lift (extracted: transform 0.2s ease, box-shadow 0.2s ease)
<motion.div
  whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>

// Section entrance (extracted: opacity + translateY animation)
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
```

### TanStack Query Data Fetching

```tsx
// hooks/usePosts.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/posts').then(r => r.data),
  })
}

// In component:
const { data, isLoading, isError } = usePosts()
if (isLoading) return <PostsSkeleton />   // skeleton matching section layout
if (isError) return <p className="text-red-500">Failed to load</p>
```

### Form Generation (React Hook Form + Zod)

Infer schema from original form's `<input name type required>` attributes:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const form = useForm({ resolver: zodResolver(schema) })
```

### API Client Setup

```ts
// lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  withCredentials: true,
})

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

## Phase 4b · NestJS Backend Generation 后端生成

### Project Structure

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   └── database.config.ts
│   └── [feature]/
│       ├── [feature].module.ts
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       ├── entities/[feature].entity.ts
│       └── dto/
│           ├── create-[feature].dto.ts
│           └── update-[feature].dto.ts
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── Dockerfile
└── package.json
```

### package.json

```json
{
  "dependencies": {
    "@nestjs/common": "^10.3.10",
    "@nestjs/core": "^10.3.10",
    "@nestjs/platform-express": "^10.3.10",
    "@nestjs/config": "^3.2.3",
    "@nestjs/swagger": "^7.4.0",
    "@nestjs/typeorm": "^10.0.2",
    "typeorm": "^0.3.20",
    "mysql2": "^3.10.3",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.2",
    "@nestjs/testing": "^10.3.10",
    "typescript": "^5.5.4",
    "@types/node": "^22.0.0",
    "@types/express": "^4.17.21"
  }
}
```

> Add `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt` if auth detected.
> Add `@nestjs/cache-manager`, `cache-manager-ioredis`, `ioredis` if Redis needed.

### main.ts Template

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true })

  const config = new DocumentBuilder()
    .setTitle('[Domain] API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))

  await app.listen(process.env.PORT ?? 3001)
}
bootstrap()
```

### Feature Module Template (per entity)

**[feature].entity.ts:**
```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('[feature]s')
export class [Feature]Entity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'varchar', length: 255 })
  name: string

  // Add columns from inferred model; use these type mappings:
  // string → varchar(255)
  // text/longtext → text
  // number/integer → int
  // float/decimal → decimal(10,2)
  // boolean → boolean
  // Date → datetime
  // object/JSON → json

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

**TypeORM field type mapping:**

| Inferred JS type | TypeORM column type | MySQL type |
|---|---|---|
| `string` (short) | `varchar` | VARCHAR(255) |
| `string` (long/html) | `text` | TEXT |
| `number` (integer) | `int` | INT |
| `number` (float) | `decimal` | DECIMAL(10,2) |
| `boolean` | `boolean` | TINYINT(1) |
| `Date` | `datetime` | DATETIME |
| `object` / nested | `json` | JSON |
| enum-like string | `enum` | ENUM |

**create-[feature].dto.ts:**
```ts
import { IsString, IsOptional, IsNumber, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Create[Feature]Dto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string
}
```

**[feature].controller.ts — full CRUD:**
```ts
@ApiTags('[feature]s')
@Controller('[feature]s')
export class [Feature]Controller {
  constructor(private readonly service: [Feature]Service) {}

  @Get()
  @ApiOperation({ summary: 'List all [feature]s' })
  findAll() { return this.service.findAll() }

  @Get(':id')
  @ApiOperation({ summary: 'Get [feature] by id' })
  findOne(@Param('id') id: string) { return this.service.findOne(+id) }

  @Post()
  @ApiOperation({ summary: 'Create [feature]' })
  create(@Body() dto: Create[Feature]Dto) { return this.service.create(dto) }

  @Patch(':id')
  @ApiOperation({ summary: 'Update [feature]' })
  update(@Param('id') id: string, @Body() dto: Update[Feature]Dto) {
    return this.service.update(+id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete [feature]' })
  remove(@Param('id') id: string) { return this.service.remove(+id) }
}
```

### Auth Module (conditional — generate only if auth detected)

Generate `src/auth/` with:
- `POST /auth/login` → validates credentials, returns `{ access_token: string }`
- `POST /auth/register` → hashes password with bcrypt, creates user
- `GET /auth/me` → returns current user from JWT payload
- `JwtAuthGuard` + `JwtStrategy` (Passport)
- Decorate protected controller methods with `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`

### Redis Cache Module (conditional — enable only if Redis signal detected)

```ts
// app.module.ts addition
import { CacheModule } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-ioredis'

CacheModule.registerAsync({
  isGlobal: true,
  useFactory: () => ({
    store: redisStore,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379'),
    ttl: 300,
  }),
})
```

---

## Phase 5 · Infrastructure 基础设施

### docker-compose.yml

```yaml
version: '3.9'

services:
  mysql:
    image: mysql:8.0
    container_name: ${COMPOSE_PROJECT_NAME:-app}-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "${MYSQL_PORT:-3306}:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # redis:                          # Uncomment if Redis is needed
  #   image: redis:7-alpine
  #   container_name: ${COMPOSE_PROJECT_NAME:-app}-redis
  #   restart: unless-stopped
  #   ports:
  #     - "${REDIS_PORT:-6379}:6379"
  #   volumes:
  #     - redis_data:/data

volumes:
  mysql_data:
  # redis_data:

networks:
  default:
    name: ${COMPOSE_PROJECT_NAME:-app}-network
```

> If Redis signal detected: uncomment the `redis` service block and `redis_data` volume.

### .env.example

```dotenv
# ── Project ───────────────────────────────────────
COMPOSE_PROJECT_NAME=app

# ── Database ──────────────────────────────────────
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=app_db
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_HOST=localhost
MYSQL_PORT=3306

# ── Redis (uncomment if enabled in docker-compose) ─
# REDIS_HOST=localhost
# REDIS_PORT=6379

# ── Backend (NestJS) ──────────────────────────────
PORT=3001
JWT_SECRET=change_me_to_a_random_string_minimum_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# ── Frontend (Next.js) ────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# ── Third-Party API Keys ──────────────────────────
# [Auto-populated from credentials-detection phase]
# GOOGLE_MAPS_API_KEY=
# STRIPE_SK=                # backend only
# NEXT_PUBLIC_STRIPE_PK=
# OPENAI_API_KEY=           # backend only
```

### backend/Dockerfile (production template)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/main"]
```

### README.md

```markdown
# [Domain] Clone

Full-stack clone of [original URL]. Generated by copy-web skill.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: NestJS 10 + TypeORM
- **Database**: MySQL 8.0 (Docker)
- **Cache**: Redis 7 (Docker) — [enabled / not required]

## Quick Start

> ⚠️  See `credentials-report.md` — fill in Required credentials in `.env` before starting.
> (Remove this warning if credentials-report says none are required.)

### 1. Configure environment

cp .env.example .env
# Edit .env — set database passwords and any required API keys

### 2. Start database

docker compose up -d

### 3. Start backend

cd backend
npm install
npm run start:dev
# API: http://localhost:3001
# Swagger: http://localhost:3001/api/docs

### 4. Start frontend

cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

---

## Phase 6 · copy-report.md 复刻报告

```markdown
# Copy Report: [Original URL]

Generated: [date] | Project: ./<domain>-clone/

## Pages Cloned

| Page | Original URL | Frontend File | Status |
|------|-------------|---------------|--------|
| Home | https://example.com/ | frontend/app/page.tsx | ✅ |

## Feature Coverage

| Feature | Frontend | Backend | Database | Status | Notes |
|---------|----------|---------|----------|--------|-------|
| User list | useUsers() → /users | GET /users | users table | ✅ | |
| Auth login | LoginForm + JWT store | POST /auth/login | users.password | ✅ | |
| Map widget | GoogleMap component | N/A | N/A | 🔲 Needs key | GOOGLE_MAPS_API_KEY required |
| Carousel animation | Framer Motion | N/A | N/A | ✅ | |
| Canvas hero | N/A | N/A | N/A | ❌ | Canvas/WebGL — not cloned |

## API Endpoints

| Method | Endpoint | Status | Notes |
|--------|----------|--------|-------|
| GET | /posts | ✅ Implemented | |
| POST | /auth/login | ✅ Implemented | |

## Design Fidelity

| Property | Original | Applied | Delta |
|----------|----------|---------|-------|
| Primary color | #6366f1 | #6366f1 | None |
| Hero font-size | 56px | 56px | None |
| Card radius | 12px | 12px | None |

## Manual Follow-Up

1. **Fill credentials** — see `credentials-report.md`
2. **Run `npm install`** in both `frontend/` and `backend/` before starting
3. **Verify mobile layout** at 375px
4. **[Any ❌ Not covered items]** — listed above with suggested approach
```

---

## Error Handling 错误处理

| Situation | Action |
|-----------|--------|
| Page requires login | Stop; ask user to paste HTML or provide screenshot |
| Fetch timeout >15 s | Retry once; on second failure ask for static HTML |
| Canvas / WebGL | Mark ❌ Not covered in copy-report; suggest Three.js / react-three-fiber |
| Unknown font | Default to `system-ui, sans-serif`; note in Design Fidelity table |
| 5+ pages discovered | List all; ask user to select max 5 |
| Missing required credential | Add `// TODO` comment at every usage site; note in copy-report |
