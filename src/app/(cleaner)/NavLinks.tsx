"use client";

import { useState, useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  {
    href: "/cleaner/dashboard",
    label: "Dashboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/cleaner/requests",
    label: "Requests",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m8-4v4" />
      </svg>
    ),
  },
  {
    href: "/cleaner/availability",
    label: "Availability",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/cleaner/profile",
    label: "Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/cleaner/preview",
    label: "Preview",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
];

interface Props {
  signOut: () => Promise<void>;
  userName: string;
  status: string | null;
  statusColor: string;
}

export default function NavLinks({ signOut, userName, status, statusColor }: Props) {
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    navItems.forEach((item) => router.prefetch(item.href));
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleClick(href: string) {
    setMenuOpen(false);
    if (href === pathname) return;
    startTransition(() => router.push(href));
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-base font-medium text-gray-600">Loading…</p>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-white border-r border-gray-200 flex-col min-h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-blue-600">Clean</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleClick(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-base rounded-lg transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <div className="text-base font-medium text-gray-900 truncate">{userName}</div>
          {status && (
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
              {status}
            </span>
          )}
          <form action={signOut}>
            <button type="submit" className="w-full text-left text-base text-white bg-[#dc2626] hover:bg-red-700 transition-colors rounded-lg px-3 py-2 font-medium">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 shadow-sm">
        <span className="text-lg font-bold text-blue-600">Clean</span>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white w-full mt-14 shadow-xl pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleClick(item.href)}
                className={`w-full flex items-center gap-4 px-6 py-4 text-lg transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="w-6 h-6">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 px-6">
              <div className="text-base text-gray-500 mb-1">{userName}</div>
              {status && (
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${statusColor}`}>
                  {status}
                </span>
              )}
              <form action={signOut}>
                <button type="submit" className="w-full text-center text-base text-white bg-[#dc2626] hover:bg-red-700 transition-colors rounded-xl px-4 py-3 font-semibold">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
