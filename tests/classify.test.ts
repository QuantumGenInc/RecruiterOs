import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Page } from "@playwright/test";

const prisma = new PrismaClient();
const TS = Date.now();

const recruiter = { email: `recruiter-ai-${TS}@test.os`, password: "testpass123" };
let userId: string;
let profileId: string;
let genuineEmailId: string;
let phishingEmailId: string;

test.beforeAll(async () => {
  const hashed = await bcrypt.hash("testpass123", 10);
  const user = await prisma.user.create({
    data: { email: recruiter.email, password: hashed, role: "RECRUITER" },
  });
  userId = user.id;

  const profile = await prisma.recruiterProfile.create({
    data: { userId, gmailConnected: true, gmailEmail: "recruiter@gmail.com" },
  });
  profileId = profile.id;

  const genuine = await prisma.rawEmail.create({
    data: {
      recruiterId: profileId,
      gmailMessageId: `genuine-${TS}`,
      subject: "Senior Software Engineer - $160k - Austin TX - TechCorp",
      fromEmail: "sarah.johnson@techcorp.com",
      fromName: "Sarah Johnson",
      bodyText: `Hi,

I came across your profile and wanted to reach out about an exciting opportunity at TechCorp Inc.

Role: Senior Software Engineer
Company: TechCorp Inc.
Location: Austin, TX (Hybrid - 3 days in office)
Salary: $150,000 - $170,000 per year + equity
Type: Full-time

Responsibilities:
- Design and build scalable backend APIs using Node.js and TypeScript
- Lead a team of 3 junior engineers and conduct code reviews
- Collaborate with product managers to define technical requirements
- Maintain 99.9% uptime SLAs for our core payment platform

Requirements:
- 5+ years of software engineering experience
- Strong proficiency in Node.js, TypeScript, PostgreSQL
- Experience with AWS (EC2, RDS, Lambda)
- Prior team lead experience preferred

Please reply directly to sarah.johnson@techcorp.com or apply at https://techcorp.com/careers/senior-engineer-123

Looking forward to connecting!

Sarah Johnson
Senior Technical Recruiter
TechCorp Inc. | sarah.johnson@techcorp.com | (512) 555-0182`,
      receivedAt: new Date(),
    },
  });
  genuineEmailId = genuine.id;

  const phishing = await prisma.rawEmail.create({
    data: {
      recruiterId: profileId,
      gmailMessageId: `phishing-${TS}`,
      subject: "URGENT: Your account suspended - verify NOW",
      fromEmail: "security@paypa1-alerts.xyz",
      fromName: "PayPal Security",
      bodyText: `URGENT ACCOUNT SUSPENSION NOTICE

Your PayPal account has been suspended due to unusual activity.

You MUST verify your identity immediately or your account will be permanently closed within 24 HOURS.

Click here immediately: http://paypa1-verify.xyz/urgent-login-now

You will need to provide:
- Username and Password
- Credit card number and CVV
- Social Security Number
- Date of Birth

WARNING: Failure to verify within 24 hours will result in permanent account termination and loss of all funds.

This is your FINAL WARNING.

PayPal Security Department`,
      receivedAt: new Date(),
    },
  });
  phishingEmailId = phishing.id;
});

test.afterAll(async () => {
  await prisma.flaggedEmail.deleteMany({ where: { rawEmail: { recruiterId: profileId } } });
  await prisma.job.deleteMany({ where: { recruiterId: profileId } });
  await prisma.rawEmail.deleteMany({ where: { recruiterId: profileId } });
  await prisma.recruiterProfile.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
});

async function loginAsRecruiter(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', recruiter.email);
  await page.fill('input[type="password"]', recruiter.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/recruiter", { timeout: 15000 });
}

test("classify endpoint returns 401 without session", async ({ page }) => {
  const res = await page.request.post("/api/classify", {
    data: { rawEmailId: genuineEmailId },
  });
  expect(res.status()).toBe(401);
});

test("classify endpoint returns 400 without rawEmailId", async ({ page }) => {
  await loginAsRecruiter(page);
  const res = await page.request.post("/api/classify", { data: {} });
  expect(res.status()).toBe(400);
});

test("classifies genuine recruiter email as GENUINE and creates Job", async ({ page }) => {
  await loginAsRecruiter(page);
  const res = await page.request.post("/api/classify", {
    data: { rawEmailId: genuineEmailId },
  });
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.classification).toBe("GENUINE");

  const job = await prisma.job.findFirst({ where: { rawEmailId: genuineEmailId } });
  expect(job).not.toBeNull();
  expect(job!.status).toBe("PUBLISHED");
  expect(job!.title).toBeTruthy();
});

test("classifies phishing email as PHISHING and creates FlaggedEmail", async ({ page }) => {
  await loginAsRecruiter(page);
  const res = await page.request.post("/api/classify", {
    data: { rawEmailId: phishingEmailId },
  });
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.classification).toBe("PHISHING");

  const flagged = await prisma.flaggedEmail.findFirst({
    where: { rawEmailId: phishingEmailId },
  });
  expect(flagged).not.toBeNull();
  expect(flagged!.reason).toBeTruthy();
});

test("already-classified email returns existing classification", async ({ page }) => {
  await loginAsRecruiter(page);
  // Genuine email is already classified from previous test
  const res = await page.request.post("/api/classify", {
    data: { rawEmailId: genuineEmailId },
  });
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.classification).toBe("GENUINE");
});
