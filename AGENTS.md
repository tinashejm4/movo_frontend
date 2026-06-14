# Movo Frontend - AI Agent Instructions

## Project Overview

Movo is a Next.js 16.2.7 + React 19.2.4 e-commerce/logistics management frontend built with TypeScript, Tailwind CSS v4, and the App Router. The app manages customer accounts and staff task workflows.

## ⚠️ Critical Next.js Version Notes

**This version has breaking changes** — APIs, conventions, and file structure may differ from your training data. Before writing code:
- Check [Next.js 16 docs](https://nextjs.org/docs) for API changes
- Review deprecation notices in official documentation
- Test incrementally with `npm run dev`

## Tech Stack

| Tech | Version | Notes |
|------|---------|-------|
| Next.js | 16.2.7 | App Router (not Pages Router) |
| React | 19.2.4 | Latest with hooks |
| TypeScript | ^5 | Strict mode enabled |
| Tailwind CSS | ^4 | New @tailwindcss/postcss package |
| ESLint | ^9 | Next.js + TypeScript configs |

## Project Structure

```
app/
├── page.tsx              # Home page with navigation
├── layout.tsx            # Root layout
├── globals.css           # Global styles (Tailwind)
├── account/page.tsx      # Account management page
├── staff/page.tsx        # Staff task dashboard
├── staff/login/page.tsx  # Staff login
└── components/
    └── addToCart.tsx     # Client-side component example
```

## Key Conventions

### File Naming
- Default exports use lowercase names (e.g., `button1` in [addToCart.tsx](app/components/addToCart.tsx))
- Page files are `page.tsx` in route directories (App Router convention)
- Styles use CSS modules: `styles.module.css`

### Component Patterns
- Client components start with `'use client'` directive
- Use path alias `@/*` for imports (maps to project root)
- React hooks usage: `useState`, etc. for client components

### Styling
- **Tailwind CSS**: Use utility classes in JSX (e.g., `className="text-blue-300"`)
- **CSS Modules**: For scoped styles, import as: `import styles from "./styles.module.css"`
- Dark mode support available in Tailwind config

### TypeScript
- Strict mode enabled (`"strict": true`)
- All components should have proper type annotations
- Path resolution configured via `tsconfig.json`

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Run production build
npm lint         # Run ESLint
```

## Current Features & Pages

| Page | Route | Status | Purpose |
|------|-------|--------|---------|
| Home | `/` | Active | Navigation hub with link to /account |
| Account | `/account` | Basic | User account management placeholder |
| Staff Dashboard | `/staff` | Active | Displays pending warehouse tasks |
| Staff Login | `/staff/login` | Basic | Authentication placeholder |

**Staff Dashboard Data**: Currently hardcoded in [app/staff/page.tsx](app/staff/page.tsx). Future: connect to backend API.

## Common Tasks & Patterns

### Creating a New Page
1. Create directory under `app/` (e.g., `app/products/`)
2. Add `page.tsx` with component export
3. Use `'use client'` if interactivity needed
4. Example: `app/products/page.tsx`

### Creating a Reusable Component
1. Add to `app/components/` (e.g., `ProductCard.tsx`)
2. Use TypeScript interfaces for props
3. Add `'use client'` if hooks or event handlers needed

### Adding Styles
- **Global**: Add to `app/globals.css` and import in layout
- **Scoped**: Create `.module.css` and import: `import styles from "./styles.module.css"`
- **Tailwind**: Use `className` prop directly

## ESLint & Code Quality

- ESLint configs: `eslint.config.mjs` (flat config v9+ format)
- Enforces Next.js + TypeScript best practices
- Run validation: `npm lint`

## Potential Pitfalls

1. **Next.js API Changes**: Frequently breaking changes in major versions. Always check official docs.
2. **Server vs Client Components**: Default is server component. Add `'use client'` only when needed.
3. **Hardcoded Data**: [Staff page](app/staff/page.tsx) has hardcoded tasks — plan API integration soon.
4. **Component Naming**: Follow lowercase convention for default exports to match codebase style.

## When You Need Help

- Check [Next.js documentation](https://nextjs.org/docs) for version-specific APIs
- Review [Tailwind CSS docs](https://tailwindcss.com/docs) for styling
- Look at existing pages/components for pattern examples

---

*Last updated: June 2026 | Next.js 16.2.7 | React 19.2.4*
