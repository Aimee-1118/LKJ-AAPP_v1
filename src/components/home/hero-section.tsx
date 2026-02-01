import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_TITLE = "We design data-driven urban futures.";
const HERO_DESCRIPTION =
  "Exploring the intersection of artificial intelligence and architecture design to create innovative solutions for tomorrow.";

export function HeroSection() {
  return (
    <section className="w-full pt-[59px]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-gray-200",
            "min-h-[200px] sm:min-h-[280px] md:min-h-[320px]"
          )}
        >
          <Image
            src="https://placehold.co/1200x600/e5e7eb/6b7280?text=Hero"
            alt="Hero"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1280px"
          />
        </div>
        <div className="mt-[59px] w-full text-left">
          <h1
            className="font-bold leading-[1.1] text-[var(--Typography-Text-1,#212121)] dark:text-gray-100"
            style={{ fontFamily: '"Pretendard Variable", "Pretendard", sans-serif' }}
          >
            <span className="block text-[32px] sm:text-[48px] lg:text-[64px]">
              {HERO_TITLE}
            </span>
          </h1>
          <p className="mt-[51px] max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
            {HERO_DESCRIPTION}
          </p>
        </div>
      </div>
    </section>
  );
}
