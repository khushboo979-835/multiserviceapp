import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Settings,
  ShieldAlert,
  LogOut,
  CreditCard,
  Menu,
  X,
  Layers,
} from "lucide-react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "UPI Payments & Ledger", href: "/payments", icon: CreditCard },
    { name: "Partners & KYC", href: "/providers", icon: UserCheck },
    { name: "Catalog Manager", href: "/categories", icon: Layers },
    { name: "Settings & UPI", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-100 antialiased font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed + Mobile Slide-out Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo Branding & Mobile Close Button */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30">
                I
              </div>
              <div>
                <h1 className="font-black text-sm tracking-wide text-white">INISHA CITY</h1>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Admin Portal</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 sm:p-4 space-y-1.5">
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
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("admin_token");
                router.push("/");
              }
            }}
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 cursor-pointer rounded-xl hover:bg-rose-950/20 hover:border hover:border-rose-500/20 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-semibold text-xs sm:text-sm">Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Responsive Header Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#0f172a] shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-indigo-400 hidden sm:block" />
              <span className="text-xs font-bold text-slate-300 truncate max-w-[200px] sm:max-w-none">
                Marketplace Admin Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              AD
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-200 hidden sm:inline">
              Super Admin
            </span>
          </div>
        </header>

        {/* Dynamic Responsive Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#020617] p-4 sm:p-6 lg:p-8">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
