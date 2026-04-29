import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("DB connects successfully", async () => {
  await expect(prisma.$connect()).resolves.toBeUndefined();
});

test("users table exists", async () => {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AS exists
  `;
  expect(result[0].exists).toBe(true);
});

test("recruiter_profiles table exists", async () => {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'recruiter_profiles'
    ) AS exists
  `;
  expect(result[0].exists).toBe(true);
});

test("raw_emails table exists", async () => {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'raw_emails'
    ) AS exists
  `;
  expect(result[0].exists).toBe(true);
});

test("jobs table exists", async () => {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'jobs'
    ) AS exists
  `;
  expect(result[0].exists).toBe(true);
});

test("flagged_emails table exists", async () => {
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'flagged_emails'
    ) AS exists
  `;
  expect(result[0].exists).toBe(true);
});

test("can create and delete a user record", async () => {
  const user = await prisma.user.create({
    data: {
      email: `test-setup-${Date.now()}@recruiter-os.test`,
      password: "hashed_placeholder",
      role: "CANDIDATE",
    },
  });
  expect(user.id).toBeTruthy();
  await prisma.user.delete({ where: { id: user.id } });
});
