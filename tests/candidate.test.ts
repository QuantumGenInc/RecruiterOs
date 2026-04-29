import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Page } from "@playwright/test";

const prisma = new PrismaClient();
const TS = Date.now();

const candidate = { email: `candidate-${TS}@test.os`, password: "testpass123" };
let candidateUserId: string;
let recruiterUserId: string;
let recruiterProfileId: string;
let jobId: string;

test.beforeAll(async () => {
  const hashed = await bcrypt.hash("testpass123", 10);

  const candidateUser = await prisma.user.create({
    data: { email: candidate.email, password: hashed, role: "CANDIDATE" },
  });
  candidateUserId = candidateUser.id;

  const recruiterUser = await prisma.user.create({
    data: { email: `recruiter-cand-${TS}@test.os`, password: hashed, role: "RECRUITER" },
  });
  recruiterUserId = recruiterUser.id;

  const profile = await prisma.recruiterProfile.create({
    data: { userId: recruiterUserId },
  });
  recruiterProfileId = profile.id;

  const job = await prisma.job.create({
    data: {
      recruiterId: recruiterProfileId,
      title: "Candidate Test - Senior Engineer",
      company: "Candidate Test Corp",
      pay: "$140,000 - $160,000",
      location: "Remote",
      workType: "Full-time",
      description:
        "This is a detailed job description for testing purposes. It includes responsibilities and requirements for the role. Candidates should have strong technical skills.",
      contactEmail: "jobs@candidatetestcorp.com",
      contactPhone: "+1 (555) 123-4567",
      linkedinUrl: "https://linkedin.com/in/candidate-test",
      applyLinks: ["https://candidatetestcorp.com/apply"],
      status: "PUBLISHED",
    },
  });
  jobId = job.id;

  await prisma.job.create({
    data: {
      recruiterId: recruiterProfileId,
      title: "Candidate Test - Draft Job",
      company: "Draft Corp",
      status: "DRAFT",
    },
  });
});

test.afterAll(async () => {
  await prisma.job.deleteMany({ where: { recruiterId: recruiterProfileId } });
  await prisma.recruiterProfile.deleteMany({ where: { userId: recruiterUserId } });
  await prisma.user.deleteMany({
    where: { id: { in: [candidateUserId, recruiterUserId] } },
  });
  await prisma.$disconnect();
});

async function loginAsCandidate(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', candidate.email);
  await page.fill('input[type="password"]', candidate.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/candidate", { timeout: 15000 });
}

test("jobs board shows published job", async ({ page }) => {
  await loginAsCandidate(page);
  await expect(page.getByText("Candidate Test - Senior Engineer")).toBeVisible();
});

test("jobs board does not show draft jobs", async ({ page }) => {
  await loginAsCandidate(page);
  await expect(page.getByText("Candidate Test - Draft Job")).not.toBeVisible();
});

test("job card shows company and location", async ({ page }) => {
  await loginAsCandidate(page);
  await expect(page.getByText("Candidate Test Corp")).toBeVisible();
  await expect(page.getByText(/Remote/)).toBeVisible();
});

test("job board card navigates to detail page", async ({ page }) => {
  await loginAsCandidate(page);
  await page.getByText("Candidate Test - Senior Engineer").click();
  await page.waitForURL(`**/jobs/${jobId}`, { timeout: 10000 });
  await expect(page.getByText("About the Role")).toBeVisible();
});

test("job detail shows full description", async ({ page }) => {
  await loginAsCandidate(page);
  await page.goto(`/dashboard/candidate/jobs/${jobId}`);
  await expect(page.getByText(/detailed job description/)).toBeVisible();
});

test("job detail shows pay and location", async ({ page }) => {
  await loginAsCandidate(page);
  await page.goto(`/dashboard/candidate/jobs/${jobId}`);
  await expect(page.getByText(/\$140,000/)).toBeVisible();
  await expect(page.getByText(/Remote/)).toBeVisible();
});

test("job detail shows contact email", async ({ page }) => {
  await loginAsCandidate(page);
  await page.goto(`/dashboard/candidate/jobs/${jobId}`);
  await expect(page.getByText("jobs@candidatetestcorp.com")).toBeVisible();
});

test("job detail shows contact phone", async ({ page }) => {
  await loginAsCandidate(page);
  await page.goto(`/dashboard/candidate/jobs/${jobId}`);
  await expect(page.getByText("+1 (555) 123-4567")).toBeVisible();
});

test("job detail shows linkedin link", async ({ page }) => {
  await loginAsCandidate(page);
  await page.goto(`/dashboard/candidate/jobs/${jobId}`);
  const link = page.getByRole("link", { name: /linkedin/i });
  await expect(link).toBeVisible();
  expect(await link.getAttribute("href")).toBe("https://linkedin.com/in/candidate-test");
});

test("unauthenticated access to job detail redirects to login", async ({ page }) => {
  await page.goto(`/dashboard/candidate/jobs/${jobId}`);
  await expect(page).toHaveURL(/.*login.*/);
});
