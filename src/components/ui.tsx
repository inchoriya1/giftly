import type { ComponentProps } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "w-full rounded-xl font-extrabold text-[14px] py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";
  const styles = {
    primary: "bg-brand text-brand-ink",
    secondary: "bg-card text-ink border border-line",
    ghost: "bg-transparent text-muted font-bold text-sm py-3",
  } as const;

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function priceText(won: number) {
  return `${won.toLocaleString("ko-KR")}원`;
}
