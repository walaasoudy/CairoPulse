import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { authRouter } from "./auth.js";
import { prisma } from "./db.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.get("/api/health", async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRouter);

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found." });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ message: "Invalid JSON body." });
    return;
  }
  console.error(error);
  response.status(500).json({ message: "Something went wrong. Please try again." });
};
app.use(errorHandler);

export default app;
