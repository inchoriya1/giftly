import Link from "next/link";
import type { ComponentProps } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "w-full rounded-xl font-bold text-base py-4 transition active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";
  const styles = {
    primary: "bg-brand text-white hover:opacity-92",
    secondary: "bg-card text-brand border-[1.5px] border-brand",
    ghost: "bg-transparent text-muted font-semibold text-sm py-3",
  } as const;

  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block w-full rounded-xl bg-brand py-4 text-center text-base font-bold text-white transition active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {children}
    </Link>
  );
}

/** 이미지가 아직 없을 때 쓰는 자리표시자 */
export function Placeholder({
  label = "IMG",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#efe3d6] to-[#dfcdba] font-mono text-[10px] tracking-widest text-[#a89684] ${className}`}
    >
      {label}
    </div>
  );
}

export function priceText(won: number) {
  return `${won.toLocaleString("ko-KR")}원`;
}
