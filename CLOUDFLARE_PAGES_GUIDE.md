# Complete Next.js (App Router) + Cloudflare Pages Edge Deployment Guide

This guide details the complete production setup for deploying **MD. Shinha Sarder's Blogger CMS** on **Cloudflare Pages** using the **Edge Runtime (`@cloudflare/next-on-pages`)**, **Prisma ORM with Neon/Supabase**, **NextAuth.js (Auth.js)**, and the **TipTap Rich Text Editor with Link & Text Highlight Styling**.

---

## 1. Terminal Commands & Project Initialization

### A. Clone & Install Dependencies
```bash
# Install Next.js and core frameworks
npm install next@14.2.18 react@18.3.1 react-dom@18.3.1

# Install Cloudflare Pages Edge adapter & Wrangler CLI
npm install -D @cloudflare/next-on-pages wrangler @cloudflare/workers-types

# Install Prisma ORM & Edge Driver Adapters (Neon/PostgreSQL)
npm install @prisma/client @neondatabase/serverless
npm install -D prisma @prisma/adapter-neon

# Install NextAuth / Auth.js (Edge-compatible)
npm install next-auth@5.0.0-beta.25

# Install TipTap Rich Text Editor with Highlight and Link extensions
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-highlight

# Install UI & Utility libraries
npm install lucide-react sonner clsx tailwind-merge
```

### B. Database Migration (Prisma + Neon / Supabase)
```bash
# Generate Prisma Client with driverAdapters support
npx prisma generate

# Push database schema to your PostgreSQL database (Neon or Supabase)
npx prisma db push
```

---

## 2. Project Architecture & File Hierarchy

```
├── prisma/
│   └── schema.prisma                   # Database Schema (Post, SiteSettings, User)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts        # Edge Runtime NextAuth handler
│   │   │   └── posts/
│   │   │       └── route.ts            # Edge Runtime Posts API (GET, POST)
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin Sidebar & Shell with Highlighted Nav
│   │   │   └── posts/
│   │   │       └── new/
│   │   │           └── page.tsx        # Post Creation with TipTap & Highlight Links
│   │   ├── layout.tsx                  # Global Next.js root layout
│   │   └── page.tsx                    # Public Homepage
│   ├── components/
│   │   └── editor/
│   │       └── TipTapEditor.tsx        # TipTap Editor with Gold Highlight & Link Bar
│   └── lib/
│       ├── auth.ts                     # Edge-compatible Auth configuration
│       └── prisma.ts                   # Edge-compatible Prisma Client
├── next.config.mjs                     # Next.js & Edge configuration
├── wrangler.toml                       # Cloudflare Pages & nodejs_compat config
└── package.json
```

---

## 3. Database Schema (`prisma/schema.prisma`)

Configured specifically with `previewFeatures = ["driverAdapters"]` so Prisma can run inside Cloudflare Pages V8 isolates without standard Node TCP binaries:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

enum Role {
  USER
  ADMIN
  EDITOR
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Post {
  id             String     @id @default(cuid())
  title          String
  slug           String     @unique
  excerpt        String?    @db.Text
  content        String     @db.Text
  coverUrl       String?    @map("cover_url")
  categories     String[]   @default([])
  tags           String[]   @default([])
  status         PostStatus @default(DRAFT)
  publishedAt    DateTime?  @map("published_at")
  views          Int        @default(0)
  seoTitle       String?    @map("seo_title")
  seoDescription String?    @map("seo_description") @db.Text
  createdAt      DateTime   @default(now()) @map("created_at")
  updatedAt      DateTime   @updatedAt @map("updated_at")

  @@index([slug])
  @@index([status, publishedAt(sort: Desc)])
  @@map("posts")
}

model SiteSettings {
  id                 String   @id @default("default")
  siteName           String   @default("MD. Shinha Sarder") @map("site_name")
  siteDescription    String   @default("Founder & CEO of IT Tech BD and Biostar TV World") @map("site_description") @db.Text
  authorName         String   @default("MD. Shinha Sarder") @map("author_name")
  authorBio          String?  @map("author_bio") @db.Text
  avatarUrl          String?  @map("avatar_url")
  socialLinks        Json?    @map("social_links")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  @@map("site_settings")
}
```

---

## 4. Link & Text Highlight Styling ("Highlight Color Use")

To satisfy the highlight color styling requirement, links throughout the admin dashboard, TipTap editor, and blog articles use an illuminated amber/gold glow palette:

```css
/* All Links with Amber/Gold Highlight Glow */
.highlight-link,
.prose a,
.ProseMirror a {
  color: #fbbf24 !important;
  background-color: rgba(245, 158, 11, 0.12) !important;
  padding: 0.125rem 0.375rem !important;
  border-radius: 0.25rem !important;
  text-decoration: underline !important;
  text-decoration-color: rgba(251, 191, 36, 0.6) !important;
  text-underline-offset: 4px !important;
  transition: all 0.2s ease-in-out !important;
  font-weight: 500 !important;
}

.highlight-link:hover,
.prose a:hover,
.ProseMirror a:hover {
  color: #fef08a !important;
  background-color: rgba(245, 158, 11, 0.25) !important;
  text-decoration-color: #fef08a !important;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.25) !important;
}
```

In the TipTap editor toolbar, writers can click the **Highlight** button or **Link** button to apply the golden accent directly to any selected phrase.

---

## 5. Cloudflare Pages Deployment Configuration

### Step 1: Connect to Cloudflare Dashboard
1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select your repository `md-shinha-sarder/mdshinhasarder-af259ec5`.

### Step 2: Build & Output Settings
Configure the build presets in Cloudflare Pages:
- **Framework preset**: `None`
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `/` (Leave empty)

### Step 3: Compatibility Flags (CRITICAL)
In **Settings** → **Functions** → **Compatibility Flags**:
- **Production compatibility flag**: Add `nodejs_compat`
- **Preview compatibility flag**: Add `nodejs_compat`
- **Compatibility date**: `2024-09-23` (or newer)

### Step 4: Environment Variables (Settings → Environment variables)
Add the following variables:
- `NODE_VERSION`: `20.18.0` or `22.x`
- `DATABASE_URL`: Your pooled PostgreSQL connection string from Neon or Supabase (e.g. `postgresql://user:pass@ep-cool-pooler.neon.tech/neondb?sslmode=require`)
- `DIRECT_URL`: Direct non-pooled PostgreSQL URL for migrations (e.g. `postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require`)
- `AUTH_SECRET`: Random 32+ character string (e.g. run `openssl rand -base64 32`)
- `NEXTAUTH_URL`: `https://your-domain.pages.dev` or `https://mdshinhasarder.com`
- `ADMIN_EMAIL`: `shinhasarder2343@gmail.com`
- `ADMIN_PASSWORD`: Your chosen secure master password

---

## 6. Testing Locally with Cloudflare Edge Emulation
```bash
# Build with Cloudflare next-on-pages locally
npx @cloudflare/next-on-pages

# Run edge preview locally using Wrangler
npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat
```
