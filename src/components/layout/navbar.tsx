"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full",
          "bg-white dark:bg-gray-950"
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-8">
          <Link
            href="/"
            className={cn(
              "shrink-0 text-base font-bold text-gray-900",
              "hover:text-gray-700 transition-colors",
              "dark:text-gray-100 dark:hover:text-gray-300"
            )}
          >
            LKJ-AAPP
          </Link>

          {/* Desktop nav: lg and up */}
          <nav
            className={cn(
              "hidden lg:flex items-center gap-6 xl:gap-8",
              "text-sm text-gray-600 dark:text-gray-400"
            )}
          >
            {menuLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
              >
                {label}
              </Link>
            ))}
            <span
              aria-hidden
              className="h-4 w-px shrink-0 bg-gray-300 dark:bg-gray-600 mx-1 xl:mx-2"
            />
            <Link
              href={loginHref}
              className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              {loginLabel}
            </Link>
          </nav>

          {/* Mobile: hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className={cn(
              "lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400",
              "hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          "transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close overlay"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/50"
        />
        <aside
          className={cn(
            "absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-950",
            "shadow-xl flex flex-col",
            "transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-14 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4 text-sm text-gray-600 dark:text-gray-400">
            {menuLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {label}
              </Link>
            ))}
            <span className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
            <Link
              href={loginHref}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {loginLabel}
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
