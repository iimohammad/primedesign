import { createElement, type SVGProps } from 'react';
export const iconPaths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  close: 'M6 6l12 12 M6 18L18 6',
  check: 'M5 12l4 4L19 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  arrowLeft: 'M20 12H4 M10 6l-6 6 6 6',
  arrowRight: 'M4 12h16 M14 6l6 6-6 6',
  cart: 'M3 3h2l3 12h10l3-9H6 M9 20h.01 M18 20h.01',
  bag: 'M5 7h14l1 14H4L5 7z M8 7V5a4 4 0 0 1 8 0v2',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
  star: 'm12 2 3.1 6.3L22 9.4l-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-1.1L12 2z',
  box: 'm12 2 9 5v10l-9 5-9-5V7l9-5z M3 7l9 5 9-5 M12 12v10 M7 4.8l9 5',
  truck:
    'M3 5h12v12H3z M15 9h4l3 4v4h-7 M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4 M18 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6L12 2z M8 12l3 3 5-6',
  calendar: 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z M7 2v5 M17 2v5 M3 10h18',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 6 0 0 1 16 0v2',
  users:
    'M15 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M2 21v-2a9 6 0 0 1 18 0v2 M18 3a4 4 0 0 1 0 8 M20 14a7 5 0 0 1 3 5',
  bell: 'M18 8a6 6 0 0 0-12 0v8l-2 2h16l-2-2V8 M10 21h4',
  message: 'M21 3H3v14h5l4 4 4-4h5V3z M7 8h10 M7 12h6',
  mail: 'M3 5h18v14H3V5z M3 5l9 8 9-8',
  settings:
    'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M9 2h6l1 4 4 1 2 5-3 3 1 4-5 3-3-3-4 1-3-5 3-3-1-4 4-1 1-4z',
  moon: 'M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10',
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  filter: 'M3 4h18l-7 8v7l-4 2v-9L3 4z',
  sort: 'M8 3v18 M4 7l4-4 4 4 M16 21V3 M12 17l4 4 4-4',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 17v4h16v-4',
  upload: 'M12 16V3 M7 8l5-5 5 5 M4 17v4h16v-4',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  edit: 'm16 3 5 5L8 21H3v-5L16 3z M13 6l5 5',
  copy: 'M8 8h13v13H8V8z M16 8V3H3v13h5',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  lock: 'M5 10h14v11H5V10z M8 10V6a4 4 0 0 1 8 0v4',
  info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 11v6 M12 7h.01',
  warning: 'm12 3 10 18H2L12 3z M12 9v5 M12 17h.01',
  chart: 'M3 3v18h18 M7 16v-5 M12 16V7 M17 16V4',
  code: 'M8 5 2 12l6 7 M16 5l6 7-6 7 M14 3l-4 18',
  layers: 'm12 2 10 6-10 6L2 8l10-6z M2 12l10 6 10-6 M2 16l10 6 10-6',
  sparkles: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z',
  creditCard: 'M3 4h18v16H3V4z M3 9h18 M7 15h4',
  tag: 'M3 3h8l10 10-8 8L3 11V3z M7 7h.01',
  compare: 'M8 3v18 M16 3v18 M4 7h8 M12 17h8',
  refresh: 'M21 3v6h-6 M3 21v-6h6 M4 8a8 8 0 0 1 13-4l4 5 M20 16A8 8 0 0 1 7 20l-4-5',
  globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M2 12h20 M12 2c6 5 6 15 0 20-6-5-6-15 0-20',
  link: 'm10 14 4-4 M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0 M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
} as const;
export type IconName = keyof typeof iconPaths;
export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  label?: string;
}
export function Icon({ name, size = 20, label, ...props }: IconProps) {
  return createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      role: label ? 'img' : undefined,
      'aria-label': label,
      'aria-hidden': label ? undefined : true,
      ...props,
    },
    createElement('path', { d: iconPaths[name] }),
  );
}
