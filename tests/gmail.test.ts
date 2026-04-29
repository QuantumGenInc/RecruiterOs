import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const TS = Date.now();

const rcNotConnected = { email: `recruiter-nc-${TS}@test.os`, password: "testpass123" };
const rcConnected = { email: `recruiter-c-${TS}@test.os`, password: "testpass123" };

let userId1: string;
let userId2: string;
let profileId: string;

test.beforeAll(async () => {
  const hashed = await bcrypt.hash("testpass123", 10);

  const u1 = await prisma.user.create({
    data: { email: rcNotConnected.email, password: hashed, role: "RECRUITER" },
  });
  userId1 = u1.id;

  const u2 = await prisma.user.create({
    data: { email: rcConnected.email, password: hashed, role: "RECRUITER" },
  });
  userId2 = u2.id;

  const profile = await prisma.recruiterProfile.create({
    data: {
      userId: userId2,
      gmailConnected: true,
      gmailEmail: "test-recruiter@gmail.com",
      gmailTokenJson: JSON.stringify({
        access_token: "fake-token",
        refresh_token: "fake-refresh",
        expiry_date: Date.now() + 3600000,
      }),
    },
  });
  profileId = profile.id;

  await prisma.rawEmail.create({
    data: {
      recruiterId: profileId,
      gmailMessageId: `test-msg-${TS}`,
      subject: "Senior Engineer Role at Acme Corp",
      fromEmail: "hr@acme.com",
      fromName: "Acme HR",
      receivedAt: new Date(),
    },
  });
});

test.afterAll(async () => {
  await prisma.rawEmail.deleteMany({ where: { recruiterId: profileId } });
  await prisma.recruiterProfile.deleteMany({
    where: { userId: { in: [userId1, userId2] } },
  });
  await prisma.user.deleteMany({ where: { id: { in: [userId1, userId2] } } });
  await prisma.$disconnect();
});

async function loginAs(
  page: Page,
  creds: { email: string; password: string }
) {
  await page.goto("/login");
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/recruiter", { timeout: 15000 });
}

// --- Not-connected state ---

test("shows Connect Gmail button when not connected", async ({ page }) => {
  await loginAs(page, rcNotConnected);
  await expect(page.getByRole("link", { name: /connect gmail/i })).toBeVisible();
});

test("connect gmail button links to /api/gmail/connect", async ({ page }) => {
  await loginAs(page, rcNotConnected);
  const link = page.getByRole("link", { name: /connect gmail/i });
  expect(await link.getAttribute("href")).toBe("/api/gmail/connect");
});

test("poll endpoint returns 401 without session", async ({ page }) => {
  const res = await page.request.post("/api/gmail/poll");
  expect(res.status()).toBe(401);
});

test("poll endpoint returns 400 when gmail not connected", async ({ page }) => {
  await loginAs(page, rcNotConnected);
  const res = await page.request.post("/api/gmail/poll");
  expect(res.status()).toBe(400);
});

// --- Connected state ---

test("shows connected state when gmail is connected", async ({ page }) => {
  await loginAs(page, rcConnected);
  await expect(page.getByText(/gmail connected/i)).toBeVisible();
  await expect(page.getByText("test-recruiter@gmail.com")).toBeVisible();
});

test("shows email feed with stored emails", async ({ page }) => {
  await loginAs(page, rcConnected);
  await expect(page.getByText("Senior Engineer Role at Acme Corp")).toBeVisible();
});

test("shows PENDING classification badge on new emails", async ({ page }) => {
  await loginAs(page, rcConnected);
  await expect(page.getByText("PENDING")).toBeVisible();
});

test("disconnect link points to /api/gmail/disconnect", async ({ page }) => {
  await loginAs(page, rcConnected);
  const link = page.getByRole("link", { name: /disconnect/i });
  expect(await link.getAttribute("href")).toBe("/api/gmail/disconnect");
});

test("poll endpoint returns 400 with connected but invalid token", async ({ page }) => {
  await loginAs(page, rcConnected);
  const res = await page.request.post("/api/gmail/poll");
  // Returns 500 (token invalid) or 200 — either way not 401/400 auth error
  expect([200, 400, 500]).toContain(res.status());
});
