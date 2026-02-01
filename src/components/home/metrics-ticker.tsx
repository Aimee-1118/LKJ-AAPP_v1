"use client";

import { cn } from "@/lib/utils";

const TOP_METRICS = [
  { label: "Active Members", value: "24" },
  { label: "Active Courses", value: "3" },
  { label: "Total Projects", value: "128" },
] as const;

const STATUS_METRICS = [
  { label: "Recruiting", value: "5", descriptionKo: "너 나와 동료가 되이라" },
  { label: "Draft", value: "8", descriptionKo: "우리 어린것도 하고 싶어요" },
  { label: "In Progress", value: "12", descriptionKo: "굴러가는 중인 일들" },
  { label: "Completed", value: "30", descriptionKo: "끝나서 빛나는 완료된 프로젝트를" },
] as const;

export function MetricsTicker() {
  return (
    <section className="w-full border-y border-gray-200 bg-gray-50 py-[59px] dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOP_METRICS.map(({ label, value }) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3",
                "text-gray-900 dark:text-gray-100"
              )}
            >
              <span
                className="h-8 w-8 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600"
                aria-hidden
              />
              <div>
                <p className="text-2xl font-semibold sm:text-3xl">{value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[59px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_METRICS.map(({ label, value, descriptionKo }) => (
            <div
              key={label}
              className={cn(
                "rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-6 w-6 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600"
                  aria-hidden
                />
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {label}
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {descriptionKo}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                  role="progressbar"
                  aria-valuenow={Number(value)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gray-700 dark:bg-gray-300 transition-all"
                    style={{ width: `${Math.min(Number(value) * 3, 100)}%` }}
                  />
                </div>
                <span className="shrink-0 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
