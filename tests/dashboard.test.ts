import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Page } from "@playwright/test";

const prisma = new PrismaClient();
const TS = Date.now();

const recruiter = { email: `recruiter-dash-${TS}@test.os`, password: "testpass123" };
let userId: string;
let profileId: string;
let phishingEmailId: string;

test.beforeAll(async () => {
  const hashed = await bcrypt.hash("testpass123", 10);
  const user = await prisma.user.create({
    data: { email: recruiter.email, password: hashed, role: "RECRUITER" },
  });
  userId = user.id;

  const profile = await prisma.recruiterProfile.create({
    data: { userId, gmailConnected: false },
  });
  profileId = profile.id;

  await prisma.rawEmail.create({
    data: {
      recruiterId: profileId,
      gmailMessageId: `dash-genuine-${TS}`,
      subject: "Dashboard Test - Genuine Job",
      fromEmail: "hr@genuine.com",
      classification: "GENUINE",
      receivedAt: new Date(),
    },
  });

  const phishing = await prisma.rawEmail.create({
    data: {
      recruiterId: profileId,
      gmailMessageId: `dash-phishing-${TS}`,
      subject: "Dashboard Test - Phishing Email",
      fromEmail: "scam@bad.xyz",
      classification: "PHISHING",
      receivedAt: new Date(),
    },
  });
  phishingEmailId = phishing.id;

  await prisma.rawEmail.create({
    data: {
      recruiterId: profileId,
      gmailMessageId: `dash-pending-${TS}`,
      subject: "Dashboard Test - Pending Email",
      fromEmail: "unknown@somewhere.com",
      classification: "PENDING",
      receivedAt: new Date(),
    },
  });

  await prisma.flaggedEmail.create({
    data: {
      rawEmailId: phishingEmailId,
      reason: "Suspicious domain and urgent language",
    },
  });

  await prisma.job.create({
    data: {
      recruiterId: profileId,
      title: "Dashboard Test Job Position",
      company: "TestCo",
      status: "PUBLISHED",
    },
  });
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

test("email feed page shows all emails", async ({ page }) => {
  await loginAsRecruiter(page);
  await page.goto("/dashboard/recruiter/email-feed");
  await expect(page.getByText("Dashboard Test - Genuine Job")).toBeVisible();
  await expect(page.getByText("Dashboard Test - Phishing Email")).toBeVisible();
  await expect(page.getByText("Dashboard Test - Pending Email")).toBeVisible();
});

test("email feed page shows classification badges", async ({ page }) => {
  await loginAsRecruiter(page);
  await page.goto("/dashboard/recruiter/email-feed");
  await expect(page.getByText("GENUINE", { exact: true })).toBeVisible();
  await expect(page.getByText("PHISHING", { exact: true })).toBeVisible();
  await expect(page.getByText("PENDING", { exact: true })).toBeVisible();
});

test("flagged page shows phishing email with reason", async ({ page }) => {
  await loginAsRecruiter(page);
  await page.goto("/dashboard/recruiter/flagged");
  await expect(page.getByText("Dashboard Test - Phishing Email")).toBeVisible();
  await expect(page.getByText(/Suspicious domain/)).toBeVisible();
});

test("flagged page does not show genuine or pending emails", async ({ page }) => {
  await loginAsRecruiter(page);
  await page.goto("/dashboard/recruiter/flagged");
  await expect(page.getByText("Dashboard Test - Genuine Job")).not.toBeVisible();
  await expect(page.getByText("Dashboard Test - Pending Email")).not.toBeVisible();
});

test("jobs page shows recruiter job with status", async ({ page }) => {
  await loginAsRecruiter(page);
  await page.goto("/dashboard/recruiter/jobs");
  await expect(page.getByText("Dashboard Test Job Position")).toBeVisible();
  await expect(page.getByText("PUBLISHED", { exact: true })).toBeVisible();
});

test("sidebar shows email feed, flagged, and jobs nav links", async ({ page }) => {
  await loginAsRecruiter(page);
  await expect(page.getByRole("link", { name: /email feed/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /flagged/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /jobs/i })).toBeVisible();
});

test("unauthenticated access to email-feed redirects to login", async ({ page }) => {
  await page.goto("/dashboard/recruiter/email-feed");
  await expect(page).toHaveURL(/.*login.*/);
});

test("unauthenticated access to flagged redirects to login", async ({ page }) => {
  await page.goto("/dashboard/recruiter/flagged");
  await expect(page).toHaveURL(/.*login.*/);
});

test("unauthenticated access to jobs redirects to login", async ({ page }) => {
  await page.goto("/dashboard/recruiter/jobs");
  await expect(page).toHaveURL(/.*login.*/);
});
