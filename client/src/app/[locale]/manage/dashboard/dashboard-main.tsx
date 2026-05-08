"use client";

import { RevenueLineChart } from "@/app/[locale]/manage/dashboard/revenue-line-chart";
import { DishBarChart } from "@/app/[locale]/manage/dashboard/dish-bar-chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { endOfDay, format, startOfDay } from "date-fns";
import { useState } from "react";
import { useDashboardIndacator } from "@/queries/useIndicator";
import { formatCurrency, cn } from "@/lib/utils";
import { Banknote, Users, Receipt, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";

const initFromDate = startOfDay<Date>(new Date());
const initToDate = endOfDay<Date>(new Date());

export default function DashboardMain() {
  const t = useTranslations("Dashboard");
  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);
  const { data } = useDashboardIndacator({
    fromDate,
    toDate,
  });
  
  const revenue = data?.payload.data.revenue ?? 0;
  const guestCount = data?.payload.data.guestCount ?? 0;
  const orderCount = data?.payload.data.orderCount ?? 0;
  const servingTableCount = data?.payload.data.servingTableCount ?? 0;
  const revenueByDate = data?.payload.data.revenueByDate ?? [];
  const dishIndicator = data?.payload.data.dishIndicator ?? [];
  
  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center glass-card p-4 rounded-2xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-body text-muted-foreground font-medium uppercase tracking-wider mb-1 sm:mb-0">{t("from")}</span>
          <Input
            type="datetime-local"
            className="text-sm bg-surface-container-high border-border text-foreground rounded-lg focus-visible:ring-secondary w-full sm:w-[190px]"
            value={format(fromDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
            onChange={(event) => setFromDate(new Date(event.target.value))}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-body text-muted-foreground font-medium uppercase tracking-wider mb-1 sm:mb-0">{t("to")}</span>
          <Input
            type="datetime-local"
            className="text-sm bg-surface-container-high border-border text-foreground rounded-lg focus-visible:ring-secondary w-full sm:w-[190px]"
            value={format(toDate, "yyyy-MM-dd HH:mm").replace(" ", "T")}
            onChange={(event) => setToDate(new Date(event.target.value))}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={resetDateFilter}
          className="border-secondary/30 text-secondary hover:bg-secondary/10 hover:text-secondary rounded-lg px-6 font-body tracking-wider uppercase text-xs w-full sm:w-auto mt-2 sm:mt-0"
        >
          {t("reset")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="glass-card rounded-2xl p-5 glow-hover transition-all flex flex-col justify-between space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider">
              {t("totalRevenue")}
            </h3>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <Banknote className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-secondary">{formatCurrency(revenue)}</div>
          </div>
        </div>

        {/* Guests */}
        <div className="glass-card rounded-2xl p-5 glow-hover transition-all flex flex-col justify-between space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider">
              {t("guests")}
            </h3>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(guestCount).replace("đ", "")} {/* Assuming guestCount is an integer */}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-body">{t("ordered")}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="glass-card rounded-2xl p-5 glow-hover transition-all flex flex-col justify-between space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider">
              {t("orders")}
            </h3>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(orderCount).replace("đ", "")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-body">{t("paid")}</p>
          </div>
        </div>

        {/* Serving Tables */}
        <div className="glass-card rounded-2xl p-5 glow-hover transition-all flex flex-col justify-between space-y-4">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider">
              {t("servingTables")}
            </h3>
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <Utensils className="h-4 w-4 text-secondary" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">
              {formatCurrency(servingTableCount).replace("đ", "")}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 glow-hover transition-all">
          <h3 className="text-lg font-serif font-semibold text-foreground mb-4">{t("revenueChart")}</h3>
          <RevenueLineChart chartData={revenueByDate} />
        </div>
        <div className="lg:col-span-3 glass-card rounded-2xl p-5 glow-hover transition-all">
          <h3 className="text-lg font-serif font-semibold text-foreground mb-1">{t("dishRanking")}</h3>
          <p className="text-sm text-muted-foreground font-body mb-4">{t("dishRankingDescription")}</p>
          <DishBarChart chartData={dishIndicator} />
        </div>
      </div>
    </div>
  );
}
