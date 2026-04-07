# Reveta Notebook Changelog

All notable changes to this project will be documented in this file.

## Unreleased

- fix(build): add missing EmptyState props in DashboardClient and React import in Feedback.tsx — resolves strict tsc failures. [FIX-002]
- feat(seo): add robots.ts and sitemap.ts — resolves SEO-BLOCKER, enables Google preview and Lighthouse SEO >= 95. [FIX-003]
- fix(build): remove duplicate DEFAULT_STYLE import in NotebookClient.tsx. Resolves identifier conflict that was blocking next build entirely. [FIX-001]
