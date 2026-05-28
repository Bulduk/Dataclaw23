import { ReactNode } from "react";

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string; key?: string | number }) {
  return (
    <div className={`bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 shadow-sm rounded-[24px] p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = "neutral", className = "" }: { children: ReactNode; variant?: "neutral" | "success" | "warning" | "danger"; className?: string }) {
  const styles = {
    neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
    success: "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  };
  return (
    <span className={`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
