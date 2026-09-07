import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Calendar, UserCheck, Layers, ShieldAlert, LogOut, Sparkles } from "lucide-react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Bookings", href: "/bookings", icon: Calendar },
    { name: "KYC Verification", href: "/providers", icon: UserCheck },
    { name: "Services & Catalog", href: "/categories", icon: Layers },
  ];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo Branding */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-purple-600/30 text-white border border-purple-400/30">
              I
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white">INISHA CITY</h1>
              <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Admin Portal</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== "/dashboard" && router.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
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

        {/* Footer info logs */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 cursor-pointer rounded-xl hover:bg-rose-950/20 hover:border hover:border-rose-500/20 transition-all duration-200">
            <LogOut size={18} />
            <span className="font-semibold text-sm">Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Marketplace operational dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              AD
            </div>
            <span className="text-sm font-bold text-slate-200">System Admin</span>
          </div>
        </header>

        {/* Dynamic Pages */}
        <div className="flex-1 overflow-y-auto bg-[#020617]">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  );
}
