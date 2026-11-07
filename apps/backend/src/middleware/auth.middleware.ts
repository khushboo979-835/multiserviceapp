import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { User, IUser, AppUserRole } from "../models/User";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    phoneNumber: string;
    role: AppUserRole;
    shopId?: string;
    assignedPartnerId?: string;
    [key: string]: any;
  };
}

const getJwtSecret = () =>
  process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
    ? process.env.JWT_SECRET
    : "supersecretkey_change_me_in_production_inisha_city_2026_secured";

export const verifyJwtToken = (token: string): any | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const secret = getJwtSecret();

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (signatureB64 !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("authorization") || req.header("Authorization");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token required.",
    });
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authorization token.",
    });
  }

  req.user = {
    id: decoded.userId || decoded.id,
    userId: decoded.userId || decoded.id,
    phoneNumber: decoded.phoneNumber || decoded.phone || "",
    role: decoded.role || "CUSTOMER",
    shopId: decoded.shopId || "",
    assignedPartnerId: decoded.assignedPartnerId || decoded.providerId || "",
    ...decoded,
  };

  next();
};

export const requireRole = (...roles: AppUserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Admins always have full bypass privilege
    if (req.user.role === "ADMIN") {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
