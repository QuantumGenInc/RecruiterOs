import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const TS = Date.now();
const recruiter = { email: `recruiter-${TS}@test.os`, password: "testpass123" };
const candidate = { email: `candidate-${TS}@test.os`, password: "testpass123" };

test.beforeAll(async () => {
  const hashed = await bcrypt.hash("testpass123", 10);
  await prisma.user.createMany({
    data: [
      { email: recruiter.email, password: hashed, role: "RECRUITER" },
      { email: candidate.email, password: hashed, role: "CANDIDATE" },
    ],
  });
});

test.afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [recruiter.email, candidate.email] } },
  });
  await prisma.$disconnect();
});

test("login page loads with Initialize Login button", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /initialize login/i })).toBeVisible();
});

test("invalid credentials shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "wrong@test.os");
  await page.fill('input[type="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});

test("recruiter login → redirected to /dashboard/recruiter", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', recruiter.email);
  await page.fill('input[type="password"]', recruiter.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/recruiter", { timeout: 15000 });
  expect(page.url()).toContain("/dashboard/recruiter");
});

test("recruiter dashboard shows Email Feed heading", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', recruiter.email);
  await page.fill('input[type="password"]', recruiter.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/recruiter", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /email feed/i })).toBeVisible();
});

test("candidate login → redirected to /dashboard/candidate", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', candidate.email);
  await page.fill('input[type="password"]', candidate.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/candidate", { timeout: 15000 });
  expect(page.url()).toContain("/dashboard/candidate");
});

test("candidate dashboard shows Latest Opportunities heading", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', candidate.email);
  await page.fill('input[type="password"]', candidate.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard/candidate", { timeout: 15000 });
  await expect(page.getByRole("heading", { name: /latest opportunities/i })).toBeVisible();
});

test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
  await page.goto("/dashboard/candidate");
  await page.waitForURL("**/login**", { timeout: 10000 });
  expect(page.url()).toContain("/login");
});

test("register page loads and links back to login", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
});
