"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { href: "/cleaner/dashboard", label: "Dashboard" },
  { href: "/cleaner/requests", label: "Requests" },
  { href: "/cleaner/availability", label: "Availability" },
  { href: "/cleaner/profile", label: "Profile" },
  { href: "/cleaner/preview", label: "Preview" },
];

export default function NavLinks() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-base font-medium text-gray-600">Loading…</p>
        </div>
      )}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setLoading(true)}
            className="flex items-center px-3 py-2 text-base text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
