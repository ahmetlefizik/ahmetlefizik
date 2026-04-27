"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, Flame, TrendingUp, Calendar } from "lucide-react";
import { useAppContext } from "@/components/session-provider";

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
}

function MiniBarChart({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => {
        const height = maxVal > 0 ? Math.max(4, (d.value / maxVal) * 100) : 4;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm bg-primary/60 transition-all duration-500 hover:bg-primary" style={{ height: `${height}%` }} title={`${d.label}: ${formatHours(d.value)}`} />
            <span className="text-[9px] text-muted-foreground/60 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StudyAnalytics() {
  const { studyRecords, getStats } = useAppContext();
  const stats = getStats();

  const weeklyData: { label: string; value: number }[] = [];
  const dayNames = ["Pzr", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const record = studyRecords.find((r) => r.date === dateStr);
    weeklyData.push({ label: dayNames[d.getDay()], value: record?.minutes ?? 0 });
  }
  const weeklyMax = Math.max(...weeklyData.map((d) => d.value), 1);

  const monthlyData: { label: string; value: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    let total = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() - (w * 7 + d));
      const dateStr = date.toISOString().split("T")[0];
      const record = studyRecords.find((r) => r.date === dateStr);
      total += record?.minutes ?? 0;
    }
    monthlyData.push({ label: `${w + 1}. hafta`, value: total });
  }
  monthlyData.reverse();
  const monthlyMax = Math.max(...monthlyData.map((d) => d.value), 1);

  const statCards = [
    { label: "Bugün", value: stats.today, icon: Clock, color: "text-blue-400" },
    { label: "Bu Hafta", value: stats.thisWeek, icon: Calendar, color: "text-emerald-400" },
    { label: "Bu Ay", value: stats.thisMonth, icon: TrendingUp, color: "text-violet-400" },
    { label: "Bu Yıl", value: stats.thisYear, icon: BarChart3, color: "text-amber-400" },
  ];

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card shadow-sm">
      <CardHeader className="relative flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Çalışma İstatistikleri</CardTitle>
        </div>
        <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-400 bg-amber-500/10 transition-colors hover:bg-amber-500/20 shadow-sm shadow-amber-500/10">
          <Flame className="h-3 w-3" /> {stats.currentStreak} gün seri
        </Badge>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-lg border border-border/30 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                <span className="text-[11px] text-muted-foreground">{label}</span>
              </div>
              <p className="text-lg font-bold font-mono">{formatHours(value)}</p>
            </div>
          ))}
        </div>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="w-full bg-muted/30">
            <TabsTrigger value="weekly" className="flex-1 text-xs">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-xs">Aylık</TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="mt-3">
            <MiniBarChart data={weeklyData} maxVal={weeklyMax} />
          </TabsContent>
          <TabsContent value="monthly" className="mt-3">
            <MiniBarChart data={monthlyData} maxVal={monthlyMax} />
          </TabsContent>
        </Tabs>
        <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 p-3">
          <span className="text-sm text-muted-foreground">Toplam Çalışma</span>
          <span className="text-sm font-bold text-primary">{formatHours(stats.total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
