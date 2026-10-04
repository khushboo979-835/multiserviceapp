import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const TOKEN_LIFETIME_SECONDS = 60 * 60;

const getTokenSecret = () =>
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "supersecret_admin_jwt_token_key_inisha_2026_secured_token";

export const constantTimeStringEqual = (left: string, right: string): boolean => {
  const leftDigest = crypto.createHash("sha256").update(left).digest();
  const rightDigest = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftDigest, rightDigest);
};

export const createAdminToken = (): string | null => {
  const secret = getTokenSecret();
  if (!secret || secret.length < 32) return null;

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "admin",
      role: "ADMIN",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
      iss: "inisha-admin",
      aud: "inisha-admin-api",
    })
  ).toString("base64url");
  const content = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(content).digest("base64url");

  return `${content}.${signature}`;
};

export const requireAdmin = (_req: Request, res: Response, next: NextFunction) => {
  const secret = getTokenSecret();
  if (!secret || secret.length < 32) {
    return res.status(503).json({ success: false, message: "Admin authentication is not configured" });
  }

  const token = _req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Admin authentication required" });
  }

  try {
    const [header, payload, signature, extra] = token.split(".");
    if (!header || !payload || !signature || extra) throw new Error("Invalid token");

    const content = `${header}.${payload}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(content).digest();
    const actualSignature = Buffer.from(signature, "base64url");
    if (
      actualSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(actualSignature, expectedSignature)
    ) {
      throw new Error("Invalid signature");
    }

    const tokenHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    if (
      tokenHeader.alg !== "HS256" ||
      claims.role !== "ADMIN" ||
      claims.sub !== "admin" ||
      claims.iss !== "inisha-admin" ||
      claims.aud !== "inisha-admin-api" ||
      !Number.isFinite(claims.exp) ||
      claims.exp <= now
    ) {
      throw new Error("Invalid claims");
    }

    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Admin session is invalid or expired" });
  }
};