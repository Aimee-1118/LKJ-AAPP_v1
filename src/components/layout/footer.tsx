import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "w-full border-t border-gray-200 bg-white",
        "dark:border-gray-800 dark:bg-gray-950"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link
            href="/"
            className={cn(
              "text-sm font-semibold text-gray-900",
              "hover:text-gray-700 transition-colors",
              "dark:text-gray-100 dark:hover:text-gray-300"
            )}
          >
            LKJ-AAPP
          </Link>
          <nav
            className={cn(
              "flex flex-wrap items-center justify-center gap-6",
              "text-sm text-gray-600 dark:text-gray-400"
            )}
          >
            <Link
              href="/about"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              About
            </Link>
            <Link
              href="/people"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              People
            </Link>
            <Link
              href="/projects"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/publications"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Publications
            </Link>
          </nav>
        </div>
        <p
          className={cn(
            "mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
          )}
        >
          © {currentYear} LKJ-AAPP. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
