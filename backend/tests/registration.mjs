import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = `http://localhost:${process.env.PORT ?? 5000}/api/auth`;
const email = `registration-${randomUUID()}@example.test`;
const password = "CairoPulse-Test-Password-2026";

async function postRegistration(body) {
  return fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

try {
  const invalid = await postRegistration({ name: "A", email: "bad", password: "short", confirmPassword: "different" });
  assert.equal(invalid.status, 400);
  const invalidBody = await invalid.json();
  assert.ok(invalidBody.fieldErrors?.email?.length);
  assert.ok(invalidBody.fieldErrors?.confirmPassword?.length);

  const payload = { name: "Registration Test", email: email.toUpperCase(), password, confirmPassword: password };
  const created = await postRegistration(payload);
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.equal(createdBody.user.email, email);
  assert.equal(createdBody.user.role, "USER");
  assert.equal("passwordHash" in createdBody.user, false);

  const cookie = created.headers.get("set-cookie");
  assert.match(cookie ?? "", /^cairopulse_session=/);
  assert.match(cookie ?? "", /HttpOnly/i);

  const stored = await prisma.user.findUnique({ where: { email } });
  assert.ok(stored);
  assert.notEqual(stored.passwordHash, password);
  assert.match(stored.passwordHash, /^\$2[aby]\$/);

  const me = await fetch(`${baseUrl}/me`, { headers: { Cookie: cookie.split(";")[0] } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).user.id, createdBody.user.id);

  const anonymous = await fetch(`${baseUrl}/me`);
  assert.equal(anonymous.status, 401);

  const duplicate = await postRegistration({ ...payload, email });
  assert.equal(duplicate.status, 409);

  console.log("Registration checks passed: validation, creation, hashing, session, duplicate email.");
} finally {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
}
