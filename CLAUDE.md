# CLAUDE.md — RecruiterOs

## Stack
- Next.js 14 App Router, TypeScript, Tailwind CSS
- Prisma ORM, Supabase PostgreSQL
- NextAuth.js (email+password)
- Claude AI (claude-sonnet-4-20250514)
- Gmail API (OAuth2)
- Resend (email)
- Playwright (E2E tests)

## Rules
- Max 200 lines per file. Split if exceeded.
- One feature at a time. All tests pass before next feature.
- After tests pass: git add . && git commit -m "feat: [name] - tests passing" && git push
- Never commit failing tests. Never commit .env.
- Use environment variables for all secrets.

## File Structure
/app          → Next.js pages and API routes
/components   → UI components (max 200 lines each)
/lib          → Utilities, helpers, clients
/prisma       → Schema and migrations
/services     → Business logic (email, AI, gmail)
/tests        → Playwright E2E tests

## Agent Pattern
Launch focused sub-agents for:
- `gmail-agent` → polls Gmail, stores raw emails
- `ai-agent` → classifies and extracts job data
- `notify-agent` → sends recruiter notifications via Resend

## Commands
npm run dev          → start dev server
npm run test         → run playwright tests
npx prisma migrate dev → run migrations
npx prisma studio    → view database

## Prisma Config
Always use both DATABASE_URL and DIRECT_URL in schema.prisma datasource block.

## Git
Commit after every passing feature:
git add . && git commit -m "feat: [feature] - all tests passing" && git push origin main