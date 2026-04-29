# DESIGN.md — RecruiterOs UI

## Theme
Dark robotics. Inspired by RoboCore reference.
Colors: #0a0a0f (bg), #00e5ff (cyan accent), #1a1a2e (card bg), #ffffff (text)
Font: Inter or Space Grotesk

## Pages

### /login (Candidate + Recruiter)
- Split layout: left = branding + robot graphic, right = login form
- Fields: Email, Password
- Button: "Initialize Login" (cyan, full width)
- Link: "Register" for new candidates

### /dashboard/candidate — Opportunities
- Top nav: Logo, Opportunities, Profile, Logout
- Page title: "Latest Opportunities"
- Jobs displayed as cards (3 per row on desktop, 1 on mobile)
- Each card shows: Job title, Company, Pay, Location, Work type, Status badge
- "View Details" button → opens full JD page
- Full JD page shows: all extracted info + contact buttons (Email / LinkedIn / Phone)

### /dashboard/recruiter — Email Feed
- Sidebar nav: Home, Email Feed, Flagged, Jobs
- Email feed: list of processed emails with classification badge
- Flagged tab: suspicious emails with reason
- Clean table layout, cyan accents on badges

## Components
- JobCard → title, company, pay, location, badge, button
- NavBar → logo + links + avatar
- Badge → "Genuine" (green) / "Flagged" (red) / "New" (cyan)
- ContactButton → Email | LinkedIn | Phone

## Mobile
- All pages fully responsive
- Cards stack to single column
- Nav collapses to hamburger menu

## Principles
- No clutter. Only what candidates need.
- Fast load. No unnecessary animations.
- Every page works on mobile browser (Phase 1)
- Expo React Native app wraps same API (Phase 2)