import Link from "next/link";
import { Twitter, Facebook, Instagram, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const FOOTER_DESCRIPTION =
  "Exploring the intersection of artificial intelligence and architecture design to create innovative solutions for tomorrow.";

const SOCIAL_LINKS = [
  { href: "#", icon: Twitter, label: "Twitter" },
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Github, label: "GitHub" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;

  return (
    <footer className="w-full bg-gray-900 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-8">
          <div className="flex flex-col gap-4 md:max-w-md">
            <Link
              href="/"
              className={cn(
                "text-sm font-bold text-white",
                "hover:text-gray-200 transition-colors"
              )}
            >
              LKJ-AAPP
            </Link>
            <p className="text-sm text-gray-300">{FOOTER_DESCRIPTION}</p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              lkj-aapp.co © {startYear}-{currentYear}, All Rights Reserved
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end md:justify-start">
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  "flex h-12 w-32 items-center justify-center rounded bg-gray-800 text-xs font-medium text-white",
                  "md:h-14 md:w-36"
                )}
              >
                MYONGJI UNIVERSITY
              </div>
              <div
                className={cn(
                  "flex h-12 w-24 items-center justify-center rounded bg-gray-800 text-xs font-medium text-white",
                  "md:h-14 md:w-28"
                )}
              >
                CAMU
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
