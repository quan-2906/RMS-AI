"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { format, parse } from "date-fns";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  desktop: {
    label: "Doanh thu",
    color: "var(--secondary)", // Gold color
  },
} satisfies ChartConfig;

export function RevenueLineChart({
  chartData,
}: {
  chartData: { date: string; revenue: number }[];
}) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ChartContainer config={chartConfig} className="w-full h-[300px]">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: -20,
            right: 12,
            top: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => {
              if (chartData.length < 8) {
                return value;
              }
              if (chartData.length < 33) {
                const date = parse(value, "dd/MM/yyyy", new Date());
                return format(date, "dd");
              }
              return "";
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) => {
              if (value === 0) return "0";
              return `${(value / 1000000).toFixed(1)}M`; // format as millions for cleaner Y axis
            }}
          />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            content={<ChartTooltipContent indicator="dashed" className="bg-surface-container border-border text-foreground" />}
          />
          <Line
            dataKey="revenue"
            name="Doanh thu"
            type="monotone"
            stroke="var(--color-desktop)"
            strokeWidth={3}
            dot={{ r: 4, fill: "var(--color-desktop)", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "var(--foreground)", stroke: "var(--color-desktop)", strokeWidth: 2 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
