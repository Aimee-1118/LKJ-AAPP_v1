"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/login", label: "Login" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-foreground hover:text-foreground/80 shrink-0"
        >
          LKJ-AAPP
        </Link>
        <nav
          className={cn(
            "flex items-center gap-6",
            "text-sm text-muted-foreground"
          )}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
