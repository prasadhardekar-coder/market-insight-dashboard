import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../utils/cn";

/**
 * Theme-aware card wrapper. Use everywhere in dashboard pages.
 */
export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Stat({ icon: Icon, label, value, unit, tint }: {
  icon: any; label: string; value: string | number; unit?: string; tint: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-xl ${tint}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
            {value} {unit && <span className="text-base font-normal text-gray-400 dark:text-slate-500">{unit}</span>}
          </p>
        </div>
      </div>
    </Card>
  );
}

/** Section heading */
export function Heading({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("mb-4 mt-8 text-lg font-semibold text-gray-900 dark:text-slate-100", className)}>{children}</h2>;
}

/** Page-level heading */
export function PageHeading({ children }: { children: ReactNode }) {
  return <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-100 md:text-4xl">{children}</h2>;
}

/** Subtle pill / badge */
export function Pill({ children, tone = "sky" }: { children: ReactNode; tone?: "sky" | "emerald" | "amber" | "red" | "violet" | "slate" }) {
  const tones = {
    sky: "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300",
    emerald: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300",
    amber: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
    red: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
    violet: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  } as const;
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

/** Input with dark mode */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-400 dark:focus:border-sky-500",
        props.className
      )}
    />
  );
}

/** Textarea with dark mode */
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-400 dark:focus:border-sky-500",
        props.className
      )}
    />
  );
}

/** Select with dark mode */
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 outline-none focus:border-sky-400 dark:focus:border-sky-500",
        props.className
      )}
    />
  );
}
