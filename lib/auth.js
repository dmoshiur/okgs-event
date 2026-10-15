import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "okgs-dev-secret";
const JWT_EXPIRES = "7d";

export async function hashPassword(pw) {
  return await bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw, hash) {
  return await bcrypt.compare(pw, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export function getTokenFromRequest(req) {
  // Next.js Request cookies
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/okgs_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  } catch {}
  return null;
}

export function authFromToken(token) {
  if (!token) return null;
  return verifyToken(token);
}
