'use client';
import { formatNumber } from '@primedesign/persian';
import { EmptyState, useLabels, usePrime } from '@primedesign/react';
import { useId, type ReactNode } from 'react';
export interface ChartDatum {
  label: string;
  value: number;
}
const palette = ['var(--pd-brand)', '#1caa88', '#eaad53', '#6497f5', '#d372be', '#8996ab'];
const finite = (n: number) => (Number.isFinite(n) ? n : 0);
function ChartFrame({
  title,
  data,
  children,
}: {
  title: string;
  data: ChartDatum[];
  children: ReactNode;
}) {
  const id = useId(),
    l = useLabels(
      { empty: 'داده‌ای برای نمایش نیست', value: 'مقدار' },
      { empty: 'No chart data', value: 'Value' },
    ),
    { locale } = usePrime();
  return (
    <figure className="pd-chart" aria-labelledby={id}>
      <figcaption id={id}>{title}</figcaption>
      {data.length ? children : <EmptyState title={l.empty} icon="chart" />}
      <table className="pd-sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">{title}</th>
            <th scope="col">{l.value}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <th scope="row">{d.label}</th>
              <td>{formatNumber(finite(d.value), {}, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
export function BarChart({ title, data }: { title: string; data: ChartDatum[] }) {
  const { locale, dir } = usePrime(),
    values = data.map((d) => finite(d.value)),
    lo = Math.min(0, ...values),
    hi = Math.max(0, ...values),
    span = hi - lo || 1,
    y = (v: number) => 180 - ((v - lo) / span) * 150,
    zero = y(0),
    step = 520 / Math.max(1, data.length);
  return (
    <ChartFrame title={title} data={data}>
      <svg viewBox="0 0 600 230" className="pd-chart-svg" role="img" aria-label={title}>
        {Array.from({ length: 5 }, (_, i) => {
          const value = lo + (span * i) / 4;
          return (
            <g key={i}>
              <line x1={52} x2={580} y1={y(value)} y2={y(value)} stroke="var(--pd-border)" />
              <text x={44} y={y(value) + 4} textAnchor="end">
                {formatNumber(Math.round(value), {}, locale)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const v = finite(d.value),
            index = dir === 'rtl' ? data.length - 1 - i : i,
            x = 58 + index * step;
          return (
            <g key={i}>
              <rect
                x={x}
                y={Math.min(zero, y(v))}
                width={Math.max(1, step * 0.6)}
                height={Math.max(1, Math.abs(y(v) - zero))}
                rx={4}
                fill={palette[i % palette.length]}
              >
                <title>
                  {d.label}: {formatNumber(v, {}, locale)}
                </title>
              </rect>
              <text x={x + step * 0.3} y={210} textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
export function LineChart({
  title,
  data,
  area = true,
}: {
  title: string;
  data: ChartDatum[];
  area?: boolean;
}) {
  const id = useId(),
    { dir, locale } = usePrime(),
    values = data.map((d) => finite(d.value)),
    lo = Math.min(0, ...values),
    hi = Math.max(0, ...values),
    span = hi - lo || 1,
    point = (v: number, i: number) => [
      dir === 'rtl'
        ? 570 - (i / Math.max(1, data.length - 1)) * 520
        : 50 + (i / Math.max(1, data.length - 1)) * 520,
      180 - ((finite(v) - lo) / span) * 150,
    ],
    points = data.map((d, i) => point(d.value, i)),
    path = points.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return (
    <ChartFrame title={title} data={data}>
      <svg viewBox="0 0 600 230" className="pd-chart-svg" role="img" aria-label={title}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--pd-brand)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--pd-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={50}
            x2={570}
            y1={30 + i * 50}
            y2={30 + i * 50}
            stroke="var(--pd-border)"
          />
        ))}
        {!!points.length && area && (
          <path
            d={`${path} L${points.at(-1)![0]},180 L${points[0][0]},180 Z`}
            fill={`url(#${id})`}
          />
        )}
        <path
          d={path}
          stroke="var(--pd-brand)"
          strokeWidth={3}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={4}
              fill="var(--pd-surface)"
              stroke="var(--pd-brand)"
              strokeWidth={2}
            >
              <title>
                {data[i].label}: {formatNumber(data[i].value, {}, locale)}
              </title>
            </circle>
            <text x={x} y={210} textAnchor="middle">
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </ChartFrame>
  );
}
export function PieChart({ title, data }: { title: string; data: ChartDatum[] }) {
  const positive = data.map((d) => ({ ...d, value: Math.max(0, finite(d.value)) })),
    total = positive.reduce((s, d) => s + d.value, 0),
    { locale } = usePrime();
  let offset = 0;
  return (
    <ChartFrame title={title} data={positive}>
      <div className="pd-pie-layout">
        <svg viewBox="0 0 160 160" width="180" role="img" aria-label={title}>
          <circle cx={80} cy={80} r={57} fill="none" stroke="var(--pd-muted)" strokeWidth={20} />
          {positive.map((d, i) => {
            const size = total ? (d.value / total) * 100 : 0,
              start = offset;
            offset += size;
            return (
              <circle
                key={i}
                cx={80}
                cy={80}
                r={57}
                fill="none"
                stroke={palette[i % palette.length]}
                strokeWidth={20}
                pathLength={100}
                strokeDasharray={`${size} ${100 - size}`}
                strokeDashoffset={-start}
                transform="rotate(-90 80 80)"
              >
                <title>
                  {d.label}: {formatNumber(size, { maximumFractionDigits: 1 }, locale)}%
                </title>
              </circle>
            );
          })}
          <text x={80} y={85} textAnchor="middle" className="pd-pie-total">
            {formatNumber(total, {}, locale)}
          </text>
        </svg>
        <ul className="pd-chart-legend">
          {positive.map((d, i) => (
            <li key={i}>
              <i style={{ background: palette[i % palette.length] }} />
              <span>{d.label}</span>
              <strong>
                {formatNumber(
                  total ? (d.value / total) * 100 : 0,
                  { maximumFractionDigits: 1 },
                  locale,
                )}
                ٪
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  );
}
export function Sparkline({ values, label }: { values: number[]; label?: string }) {
  const clean = values.map(finite),
    min = Math.min(...clean),
    max = Math.max(...clean),
    span = max - min || 1,
    pts = clean
      .map((v, i) => `${(i / Math.max(1, clean.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
      .join(' ');
  return (
    <svg
      viewBox="0 0 100 32"
      className="pd-sparkline"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <polyline
        points={pts}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function BarList({ title, data }: { title: string; data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => finite(d.value))),
    { locale } = usePrime();
  return (
    <ChartFrame title={title} data={data}>
      <ol className="pd-bar-list">
        {data.map((d, i) => (
          <li key={i}>
            <span style={{ width: `${(Math.max(0, d.value) / max) * 100}%` }} />
            <span>{d.label}</span>
            <strong>{formatNumber(d.value, {}, locale)}</strong>
          </li>
        ))}
      </ol>
    </ChartFrame>
  );
}
export function ProportionBar({ title, data }: { title: string; data: ChartDatum[] }) {
  const sum = data.reduce((s, d) => s + Math.max(0, finite(d.value)), 0) || 1,
    { locale } = usePrime();
  return (
    <ChartFrame title={title} data={data}>
      <div className="pd-proportion">
        {data.map((d, i) => (
          <span
            key={i}
            style={{ flex: Math.max(0, d.value), background: palette[i % palette.length] }}
            title={`${d.label}: ${formatNumber((d.value / sum) * 100, { maximumFractionDigits: 1 }, locale)}%`}
          />
        ))}
      </div>
      <ul className="pd-chart-legend">
        {data.map((d, i) => (
          <li key={i}>
            <i style={{ background: palette[i % palette.length] }} />
            {d.label}
            <strong>
              {formatNumber((d.value / sum) * 100, { maximumFractionDigits: 1 }, locale)}٪
            </strong>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
}
