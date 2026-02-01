"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const menuLinks = [
  { href: "/about", label: "About" },
  { href: "/people", label: "People" },
  { href: "/projects", label: "Projects" },
  { href: "/courses", label: "Courses" },
  { href: "/publications", label: "Publications" },
];

const loginHref = "/login";
const loginLabel = "Login";

export function Navbar() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-gray-200 bg-white",
        "dark:border-gray-800 dark:bg-gray-950"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={cn(
            "shrink-0 text-base font-semibold text-gray-900",
            "hover:text-gray-700 transition-colors",
            "dark:text-gray-100 dark:hover:text-gray-300"
          )}
        >
          LKJ-AAPP
        </Link>
        <nav
          className={cn(
            "flex items-center gap-6 sm:gap-8",
            "text-sm text-gray-600 dark:text-gray-400"
          )}
        >
          {menuLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {label}
            </Link>
          ))}
          <span
            aria-hidden
            className={cn(
              "h-4 w-px shrink-0 bg-gray-300 dark:bg-gray-600",
              "mx-1 sm:mx-2"
            )}
          />
          <Link
            href={loginHref}
            className={cn(
              "transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            {loginLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
