import Link from "next/link";
import { cn } from "@/lib/utils";

const PARTNERS = [
  { name: "Microsoft", logoUrl: null },
  { name: "Tech", logoUrl: null },
  { name: "Samsung", logoUrl: null },
  { name: "GitHub", logoUrl: null },
  { name: "IBM", logoUrl: null },
  { name: "Myongji University", logoUrl: null },
  { name: "CMU", logoUrl: null },
  { name: "NBC", logoUrl: null },
];

export function PartnersSponsors() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-xl font-medium text-gray-900 dark:text-gray-100 sm:text-2xl">
          Our Partners & Sponsors
        </h2>
        <div className="flex flex-nowrap gap-8 overflow-x-auto pb-4 md:flex-wrap md:overflow-visible md:pb-0">
          {PARTNERS.map(({ name }) => (
            <div
              key={name}
              className={cn(
                "flex h-12 w-24 shrink-0 items-center justify-center rounded bg-gray-200 text-xs font-medium text-gray-600",
                "dark:bg-gray-700 dark:text-gray-400",
                "md:h-14 md:w-28"
              )}
            >
              {name}
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/partners"
            className={cn(
              "text-sm text-gray-600 underline-offset-4 hover:underline",
              "dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            View All Partners (v)
          </Link>
        </div>
      </div>
    </section>
  );
}
