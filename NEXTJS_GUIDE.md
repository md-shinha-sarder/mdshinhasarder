# Next.js & Deployment Architecture Guide

## 1. Project Runtime Architecture
This project is currently built with **Vite + React 18 + TypeScript + Tailwind CSS** with client-side SPA routing (`react-router-dom`).

### Why Vite SPA for this Portfolio:
- **Instant Cloudflare Pages & Vercel deployment**: Builds in seconds to static `dist/` with 0 server maintenance or cold-starts.
- **Edge Data Fetching**: Directly connects to Supabase Edge Functions for dynamic posts, videos, and reels.
- **SEO & Social Sharing**: Already configured with `react-helmet-async`, structured JSON-LD schema, and OpenGraph meta tags.

---

## 2. Deploying to Vercel (No Output Directory Errors)
If you deploy this repository to Vercel:
1. `vercel.json` is now configured with:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```
2. In the Vercel dashboard:
   - **Framework Preset**: Select **Vite** (not Next.js).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

---

## 3. Deploying to Cloudflare Pages
`wrangler.toml` is pre-configured with:
```toml
name = "mdshinhasarder-blogger-cms"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"
```
Command in Cloudflare Pages:
- **Build command**: `npm run build`
- **Build output directory**: `dist`

---

## 4. Full Next.js Conversion (If Full SSR / Server Components Needed)
If you want to convert this repository into a Next.js (App Router) project in the future:
1. Install Next.js: `npm install next@latest react@latest react-dom@latest`
2. Update `package.json` scripts:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start"
   }
   ```
3. Move `src/pages/Index.tsx` to `app/page.tsx` using `"use client"`.
4. Wrap layout in `app/layout.tsx` with your font and global CSS imports.
