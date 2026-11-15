import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export type ChartDatum = {
  label: string;
  value: number;
};

export function ChartContainer({
  action,
  children,
  className,
  description,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  description?: string;
  title: string;
}) {
  return (
    <figure
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <figcaption className="text-card-title text-foreground">
            {title}
          </figcaption>
          {description ? (
            <p className="text-caption text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </figure>
  );
}

function ChartTable({ data }: { data: ChartDatum[] }) {
  return (
    <ul className="sr-only">
      {data.map((datum) => (
        <li key={datum.label}>
          {datum.label}: {formatNumber(datum.value)}
        </li>
      ))}
    </ul>
  );
}

export function BarChart({
  ariaLabel,
  className,
  data,
  height = 240,
}: {
  ariaLabel: string;
  className?: string;
  data: ChartDatum[];
  height?: number;
}) {
  const width = 640;
  const padding = 32;
  const labelHeight = 28;
  const chartHeight = height - padding - labelHeight;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.map((datum) => datum.value), 1);
  const slotWidth = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(slotWidth * 0.56, 72);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        aria-label={ariaLabel}
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <title>{ariaLabel}</title>
        <line
          stroke="var(--ravika-border)"
          strokeWidth="1"
          x1={padding}
          x2={width - padding}
          y1={height - labelHeight}
          y2={height - labelHeight}
        />
        {data.map((datum, index) => {
          const barHeight = Math.max((datum.value / maxValue) * chartHeight, 2);
          const x = padding + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = height - labelHeight - barHeight;

          return (
            <g key={datum.label}>
              <rect
                fill="var(--ravika-primary)"
                height={barHeight}
                rx="6"
                width={barWidth}
                x={x}
                y={y}
              />
              <text
                fill="var(--ravika-muted-foreground)"
                fontSize="11"
                textAnchor="middle"
                x={x + barWidth / 2}
                y={height - 8}
              >
                {datum.label}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTable data={data} />
    </div>
  );
}

export function LineChart({
  ariaLabel,
  className,
  data,
  height = 240,
}: {
  ariaLabel: string;
  className?: string;
  data: ChartDatum[];
  height?: number;
}) {
  const width = 640;
  const padding = 32;
  const labelHeight = 28;
  const chartHeight = height - padding - labelHeight;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.map((datum) => datum.value), 1);
  const step = data.length > 1 ? chartWidth / (data.length - 1) : 0;
  const points = data
    .map((datum, index) => {
      const x = padding + index * step;
      const y =
        height -
        labelHeight -
        Math.max((datum.value / maxValue) * chartHeight, 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        aria-label={ariaLabel}
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <title>{ariaLabel}</title>
        <line
          stroke="var(--ravika-border)"
          strokeWidth="1"
          x1={padding}
          x2={width - padding}
          y1={height - labelHeight}
          y2={height - labelHeight}
        />
        <polyline
          fill="none"
          points={points}
          stroke="var(--ravika-primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {data.map((datum, index) => {
          const x = padding + index * step;
          const y =
            height -
            labelHeight -
            Math.max((datum.value / maxValue) * chartHeight, 2);

          return (
            <g key={datum.label}>
              <circle
                cx={x}
                cy={y}
                fill="var(--ravika-surface)"
                r="5"
                stroke="var(--ravika-primary)"
                strokeWidth="3"
              />
              <text
                fill="var(--ravika-muted-foreground)"
                fontSize="11"
                textAnchor="middle"
                x={x}
                y={height - 8}
              >
                {datum.label}
              </text>
            </g>
          );
        })}
      </svg>
      <ChartTable data={data} />
    </div>
  );
}

export function Sparkline({
  ariaLabel,
  className,
  data,
  height = 56,
}: {
  ariaLabel: string;
  className?: string;
  data: ChartDatum[];
  height?: number;
}) {
  const width = 160;
  const padding = 4;
  const maxValue = Math.max(...data.map((datum) => datum.value), 1);
  const minValue = Math.min(...data.map((datum) => datum.value), 0);
  const range = Math.max(maxValue - minValue, 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data
    .map((datum, index) => {
      const x = padding + index * step;
      const y =
        height -
        padding -
        ((datum.value - minValue) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-label={ariaLabel}
      className={cn("h-auto w-full max-w-48", className)}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{ariaLabel}</title>
      <polyline
        fill="none"
        points={points}
        stroke="var(--ravika-primary)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}
