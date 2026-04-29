# PLAN.md — RecruiterOs Build Plan

## Process (repeat for every feature)
1. Build feature
2. Write Playwright tests
3. Run tests — fix until all pass
4. Commit and push
5. Move to next feature

## Features

### ✅ Feature 0 — Repo + Config
- [x] Git connected
- [x] .env created
- [x] CLAUDE.md, PLAN.md, DESIGN.md

### 🔄 Feature 1 — Project Setup + DB Schema
- [ ] Next.js 14 initialized
- [ ] Prisma configured with DATABASE_URL + DIRECT_URL
- [ ] Schema: User, RecruiterProfile, RawEmail, Job, FlaggedEmail
- [ ] Migrations run successfully
- [ ] Playwright: DB connects, all tables exist
- [ ] Committed and pushed

### Feature 2 — Auth (Recruiter + Candidate)
- [ ] NextAuth email+password
- [ ] Roles: ADMIN, RECRUITER, CANDIDATE
- [ ] Recruiter login → recruiter dashboard
- [ ] Candidate login → candidate dashboard
- [ ] Playwright: login flows for all roles

### Feature 3 — Gmail OAuth + Email Ingestion
- [ ] Recruiter connects Gmail via OAuth2
- [ ] Gmail polling service (every 5 mins)
- [ ] Raw emails stored in DB
- [ ] Playwright: emails fetched and stored

### Feature 4 — AI Classification + Extraction
- [ ] Claude classifies genuine vs phishing
- [ ] Extracts: title, company, pay, location, email, phone, linkedin, links
- [ ] Thin emails expanded into full structured JD
- [ ] Genuine → auto-published as Job
- [ ] Phishing → FlaggedEmail + notify recruiter via Resend
- [ ] Playwright: classification accuracy on sample emails

### Feature 5 — Recruiter Dashboard
- [ ] Email feed view
- [ ] Suspicious/flagged tab
- [ ] Job listings they own
- [ ] Playwright: all views load correctly

### Feature 6 — Candidate Dashboard
- [ ] Signup + login
- [ ] Browse all published jobs
- [ ] Job detail: full JD, pay, location
- [ ] Contact info: email/phone/linkedin displayed
- [ ] Playwright: candidate sees jobs, contact info works

### Feature 7 — Deploy
- [ ] Vercel deployment
- [ ] Supabase production DB
- [ ] Environment variables set
- [ ] Production Gmail OAuth redirect URIs updated