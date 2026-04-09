"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardIndicatorResType } from "@/schemaValidations/indicator.schema";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "oklch(0.646 0.222 41.116)", // chart-1
  },
  safari: {
    label: "Safari",
    color: "oklch(0.6 0.118 184.704)", // chart-2
  },
  firefox: {
    label: "Firefox",
    color: "oklch(0.398 0.07 227.392)", // chart-3
  },
  edge: {
    label: "Edge",
    color: "oklch(0.828 0.189 84.429)", // chart-4
  },
  other: {
    label: "Other",
    color: "oklch(0.769 0.188 70.08)", // chart-5
  },
} satisfies ChartConfig;
const chartData = [
  { name: "chrome", successOrders: 275, fill: "var(--color-chrome)" },
  { name: "safari", successOrders: 200, fill: "var(--color-safari)" },
  { name: "firefox", successOrders: 187, fill: "var(--color-firefox)" },
  { name: "edge", successOrders: 173, fill: "var(--color-edge)" },
  { name: "other", successOrders: 90, fill: "var(--color-other)" },
];
export function DishBarChart({
  chartData,
}: {
  chartData: Pick<
    DashboardIndicatorResType["data"]["dishIndicator"][0],
    "name" | "successOrders"
  >[];
}) {
  const chartDateColor = chartData.map((item, index) => ({
    ...item,
    fill: COLORS[index] ?? COLORS[COLORS.length - 1],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xếp hạng món ăn</CardTitle>
        <CardDescription>Được gọi nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartDateColor}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={2}
              axisLine={false}
              tickFormatter={(value) => {
                return value;
              }}
            />
            <XAxis dataKey="successOrders" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="successOrders"
              name={"Đơn thanh toán"}
              radius={5}
              fill="fill"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm"></CardFooter>
    </Card>
  );
}
