/**
 * Inline SVG icons.
 *
 * Hand-written rather than pulled from a package: the set is small, it costs
 * no runtime dependency or network request, and every glyph inherits
 * currentColor so it themes with the rest of the interface. Emoji are never
 * used as icons — they render differently on every platform and cannot be
 * styled.
 *
 * Geometry follows the usual 24×24, 2px-stroke convention so the icons sit
 * consistently alongside one another.
 */

export interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

function Svg({
  size = 16, className = "", strokeWidth = 2, children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ---------------------------------------------------------------- theme */

export const SunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const MoonIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Svg>
);

export const SystemIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Svg>
);

/* -------------------------------------------------------------- direction */

export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);

export const ChevronUpIcon = (p: IconProps) => (
  <Svg {...p}><path d="m18 15-6-6-6 6" /></Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Svg>
);

/* ----------------------------------------------------------------- action */

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);

export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>
);

/* ----------------------------------------------------------- editor tools */

export const UndoIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 7v6h6" /><path d="M3.5 13a9 9 0 1 0 2.3-6.4L3 9" /></Svg>
);

export const RedoIcon = (p: IconProps) => (
  <Svg {...p}><path d="M21 7v6h-6" /><path d="M20.5 13a9 9 0 1 1-2.3-6.4L21 9" /></Svg>
);

export const BulletListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const NumberListIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.9}>
    <path d="M10 6h10M10 12h10M10 18h10" />
    <path d="M4 5.5 5.2 5v3.4M3.6 14.2c0-.8.6-1.2 1.3-1.2s1.2.4 1.2 1c0 1.3-2.5 1.7-2.5 3.4h2.7" />
  </Svg>
);

export const TaskListIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 6h9M11 12h9M11 18h9" />
    <path d="m3 6 1.6 1.6L7.5 4.5M3 15.5 4.6 17l2.9-3" />
  </Svg>
);

export const QuoteIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.8}>
    <path d="M9 7c-2.2 0-4 1.8-4 4s1.6 3.5 3.5 3.5c.2 2 1.4 2.8 1.4 2.8C7 17 5 14.4 5 11" />
    <path d="M19 7c-2.2 0-4 1.8-4 4s1.6 3.5 3.5 3.5c.2 2 1.4 2.8 1.4 2.8C17 17 15 14.4 15 11" />
  </Svg>
);

export const RuleIcon = (p: IconProps) => (
  <Svg {...p}><path d="M3 12h18" /></Svg>
);

export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12.2 19" />
  </Svg>
);

export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-4.5-4.5L7 20" />
  </Svg>
);

export const TableIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </Svg>
);

export const CodeIcon = (p: IconProps) => (
  <Svg {...p}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></Svg>
);

/* ------------------------------------------------------------- metadata */

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2.5 6.5 9.5 7 9.5-7" />
  </Svg>
);

export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
  </Svg>
);

export const AwardIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="m8.5 14-1.5 7 5-3 5 3-1.5-7" />
  </Svg>
);

/* --------------------------------------------------------- project kinds */
/* Markers for project categories. Line icons, matching the set above. */

export const ChartIcon = (p: IconProps) => (
  <Svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>
);

export const ModelIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="12" r="2" />
    <path d="M7 7.2 17 11M7 16.8 17 13" />
  </Svg>
);

export const LayersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5M3 16.5 12 21.5 21 16.5" />
  </Svg>
);

export const TextIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    <path d="M8 9h8M8 13h5" />
  </Svg>
);

export const MapIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
    <path d="M9 3v15M15 6v15" />
  </Svg>
);

/* ----------------------------------------------------------------- brands */
/* Filled silhouettes rather than stroked outlines, because that is how these
   marks are drawn. They use currentColor, so unlike an external brand image
   they stay legible in both themes. */

function FilledSvg({
  size = 16, className = "", children,
}: Omit<IconProps, "strokeWidth"> & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const GithubIcon = (p: Omit<IconProps, "strokeWidth">) => (
  <FilledSvg {...p}>
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.26.8-.57v-2.2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .31.21.68.81.57A12 12 0 0 0 12 .3Z" />
  </FilledSvg>
);

export const LinkedinIcon = (p: Omit<IconProps, "strokeWidth">) => (
  <FilledSvg {...p}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
  </FilledSvg>
);

export const XIcon = (p: Omit<IconProps, "strokeWidth">) => (
  <FilledSvg {...p}>
    <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
  </FilledSvg>
);
