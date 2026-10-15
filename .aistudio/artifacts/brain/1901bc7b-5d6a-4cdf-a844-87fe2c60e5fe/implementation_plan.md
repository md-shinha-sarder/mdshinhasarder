# Implementation Plan — Page URL Standardization & Unified 404 Design Board

Configure all page routes to support both Blogger-style `/p/[page].html` links and clean routes seamlessly, update navbar and footer menus to use `/p/*.html` links, and ensure any non-existent post or page renders the verified blue UI/UX Design Board 404 Infobox identical to the preview.

---

## 1. User Review Required

> [!NOTE]
> Based on your selections:
> 1. **URL Routing**: Both `/p/*.html` (e.g., `/p/gallery.html`, `/p/biography.html`, `/p/songs.html`, `/p/books.html`, `/p/publication.html`) and clean paths (`/gallery`, `/biography`, etc.) will be supported simultaneously with automatic canonical tags.
> 2. **Menu Navigation**: Navbar and footer links will be updated to point to `/p/*.html` links.
> 3. **404 Handling**: Any non-existent route, missing blog post, or invalid page will render the blue verified UI/UX Design Board `PageInfobox` with status facts, entity metadata, and quick recovery buttons.

---

## 2. Proposed Changes

### Routing & App Shell (`src/App.tsx`)
- Add explicit route definitions for Blogger-style page URLs:
  - `/p/biography.html` and `/p/about.html` &rarr; `<BiographyPage />`
  - `/p/songs.html` and `/p/music.html` &rarr; `<SongsPage />`
  - `/p/books.html` &rarr; `<BooksPage />`
  - `/p/gallery.html` &rarr; `<GalleryPage />`
  - `/p/publication.html` and `/p/publications.html` &rarr; `<PublicationsPage />`
  - `/p/skills.html` &rarr; `<SkillsPage />`
  - `/p/projects.html` &rarr; `<ProjectsPage />`
  - Also maintain clean aliases (`/biography`, `/songs`, `/books`, `/gallery`, `/publications`, `/skills`, `/projects`).
- Create an intelligent `/p/:slug` page dispatcher:
  - First normalizes `:slug` by stripping `.html` / `.htm`.
  - Dispatches to corresponding static page if matched.
  - If not matched, queries custom CMS pages and posts.
  - If neither exists, renders the verified 404 Design Board Infobox `<NotFound />`.

### Navigation Components (`src/components/Navbar.tsx` & `src/components/FooterSection.tsx`)
- Update navigation items to use `/p/*.html` paths:
  - Biography &rarr; `/p/biography.html`
  - Songs &rarr; `/p/songs.html`
  - Books &rarr; `/p/books.html`
  - Publications &rarr; `/p/publication.html`
  - Gallery &rarr; `/p/gallery.html`
  - Home remains `/`.
- Ensure active link highlighting matches both `/p/[page].html` and standard routes.

### Missing Post & Page 404 Screen (`src/pages/PostDetail.tsx` & `src/pages/NotFound.tsx`)
- Update `PostDetail.tsx` when a requested post is not found:
  - Replace the plain "Post Not Found" card with the complete blue UI/UX Design Board `PageInfobox` component, displaying:
    - Badge: `"HTTP Status 404"` with Compass icon
    - Verified Entity Profile: `"MD. Shinha Sarder"`
    - Stats: 404 Status, 20 Books, 15 Songs, Entity Status Verified
    - Attempted path indicator and direct action buttons (Return Home, Browse Books, Listen to Songs, Read Posts).
- Ensure `src/pages/NotFound.tsx` and `src/pages/404.page.tsx` remain unified with the exact same visual design.

---

## 3. Verification Plan

### Automated Build & Lint Verification
- Run `compile_applet` to guarantee complete build passes without errors.
- Run `lint_applet` to confirm zero ESLint violations.

### Manual Routing Tests
1. **Blogger URL Paths**:
   - Navigate to `/p/gallery.html` &rarr; verifies Gallery page loads.
   - Navigate to `/p/biography.html` &rarr; verifies Biography page loads.
   - Navigate to `/p/songs.html` &rarr; verifies Songs page loads.
   - Navigate to `/p/books.html` &rarr; verifies Books page loads.
   - Navigate to `/p/publication.html` &rarr; verifies Publications page loads.
2. **Missing Page / Post 404 Tests**:
   - Navigate to `/p/unknown-page.html` &rarr; verifies verified blue Design Board 404 Infobox loads.
   - Navigate to `/2026/99/non-existent-article.html` &rarr; verifies verified blue Design Board 404 Infobox loads.
   - Navigate to `/random-invalid-url` &rarr; verifies verified blue Design Board 404 Infobox loads.
3. **Navigation Links**:
   - Click Navbar & Footer links and verify they route to the `/p/*.html` URLs with smooth scroll and active state indicators.
