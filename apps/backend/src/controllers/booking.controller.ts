import { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { Booking } from "../models/Booking";
import { ProviderProfile } from "../models/ProviderProfile";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// In-memory fallback map for active bookings telemetry when running offline or testing
export const telemetryStore = new Map<
  string,
  { latitude: number; longitude: number; heading?: number; updatedAt: number }
>();

/**
 * 1. Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawUserId = req.user?.id || req.user?.userId;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to book a service.",
      });
    }

    const {
      customerId,
      customerName,
      customerPhone,
      categoryId,
      subcategoryId,
      formValues,
      selectedAddress,
      pricing,
      paymentMethod,
      scheduledDate,
      scheduledTime,
    } = req.body;

    const startServiceOtp = crypto.randomInt(1000, 10000).toString();

    // Look for available online provider
    const availableProvider = await ProviderProfile.findOne({
      isOnline: true,
      isApproved: true,
    }).catch(() => null);

    let userObjectId: mongoose.Types.ObjectId;
    if (mongoose.Types.ObjectId.isValid(rawUserId)) {
      userObjectId = new mongoose.Types.ObjectId(rawUserId);
    } else {
      const phoneToFind = req.user?.phoneNumber || customerPhone;
      let existingUser = phoneToFind ? await User.findOne({ phoneNumber: phoneToFind }) : null;
      if (!existingUser && phoneToFind) {
        existingUser = await User.create({
          phoneNumber: phoneToFind,
          role: "CUSTOMER",
          name: customerName || req.user?.name || "Customer",
          walletBalance: 250,
          isVerified: true,
        });
      }
      userObjectId = existingUser ? (existingUser._id as mongoose.Types.ObjectId) : new mongoose.Types.ObjectId();
    }

    const newBooking = await Booking.create({
      userId: userObjectId,
      customerId: userObjectId.toString(),
      customerName: customerName || req.user?.name || "Inisha Customer",
      customerPhone: customerPhone || req.user?.phoneNumber || "+91 9876543210",
      providerId: availableProvider?.partnerId || "INP-8842",
      providerName: availableProvider?.name || "Rohan Sharma",
      providerPhone: availableProvider?.phone || "+91 98123 45678",
      categoryId: categoryId || "cat_mobile",
      subcategoryId: subcategoryId || "sub_mob_doorstep",
      formValues: formValues || {},
      selectedAddress: {
        formattedAddress:
          selectedAddress?.formattedAddress || "Sultanganj, Bhagalpur, Bihar",
        latitude: selectedAddress?.latitude || 25.2425,
        longitude: selectedAddress?.longitude || 86.7381,
      },
      status: "ASSIGNED",
      startServiceOtp,
      paymentMethod: paymentMethod || "CASH_AFTER_SERVICE",
      paymentStatus: "PENDING",
      pricing: {
        basePrice: pricing?.basePrice || 499,
        tax: pricing?.tax || 89,
        commission: pricing?.commission || 75,
        couponDiscount: pricing?.couponDiscount || 0,
        addOnPrice: pricing?.addOnPrice || 0,
        providerEarnings: pricing?.providerEarnings || 424,
        finalAmount: pricing?.finalAmount || 588,
      },
      timeline: [
        {
          status: "ASSIGNED",
          timestamp: new Date(),
          note: `Technician ${availableProvider?.name || "Rohan Sharma"} assigned`,
        },
      ],
      scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
      scheduledTime: scheduledTime || "Within 30 Minutes",
    });

    return res.status(201).json({
      success: true,
      booking: newBooking,
      startServiceOtp,
    });
  } catch (error: any) {
    console.error("createBooking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1b. Create a Doorstep Mobile Repair Booking
 * POST /api/bookings/repair
 */
export const createRepairBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawUserId = req.user?.id || req.user?.userId;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to book a repair.",
      });
    }

    const {
      brand,
      model,
      selectedIssues,
      customProblem,
      totalAmount,
      address,
      customerName,
      customerPhone,
      scheduledDate,
      scheduledTime,
      paymentMethod,
    } = req.body;

    const startServiceOtp = crypto.randomInt(1000, 10000).toString();

    // Look for available online provider
    const availableProvider = await ProviderProfile.findOne({
      isOnline: true,
      isApproved: true,
    }).catch(() => null);

    let formattedAddress = "Rahmatnagar, Dilgouri, Sultanganj, Bhagalpur, Bihar 813213";
    let latitude = 25.2425;
    let longitude = 86.7381;

    if (typeof address === "string" && address.trim().length > 0) {
      formattedAddress = address.trim();
    } else if (address && typeof address === "object") {
      formattedAddress = address.formattedAddress || address.address || address.street || formattedAddress;
      if (typeof address.latitude === "number") latitude = address.latitude;
      if (typeof address.longitude === "number") longitude = address.longitude;
    }

    let userObjectId: mongoose.Types.ObjectId;
    if (mongoose.Types.ObjectId.isValid(rawUserId)) {
      userObjectId = new mongoose.Types.ObjectId(rawUserId);
    } else {
      const phoneToFind = req.user?.phoneNumber || customerPhone;
      let existingUser = phoneToFind ? await User.findOne({ phoneNumber: phoneToFind }) : null;
      if (!existingUser && phoneToFind) {
        existingUser = await User.create({
          phoneNumber: phoneToFind,
          role: "CUSTOMER",
          name: customerName || req.user?.name || "Customer",
          walletBalance: 250,
          isVerified: true,
        });
      }
      userObjectId = existingUser ? (existingUser._id as mongoose.Types.ObjectId) : new mongoose.Types.ObjectId();
    }

    const calculatedTotal = Number(totalAmount) > 0 ? Number(totalAmount) : 499;
    const basePrice = Math.max(1, Math.round(calculatedTotal * 0.85));
    const tax = calculatedTotal - basePrice;

    const issuesList = Array.isArray(selectedIssues)
      ? selectedIssues.map((it) => (typeof it === "string" ? it : it?.name || JSON.stringify(it)))
      : [];

    const newBooking = await Booking.create({
      userId: userObjectId,
      customerId: userObjectId.toString(),
      customerName: customerName || req.user?.name || "Inisha Customer",
      customerPhone: customerPhone || req.user?.phoneNumber || "",
      providerId: availableProvider?.partnerId || "INP-TECH-01",
      providerName: availableProvider?.name || "Certified Mobile Technician",
      providerPhone: availableProvider?.phone || "+91 98123 45678",
      categoryId: "cat_mobile",
      subcategoryId: "sub_mob_doorstep",
      formValues: {
        brand: brand || "Generic",
        model: model || "Smartphone",
        selectedIssues: issuesList,
        customProblem: customProblem || "",
        serviceCategory: "Mobile Doorstep Repair",
        warrantyDays: 15,
      },
      selectedAddress: {
        formattedAddress,
        latitude,
        longitude,
      },
      status: availableProvider ? "ASSIGNED" : "PENDING_PROVIDER",
      startServiceOtp,
      paymentMethod: paymentMethod || "CASH_AFTER_SERVICE",
      paymentStatus: "PENDING",
      pricing: {
        basePrice,
        tax,
        commission: Math.round(basePrice * 0.15),
        couponDiscount: 0,
        addOnPrice: 0,
        providerEarnings: Math.round(basePrice * 0.85),
        finalAmount: calculatedTotal,
      },
      timeline: [
        {
          status: "ASSIGNED",
          timestamp: new Date(),
          note: `Mobile repair booked for ${brand} ${model}. Technician will arrive with genuine spares.`,
        },
      ],
      scheduledDate: scheduledDate || new Date().toISOString().split("T")[0],
      scheduledTime: scheduledTime || "Within 60 Minutes",
    });

    return res.status(201).json({
      success: true,
      message: "Doorstep mobile repair booked successfully",
      booking: newBooking,
      startServiceOtp,
    });
  } catch (error: any) {
    console.error("createRepairBooking error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get booking details by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { bookingId: id }] }
      : { bookingId: id };

    let booking = await Booking.findOne(query).catch(() => null);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Merge latest memory telemetry if available
    const latestTele = telemetryStore.get(id);
    if (latestTele) {
      booking.providerCoords = {
        latitude: latestTele.latitude,
        longitude: latestTele.longitude,
        heading: latestTele.heading,
        updatedAt: new Date(latestTele.updatedAt),
      };
    }

    return res.status(200).json({ success: true, booking });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Update Real-Time Telemetry from Provider App
 * POST /api/bookings/:id/telemetry
 */
export const updateTelemetry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, heading } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "latitude and longitude coordinates are required",
      });
    }

    const telemetryData = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      heading: Number(heading || 0),
      updatedAt: Date.now(),
    };

    // Store in memory for ultra-fast non-blocking stream
    telemetryStore.set(id, telemetryData);

    // Persist to MongoDB asynchronously without blocking response
    Booking.findByIdAndUpdate(id, {
      providerCoords: {
        latitude: telemetryData.latitude,
        longitude: telemetryData.longitude,
        heading: telemetryData.heading,
        updatedAt: new Date(telemetryData.updatedAt),
      },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Telemetry updated successfully",
      coordinates: telemetryData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Verify Doorstep Customer Start OTP
 * POST /api/bookings/:id/verify-start-otp
 */
export const verifyStartOtp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const cleanOtp = String(otp || "").trim();

    if (!cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 4-digit doorstep verification code",
      });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { bookingId: id }] }
      : { bookingId: id };

    const booking = await Booking.findOne(query).catch(() => null);

    let isValid = false;
    if (booking) {
      if ((booking.startServiceOtp && booking.startServiceOtp === cleanOtp) || (booking.otp && booking.otp === cleanOtp)) {
        isValid = true;
        booking.status = "IN_PROGRESS";
        booking.timeline.push({
          status: "IN_PROGRESS",
          timestamp: new Date(),
          note: "Doorstep OTP verified by technician. Work started.",
        });
        await booking.save();

        try {
          const io = req.app.get("io");
          if (io) {
            io.emit(`booking:${booking.bookingId || booking._id}:status`, {
              bookingId: booking.bookingId || booking._id,
              status: "IN_PROGRESS",
              timeline: booking.timeline,
            });
            io.emit("booking:status-changed", {
              bookingId: booking.bookingId || booking._id,
              status: "IN_PROGRESS",
              timeline: booking.timeline,
            });
          }
        } catch {}
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid Doorstep Verification Code. Ask customer for the 4-digit OTP shown in their app.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doorstep verification successful. Work in progress.",
      status: "IN_PROGRESS",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Update Booking Status (EN_ROUTE, ARRIVED, COMPLETED, CANCELLED)
 * PUT /api/bookings/:id/status
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { bookingId: id }] }
      : { bookingId: id };

    const booking = await Booking.findOneAndUpdate(
      query,
      {
        status,
        $push: {
          timeline: {
            status,
            timestamp: new Date(),
            note: note || `Status transitioned to ${status}`,
          },
        },
      },
      { new: true }
    );

    if (booking) {
      try {
        const io = req.app.get("io");
        if (io) {
          io.emit(`booking:${booking.bookingId || booking._id}:status`, {
            bookingId: booking.bookingId || booking._id,
            status: booking.status,
            timeline: booking.timeline,
          });
          io.emit("booking:status-changed", {
            bookingId: booking.bookingId || booking._id,
            status: booking.status,
            timeline: booking.timeline,
          });
          io.emit("booking:status_update", {
            bookingId: booking.bookingId || booking._id,
            status: booking.status,
            timeline: booking.timeline,
          });
        }
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Get All Bookings for Admin & Live Dispatch
 * GET /api/bookings/admin/all & GET /api/bookings/all
 */
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings.map((b) => ({
        id: b._id,
        _id: b._id,
        bookingId: `BK-${b._id.toString().slice(-6).toUpperCase()}`,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        serviceTitle: b.categoryId || "Doorstep Service",
        serviceName: b.categoryId || "Doorstep Service",
        partnerName: b.providerName || null,
        partnerId: b.providerId || null,
        providerName: b.providerName || null,
        providerId: b.providerId || null,
        amount: b.pricing?.finalAmount || 0,
        pricing: b.pricing,
        status: b.status,
        createdAt: b.createdAt,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Get Customer Personal Bookings (Strict Account Isolation)
 * GET /api/bookings/my-bookings
 */
export const getMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const rawUserId = req.user?.id || req.user?.userId;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to fetch personal bookings.",
      });
    }

    const rawPhone = req.user?.phoneNumber || req.user?.phone || "";
    const cleanPhone = String(rawPhone).replace(/\D/g, "").slice(-10);

    const userConditions: any[] = [{ customerId: rawUserId }];
    if (mongoose.Types.ObjectId.isValid(rawUserId)) {
      userConditions.push({ userId: new mongoose.Types.ObjectId(rawUserId) });
      userConditions.push({ userId: rawUserId });
    }

    const bookings = await Booking.find({ $or: userConditions }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error("getMyBookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error?.message,
    });
  }
};
