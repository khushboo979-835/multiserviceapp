# INISHA CITY SERVICE — Multi-Service On-Demand Marketplace

> **"Your Need, Our Service · On-demand Doorstep Experts"**

A full-stack on-demand home & doorstep utility marketplace application built with Expo (React Native), Next.js, Node.js/Express, and Firebase Firestore.

---

## 📱 Mobile App Features (Expo / React Native)
- **Branded Splash & Smooth Launch Flow**: Cold start lifecycle management with dual-tier AsyncStorage and Firebase Auth synchronization.
- **Dual Authentication**:
  - Phone OTP Flow with native 6-digit auto-advancing OTP input, SMS auto-fill (`textContentType="oneTimeCode"`), and Firebase Auth.
  - Email & Password Auth Flow (Sign In & Sign Up).
  - Instant 1-tap demo logins for Customer and Partner testing.
- **Complete Doorstep Services Catalog**:
  - Quick Delivery & Courier (Express 30-min parcel, delicate cakes & gifts).
  - Home Repair & Utilities (Electricians, Plumbers, AC foam jet wash).
  - Home Cleaning & Deep Hygiene (Full home scrubbing, sofa shampooing).
  - Salon, Beauty & Spa (Men's grooming, Women's salon & glow facials).
  - Grocery & Daily Essentials (Farm fresh fruits, vegetables & dairy).
  - Healthcare & Medical Care (NABL blood sample tests & home physiotherapy).
  - Gadgets & Laptop Repair (Screen replacements, thermal paste service).
- **Service Detail & Dynamic Booking**:
  - Detailed task workflows, inclusions, exclusions, and interactive upgrades/add-ons.
  - Dynamic pricing calculation (Base + Add-ons + 18% GST).
  - Date and time slot picker.
  - Doorstep address selector with GPS location auto-detection.
  - Cash on Delivery (COD) and Online Payment options.
- **Live Order Tracking**:
  - Segmented "Active Orders" and "Past Bookings" tabs.
  - Live interactive map with driver tracking and OTP verification code display.
- **Inisha Wallet**:
  - Persistent balance display with top-up quick chips.
  - Interactive "Add Money" modal (UPI, Cards, Netbanking).
  - Filterable transaction history (All, Credits, Debits).
- **Profile & Account Management**:
  - Saved addresses management (Add / Delete).
  - Profile customization and avatar selector.
  - Multi-language support (English, Hindi, Bengali, Tamil, Telugu, Kannada).
  - 24x7 Customer Help Desk modal.

---

## 🛠 Project Structure

```
multi-service-app/
├── apps/
│   ├── mobile/         # React Native / Expo Mobile App (Customer & Provider)
│   ├── admin/          # Next.js Admin & Operations Dashboard
│   └── backend/        # Express / Socket.io / Payment Backend API
├── firestore.rules     # Production Security Rules for Firestore
├── package.json        # Workspace configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Mobile App
```bash
cd apps/mobile
npx expo start
```

### 3. Run Admin Dashboard
```bash
cd apps/admin
npm run dev
```

### 4. Run Backend Server
```bash
cd apps/backend
npm run dev
```
