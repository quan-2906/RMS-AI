"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

// Aureate Noir color palette for the bar chart
const COLORS = [
  "#e9c349", // secondary (Gold main)
  "#d4af37", // darker gold
  "#b8860b", // dark goldenrod
  "#daa520", // goldenrod
  "#f0e68c", // khaki
];

const chartConfig = {
  successOrders: {
    label: "Đơn hàng",
  },
} satisfies ChartConfig;

export function DishBarChart({
  chartData,
}: {
  chartData: Pick<
    DashboardIndicatorResType["data"]["dishIndicator"][0],
    "name" | "successOrders"
  >[];
}) {
  const chartDataColor = chartData.map((item, index) => ({
    ...item,
    fill: COLORS[index] ?? COLORS[COLORS.length - 1],
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <ChartContainer config={chartConfig} className="w-full h-[300px]">
        <BarChart
          accessibilityLayer
          data={chartDataColor}
          layout="vertical"
          margin={{
            left: 0,
            right: 20,
            top: 10,
            bottom: 10,
          }}
        >
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            width={120}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "var(--font-body)" }}
          />
          <XAxis 
            dataKey="successOrders" 
            type="number" 
            hide 
          />
          <ChartTooltip 
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} 
            content={<ChartTooltipContent className="bg-surface-container border-border text-foreground" />} 
          />
          <Bar
            dataKey="successOrders"
            name="Đơn đã bán"
            radius={[0, 4, 4, 0]}
            fill="fill"
            barSize={20}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
