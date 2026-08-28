/* 24×24 · currentColor · stroke 1.6 — 텍스트 글리프 대신 쓰는 최소 아이콘 세트 */

type P = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconMenu = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
  </svg>
);

export const IconSearch = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconCart = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 4h2.2l1.9 10.4a1.6 1.6 0 0 0 1.6 1.3h7.9a1.6 1.6 0 0 0 1.6-1.2L20 8H6.4" />
    <circle cx="9.5" cy="19.5" r="1.3" />
    <circle cx="17" cy="19.5" r="1.3" />
  </svg>
);

export const IconBack = ({ size = 22, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M14.5 5 8 12l6.5 7" />
  </svg>
);

export const IconHome = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M4 10.2 12 4l8 6.2V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconGrid = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
  </svg>
);

export const IconUser = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M4.8 20c.9-3.6 3.7-5.5 7.2-5.5s6.3 1.9 7.2 5.5" />
  </svg>
);

export const IconHeart = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 20s-7.3-4.6-7.3-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.3 2.6C19.3 15.4 12 20 12 20z" />
  </svg>
);

export const IconPlus = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconMinus = ({ size = 16, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14" />
  </svg>
);

export const IconCheck = ({ size = 20, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="m5 12.5 4.6 4.5L19 7.5" />
  </svg>
);

export const IconTruck = ({ size = 18, className }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 7.5h10.5v9H3zM13.5 11h4l3 3v2.5h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
);

/** 별점 — 채워진 아이콘이라 stroke 대신 fill */
export const IconStar = ({ size = 13, className }: P) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    className={className}
  >
    <path d="m12 3.6 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 17.4 6.7 20.3l1.1-6.1L3.4 10l6-.8z" />
  </svg>
);
