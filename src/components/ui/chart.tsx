import { cn } from "@/lib/cn";
import { formatCompactNumber, formatNumber } from "@/lib/format";

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

function niceMax(value: number) {
  if (value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;

  return nice * magnitude;
}

function ChartAxes({
  data,
  height,
  valueFormatter,
  width,
}: {
  data: ChartDatum[];
  height: number;
  valueFormatter: (value: number) => string;
  width: number;
}) {
  const paddingLeft = 64;
  const paddingRight = 20;
  const paddingTop = 18;
  const paddingBottom = 32;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxValue = niceMax(Math.max(...data.map((datum) => datum.value), 1));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <>
      {ticks.map((tick) => {
        const y = paddingTop + plotHeight - tick * plotHeight;

        return (
          <g key={tick}>
            <line
              stroke="var(--ravika-border)"
              strokeWidth="1"
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={y}
              y2={y}
            />
            <text
              fill="var(--ravika-muted-foreground)"
              fontSize="10"
              textAnchor="end"
              x={paddingLeft - 8}
              y={y + 3}
            >
              {valueFormatter(maxValue * tick)}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function BarChart({
  ariaLabel,
  className,
  data,
  height = 260,
  valueFormatter = formatCompactNumber,
}: {
  ariaLabel: string;
  className?: string;
  data: ChartDatum[];
  height?: number;
  valueFormatter?: (value: number) => string;
}) {
  const width = 640;
  const paddingLeft = 64;
  const paddingRight = 20;
  const paddingTop = 18;
  const paddingBottom = 32;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxValue = niceMax(Math.max(...data.map((datum) => datum.value), 1));
  const slotWidth = plotWidth / Math.max(data.length, 1);
  const barWidth = Math.min(slotWidth * 0.48, 56);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <svg
        aria-label={ariaLabel}
        className="h-auto w-full"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <title>{ariaLabel}</title>
        <ChartAxes
          data={data}
          height={height}
          valueFormatter={valueFormatter}
          width={width}
        />
        {data.map((datum, index) => {
          const barHeight = Math.max((datum.value / maxValue) * plotHeight, 2);
          const x =
            paddingLeft + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = paddingTop + plotHeight - barHeight;

          return (
            <g key={datum.label}>
              <rect
                fill="var(--ravika-primary)"
                height={barHeight}
                rx="4"
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
  height = 260,
  valueFormatter = formatCompactNumber,
}: {
  ariaLabel: string;
  className?: string;
  data: ChartDatum[];
  height?: number;
  valueFormatter?: (value: number) => string;
}) {
  const width = 640;
  const paddingLeft = 64;
  const paddingRight = 20;
  const paddingTop = 18;
  const paddingBottom = 32;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const maxValue = niceMax(Math.max(...data.map((datum) => datum.value), 1));
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const points = data
    .map((datum, index) => {
      const x = paddingLeft + index * step;
      const y = paddingTop + plotHeight - (datum.value / maxValue) * plotHeight;
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
        <ChartAxes
          data={data}
          height={height}
          valueFormatter={valueFormatter}
          width={width}
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
          const x = paddingLeft + index * step;
          const y =
            paddingTop + plotHeight - (datum.value / maxValue) * plotHeight;

          return (
            <g key={datum.label}>
              <circle
                cx={x}
                cy={y}
                fill="var(--ravika-surface)"
                r="4"
                stroke="var(--ravika-primary)"
                strokeWidth="2.5"
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
    <div className={cn("h-14 w-full max-w-48", className)}>
      <svg
        aria-label={ariaLabel}
        className="h-full w-full"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
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
    </div>
  );
}
