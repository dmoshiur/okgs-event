import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const JWT_EXPIRES = "7d";
const DEVELOPMENT_SECRET = "okgs-local-only-secret-do-not-use-in-production";

function getJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== "production") return DEVELOPMENT_SECRET;
  throw new Error("JWT_SECRET must be configured before authentication is used.");
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, passwordHash) {
  if (!password || !passwordHash) return false;
  return bcrypt.compare(password, passwordHash);
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const cookieValue = request.cookies?.get?.("okgs_token")?.value;
  if (cookieValue) return cookieValue;

  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)okgs_token=([^;]+)/);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function getAuthFromRequest(request, expectedType) {
  const payload = verifyToken(getTokenFromRequest(request));
  if (!payload || (expectedType && payload.type !== expectedType)) return null;
  return payload;
}

export async function getAdminFromRequest(request) {
  const payload = getAuthFromRequest(request, "admin");
  if (!payload) return null;

  const result = await db.execute({
    sql: "SELECT id, username, email, role FROM admins WHERE id = ?",
    args: [payload.id],
  });
  return result.rows[0] ? { ...result.rows[0], type: "admin" } : null;
}

export function setAuthCookie(response, token) {
  response.cookies.set("okgs_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export function clearAuthCookie(response) {
  response.cookies.set("okgs_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
