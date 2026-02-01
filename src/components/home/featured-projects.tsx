import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLACEHOLDER_PROJECTS = [
  { id: "1", title: "Project_Title", category: "Category", thumb: "https://placehold.co/400x400/9ca3af/6b7280?text=1" },
  { id: "2", title: "Project_Title", category: "Category", thumb: "https://placehold.co/400x400/9ca3af/6b7280?text=2" },
  { id: "3", title: "Project_Title", category: "Category", thumb: "https://placehold.co/400x400/9ca3af/6b7280?text=3" },
  { id: "4", title: "Project_Title", category: "Category", thumb: "https://placehold.co/400x400/9ca3af/6b7280?text=4" },
  { id: "5", title: "Project_Title", category: "Category", thumb: "https://placehold.co/400x400/9ca3af/6b7280?text=5" },
  { id: "6", title: "Project_Title", category: "Category", thumb: "https://placehold.co/400x400/9ca3af/6b7280?text=6" },
];

export function FeaturedProjects() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-[59px] text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
          Recent Works
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {PLACEHOLDER_PROJECTS.map(({ id, title, category, thumb }) => (
            <Link
              key={id}
              href={`/projects/${id}`}
              className={cn(
                "group block overflow-hidden rounded-none bg-white dark:bg-gray-950",
                "transition-opacity hover:opacity-95"
              )}
            >
              {/* 갤러리 뷰: 모든 카드에 타이틀 위에 회색 선 한 줄 */}
              <div className="h-px w-full shrink-0 bg-gray-200 dark:bg-gray-700" aria-hidden />
              {/* Header: 연한 회색(#F5F5F5) 사각형 끝단에 맞게 좌측 정렬 — 동일 좌패딩 pl-4 sm:pl-5 */}
              <div className="flex items-start justify-between gap-3 bg-white py-4 pl-0 pr-4 dark:bg-gray-950 sm:py-2 sm:pl-0 sm:pr-2 rounded-none">
                <div className="min-w-0 flex-1 space-y-0.5 text-left">
                  <p className="text-left text-base font-semibold leading-tight text-gray-900 dark:text-gray-100 sm:text-[12px]">
                    {title}
                  </p>
                  <p className="text-left text-[8pt] font-normal leading-tight text-gray-500 dark:text-gray-400">
                    {category}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-normal text-gray-400 dark:text-gray-500 sm:text-sm">
                  {id}
                </span>
              </div>
              {/* 회색 배경 안에 1:1 이미지 — 이미지 홀더 크기 유지, 연한 회색(#F5F5F5) 본문 */}
              <div className="bg-[#F5F5F5] p-4 dark:bg-gray-900 sm:p-5">
                <div className="relative aspect-square w-full overflow-hidden rounded-none bg-[#D9D9D9] dark:bg-gray-600">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
