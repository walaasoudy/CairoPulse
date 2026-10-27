import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./db.js";

export const authRouter = Router();
const sessionCookie = "cairopulse_session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

const registrationSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(80, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Use at least 8 characters.").refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "Password must be 72 bytes or fewer.",
  ),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long.");
  }
  return secret;
}

authRouter.post("/register", async (request, response, next) => {
  const parsed = registrationSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, email, password } = parsed.data;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const token = jwt.sign({ role: user.role }, jwtSecret(), {
      subject: user.id,
      expiresIn: "7d",
    });
    response.cookie(sessionCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDurationMs,
    });
    response.status(201).json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({
        message: "An account with this email already exists.",
        fieldErrors: { email: ["Email already registered."] },
      });
      return;
    }
    next(error);
  }
});

authRouter.get("/me", async (request, response, next) => {
  const token = request.cookies?.[sessionCookie];
  if (!token) {
    response.status(401).json({ message: "Not signed in." });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret()) as JwtPayload;
    if (typeof decoded.sub !== "string") {
      response.status(401).json({ message: "Invalid session." });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      response.status(401).json({ message: "Invalid session." });
      return;
    }
    response.json({ user });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      response.status(401).json({ message: "Invalid session." });
      return;
    }
    next(error);
  }
});
