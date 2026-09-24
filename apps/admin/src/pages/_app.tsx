import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  Percent,
  Tag,
  Wallet,
  Image as ImageIcon,
  Layers,
  Bell,
  BarChart3,
  ShieldAlert,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Smartphone,
  DownloadCloud,
  QrCode,
  ExternalLink,
} from "lucide-react";
import Logo from "../components/Logo";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apkModalOpen, setApkModalOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/users", icon: Users },
    { name: "Provider & KYC", href: "/providers", icon: UserCheck },
    { name: "Booking Management", href: "/bookings", icon: Briefcase },
    { name: "Commission Rates", href: "/commissions", icon: Percent },
    { name: "Coupon Management", href: "/coupons", icon: Tag },
    { name: "Wallet & Payouts", href: "/wallets", icon: Wallet },
    { name: "Banner Management", href: "/banners", icon: ImageIcon },
    { name: "Categories & Services", href: "/categories", icon: Layers },
    { name: "Push Notifications", href: "/notifications", icon: Bell },
    { name: "Reports & Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Dispute & Refunds", href: "/disputes", icon: ShieldAlert },
    { name: "UPI Ledger", href: "/payments", icon: CreditCard },
    { name: "System Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 antialiased font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed + Mobile Slide-out Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Branding & Mobile Close Button */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Logo size="md" showText={true} />

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable Nav Links */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                router.pathname === item.href ||
                (item.href !== "/dashboard" && router.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                    isActive
                      ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                      : "text-slate-600 hover:text-red-600 hover:bg-red-50/60"
                  }`}
                >
                  <Icon
                    size={16}
                    className={isActive ? "text-white" : "text-slate-500 group-hover:text-red-600"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer info & Logout */}
          <div className="p-3 border-t border-slate-100 shrink-0">
            <div
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("admin_token");
                  router.push("/");
                }
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-slate-600 hover:text-red-600 cursor-pointer rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="font-bold text-xs">Sign Out</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Responsive Header Bar */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-red-600 hover:bg-red-50 transition"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <Shield size={16} className="text-red-600 hidden sm:block" />
              <span className="text-xs font-bold text-slate-700 truncate max-w-[200px] sm:max-w-none">
                Inisha City Marketplace Super Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Mobile App & APK Hub Trigger */}
            <button
              onClick={() => setApkModalOpen(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
            >
              <Smartphone size={14} className="text-emerald-600" />
              <span>📱 Download APK & App</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-xs font-black text-red-600">
              AD
            </div>
            <span className="text-xs sm:text-sm font-black text-slate-900 hidden sm:inline">
              Super Admin
            </span>
          </div>
        </header>

        {/* Dynamic Responsive Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Component {...pageProps} />
        </div>
      </main>

      {/* Mobile App & APK Download Hub Modal */}
      {apkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Inisha City Service Mobile App & APK
                  </h3>
                  <p className="text-xs text-slate-500">Android APK Build & Expo Testing Hub</p>
                </div>
              </div>
              <button
                onClick={() => setApkModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Cards */}
            <div className="space-y-3">
              {/* Option 1: EAS Cloud Build Dashboard */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DownloadCloud size={16} className="text-red-600" />
                    <span className="font-black text-xs text-slate-900">Expo EAS Cloud APK Dashboard</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Android APK
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Directly download the latest compiled Android <code className="bg-white px-1.5 py-0.5 rounded font-bold">.apk</code> installable file from Expo Cloud.
                </p>
                <a
                  href="https://expo.dev/projects/237a6fd9-ca52-4cbf-ac0f-8813a528723b"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ExternalLink size={14} />
                  Open Expo Cloud APK Dashboard
                </a>
              </div>

              {/* Option 2: Live Testing via Expo Go QR Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-indigo-600" />
                  <span className="font-black text-xs text-slate-900">Instant Phone Testing (Expo Go)</span>
                </div>
                <p className="text-xs text-slate-600">
                  1. Download <b>Expo Go</b> app on your Android/iPhone from Play Store.<br />
                  2. Run <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold">npx expo start --tunnel</code> in <code className="bg-white px-1.5 py-0.5 rounded font-bold">apps/mobile</code>.<br />
                  3. Scan the QR code to open the full app live on your phone!
                </p>
              </div>

              {/* Technical Details */}
              <div className="bg-slate-100/70 rounded-xl p-3 text-[11px] text-slate-600 space-y-1 font-mono">
                <div><b>App Name:</b> INISHA CITY SERVICE</div>
                <div><b>Package:</b> com.inishacityservice.app</div>
                <div><b>Official Helpline:</b> +91 73520 82614</div>
              </div>
            </div>

            <button
              onClick={() => setApkModalOpen(false)}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Close Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
