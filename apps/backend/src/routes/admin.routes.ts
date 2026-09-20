import { Router, Request, Response } from "express";
import crypto from "crypto";
import { User } from "../models/User";
import { ProviderProfile } from "../models/ProviderProfile";
import { Booking } from "../models/Booking";
import { Service } from "../models/Service";
import { AdminSettings } from "../models/AdminSettings";

const router = Router();

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

/**
 * 1. Admin Login
 * POST /api/admin/login
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const identifier = String(username || email || "").trim().toLowerCase();
    const pass = String(password || "").trim();

    if (
      (identifier === "admin@inishacityservice.com" ||
        identifier === "admin" ||
        identifier === "root") &&
      (pass === "admin123" || pass === "Inisha@Admin2026" || pass === "admin@2026")
    ) {
      const token = "jwt_admin_" + crypto.randomBytes(24).toString("hex");
      return res.status(200).json({
        success: true,
        token,
        admin: {
          name: "Inisha Super Admin",
          email: "admin@inishacityservice.com",
          role: "ADMIN",
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. Real-Time Overview Metrics from multiserviceapp database
 * GET /api/admin/metrics
 */
router.get("/metrics", async (req: Request, res: Response) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "CUSTOMER" });
    const totalProviders = await ProviderProfile.countDocuments();
    const liveProviders = await ProviderProfile.countDocuments({ isOnline: true });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      status: {
        $in: ["PENDING", "PENDING_PROVIDER", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"],
      },
    });

    // Real GMV Calculation from successful / completed orders
    const successfulBookings = await Booking.find({
      status: { $in: ["SUCCESS", "COMPLETED"] },
    });
    const totalGMV = successfulBookings.reduce(
      (sum, b) => sum + (b.pricing?.finalAmount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      metrics: {
        totalCustomers,
        totalProviders,
        liveProviders,
        totalBookings,
        activeBookings,
        totalGMV,
        platformEarnings: Math.round(totalGMV * 0.15),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. Live Operations & Dispatch Feed
 * GET /api/admin/bookings/live
 */
router.get("/bookings/live", async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(25);
    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b._id,
        bookingId: `BK-${b._id.toString().slice(-6).toUpperCase()}`,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        serviceTitle: b.categoryId || "Doorstep Service",
        partnerName: b.providerName || null,
        partnerId: b.providerId || null,
        amount: b.pricing?.finalAmount || 0,
        status: b.status,
        createdAt: b.createdAt,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 3. Onboard New Service Partner
 * POST /api/admin/providers/create
 */
router.post("/providers/create", async (req: Request, res: Response) => {
  try {
    const { name, phone, email, skills, password } = req.body;
    const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);

    if (!name || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Partner Name and 10-digit Phone are required",
      });
    }

    const partnerId = "INP-" + Math.floor(1000 + Math.random() * 9000);
    const rawPass = password || "partner123";
    const passwordHash = hashPassword(rawPass);

    const newProvider = await ProviderProfile.create({
      userId: `usr_prov_${cleanPhone}`,
      partnerId,
      name,
      phone: `+91 ${cleanPhone}`,
      email: email || `${cleanPhone}@partner.inishacityservice.com`,
      passwordHash,
      skills: Array.isArray(skills) && skills.length > 0 ? skills : ["Mobile Repair", "Home Utility"],
      rating: 5.0,
      reviewCount: 0,
      isOnline: false,
      isApproved: true,
      walletBalance: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Service Partner successfully onboarded",
      partner: {
        partnerId: newProvider.partnerId,
        name: newProvider.name,
        phone: newProvider.phone,
        temporaryPassword: rawPass,
        skills: newProvider.skills,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 4. List All Providers
 * GET /api/admin/providers
 */
router.get("/providers", async (req: Request, res: Response) => {
  try {
    let providers = await ProviderProfile.find().sort({ createdAt: -1 });

    if (providers.length === 0) {
      // Return default master providers if none seeded
      providers = [
        {
          _id: "prov_1",
          userId: "usr_partner_8842",
          partnerId: "INP-8842",
          name: "Rohan Sharma",
          phone: "+91 98123 45678",
          email: "rohan.partner@inishacityservice.com",
          skills: ["Doorstep Screen Repair", "Battery Replacement"],
          rating: 4.9,
          reviewCount: 28,
          isOnline: true,
          isApproved: true,
          walletBalance: 3450,
          createdAt: new Date(),
        } as any,
        {
          _id: "prov_2",
          userId: "usr_partner_9912",
          partnerId: "INP-9912",
          name: "Amit Kumar Verma",
          phone: "+91 98765 12345",
          email: "amit.ac@inishacityservice.com",
          skills: ["AC Jet Cleaning", "Plumbing & Electricals"],
          rating: 4.85,
          reviewCount: 16,
          isOnline: true,
          isApproved: true,
          walletBalance: 1850,
          createdAt: new Date(),
        } as any,
      ];
    }

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 5. Toggle Provider Status
 * PUT /api/admin/providers/:id/status
 */
router.put("/providers/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const updated = await ProviderProfile.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Provider status updated",
      provider: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 6. List Bookings Tracker
 * GET /api/admin/bookings
 */
router.get("/bookings", async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 7. Admin Settings (UPI ID, Merchant Name, Commission)
 * GET & PUT /api/admin/settings
 */
router.get("/settings", async (req: Request, res: Response) => {
  try {
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = await AdminSettings.create({
        companyUpiId: "7352082614-3@ybl",
        merchantName: "Inisha City Service",
        commissionRate: 15,
        supportContact: "+91 98765 43210",
        supportEmail: "support@inishacityservice.com",
      });
    }
    return res.status(200).json({ success: true, settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/settings", async (req: Request, res: Response) => {
  try {
    const { companyUpiId, merchantName, commissionRate, supportContact, supportEmail } = req.body;
    let settings = await AdminSettings.findOne();
    if (!settings) {
      settings = new AdminSettings();
    }
    if (companyUpiId) settings.companyUpiId = companyUpiId;
    if (merchantName) settings.merchantName = merchantName;
    if (commissionRate !== undefined) settings.commissionRate = commissionRate;
    if (supportContact) settings.supportContact = supportContact;
    if (supportEmail) settings.supportEmail = supportEmail;

    await settings.save();
    return res.status(200).json({ success: true, message: "Settings updated", settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 8. Admin Payments Ledger & Settlement Routes
 * GET /api/admin/payments & PUT/PATCH /api/admin/payments/:id/verify
 */
router.get("/payments", async (req: Request, res: Response) => {
  const { getAdminTransactions } = require("../controllers/payment.controller");
  return getAdminTransactions(req, res);
});

router.patch("/payments/:id/verify", async (req: Request, res: Response) => {
  const { verifyTransactionAndSettle } = require("../controllers/payment.controller");
  return verifyTransactionAndSettle(req, res);
});

router.put("/payments/:id/verify", async (req: Request, res: Response) => {
  const { verifyTransactionAndSettle } = require("../controllers/payment.controller");
  return verifyTransactionAndSettle(req, res);
});

export default router;
