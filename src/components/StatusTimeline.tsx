import { Plane } from "lucide-react";
import { STATUSES, formatTime, type Job } from "@/lib/jobs-store";

const ROW_HEIGHT = 64;

export function StatusTimeline({ job }: { job: Job }) {
  const currentIndex = Math.max(0, STATUSES.indexOf(job.status));
  const planeTop = currentIndex * ROW_HEIGHT + 20;

  return (
    <div
      className="relative py-3"
      aria-label={`Vehicle progress: ${job.status}`}
    >
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-[15px] top-8 w-px bg-white/10"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[5px] z-10 flex size-6 items-center justify-center rounded-full border border-[#D7B96D]/70 bg-[#171612] text-[#E4C779] shadow-[0_0_18px_rgba(215,185,109,0.35)] transition-[top] duration-1000 ease-in-out"
        style={{ top: `${planeTop}px` }}
      >
        <Plane className="size-3.5 rotate-180" strokeWidth={2.4} />
      </div>

      <ol className="relative">
        {STATUSES.map((status, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const entry = job.history.find((item) => item.status === status);

          return (
            <li
              key={status}
              className={`flex h-16 items-center gap-4 transition-opacity duration-500 ${index > currentIndex ? "opacity-40" : "opacity-100"}`}
            >
              <span
                aria-hidden="true"
                className={`ml-1.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${done ? "border-emerald-400 bg-emerald-400/15" : active ? "border-[#D7B96D] bg-[#D7B96D]/15" : "border-white/15 bg-white/[0.03]"}`}
              >
                {done ? (
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                ) : active ? (
                  <span className="size-1.5 rounded-full bg-[#E4C779]" />
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <p className={`text-sm ${done || active ? "font-semibold text-[#F5F1E8]" : "font-medium text-[#A6A29A]"}`}>
                  {status}
                </p>
                {active ? (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#E4C779]">
                    Current stage
                  </p>
                ) : entry ? (
                  <p className="text-[10px] text-[#9C9A95]">{formatTime(entry.at)}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
