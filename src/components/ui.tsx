import type { ComponentProps } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "w-full rounded-xl font-bold text-base py-4 transition active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";
  const styles = {
    primary: "bg-brand text-white hover:opacity-90",
    secondary: "bg-card text-brand border-[1.5px] border-brand",
    ghost: "bg-transparent text-muted font-semibold text-sm py-3",
  } as const;

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function priceText(won: number) {
  return `${won.toLocaleString("ko-KR")}원`;
}
