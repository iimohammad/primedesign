export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';
export interface ThemeOptions {
  brand?: string;
  radius?: number;
  fontFamily?: string;
  density?: Density;
  selector?: string;
}
export const spacing = {
  0: '0',
  1: '.25rem',
  2: '.5rem',
  3: '.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
export const semanticTokens = {
  light: {
    bg: '#f7f8fc',
    surface: '#ffffff',
    elevated: '#ffffff',
    muted: '#f0f2f7',
    text: '#17233b',
    secondary: '#52617a',
    border: '#dce2ed',
    inputBorder: '#8290a5',
    success: '#13714b',
    successBg: '#e5f6ed',
    danger: '#b42338',
    dangerBg: '#fff0f1',
    warning: '#855100',
    warningBg: '#fff4d7',
    info: '#1556a2',
    infoBg: '#eaf2ff',
  },
  dark: {
    bg: '#101725',
    surface: '#182133',
    elevated: '#212d43',
    muted: '#253147',
    text: '#f0f4fc',
    secondary: '#b3c1d6',
    border: '#35455e',
    inputBorder: '#7688a5',
    success: '#77e0af',
    successBg: '#173c31',
    danger: '#ff9ba8',
    dangerBg: '#492333',
    warning: '#f7d285',
    warningBg: '#40351e',
    info: '#9ac5ff',
    infoBg: '#1b3555',
  },
} as const;
export function hexToRgb(hex: string): [number, number, number] {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new TypeError('Brand must be a six digit hex color');
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}
export function contrastRatio(a: string, b: string): number {
  const lum = (v: string) =>
    hexToRgb(v)
      .map((c) => {
        const n = c / 255;
        return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
export function brandScale(brand: string): Record<number, string> {
  const rgb = hexToRgb(brand);
  const mix = (n: number) =>
    '#' +
    rgb
      .map((c) =>
        Math.round(n >= 0 ? c + (255 - c) * n : c * (1 + n))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  return Object.fromEntries(
    ([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const).map((s, i) => [
      s,
      mix([0.95, 0.9, 0.74, 0.54, 0.25, 0, -0.15, -0.3, -0.45, -0.6, -0.72][i]),
    ]),
  );
}
export function createTheme({
  brand = '#6254df',
  radius = 16,
  fontFamily = 'Vazirmatn, Tahoma, system-ui, sans-serif',
  density = 'comfortable',
  selector = ':root',
}: ThemeOptions = {}): string {
  const scale = brandScale(brand);
  if (!Number.isFinite(radius) || radius < 0 || radius > 40)
    throw new RangeError('Radius must be between 0 and 40');
  if (/[{};<>\n\r]/.test(fontFamily) || !fontFamily.trim())
    throw new TypeError('Invalid font family');
  if (!/^(:root|\.[\w-]+|#[\w-]+|\[data-pd-brand="[\w-]+"\])$/.test(selector))
    throw new TypeError('Use :root, a class, an id or a data-pd-brand selector');
  const ink =
    contrastRatio(brand, '#ffffff') >= contrastRatio(brand, '#101725') ? '#ffffff' : '#101725';
  return `${selector} {\n${Object.entries(scale)
    .map(([k, v]) => `  --pd-brand-${k}: ${v};`)
    .join(
      '\n',
    )}\n  --pd-brand: ${brand};\n  --pd-on-brand: ${ink};\n  --pd-radius: ${radius}px;\n  --pd-font: ${fontFamily};\n  --pd-control-height: ${density === 'compact' ? '2.25rem' : '2.75rem'};\n}\n`;
}
export function tokensCSS(): string {
  const vars = (o: Record<string, string>) =>
    Object.entries(o)
      .map(([k, v]) => `--pd-${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
      .join(';');
  return `${createTheme()}\n:root{${Object.entries(spacing)
    .map(([k, v]) => `--pd-space-${k}:${v}`)
    .join(
      ';',
    )};--pd-shadow:0 12px 40px #182c4810;--pd-shadow-lg:0 24px 80px #12234526;--pd-focus:0 0 0 3px color-mix(in srgb,var(--pd-brand),transparent 72%);--pd-motion:160ms}\n:root,[data-pd-theme="light"]{color-scheme:light;${vars(semanticTokens.light)}}\n[data-pd-theme="dark"]{color-scheme:dark;${vars(semanticTokens.dark)}}\n[data-pd-density="compact"]{--pd-control-height:2.25rem}\n`;
}
