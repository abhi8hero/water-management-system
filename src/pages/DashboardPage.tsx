import React from 'react';
import { Waves, TrendingDown, TrendingUp, AlertTriangle, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import MainLayout from '@/components/layouts/MainLayout';
import TankVisualization from '@/components/TankVisualization';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  iconClass,
  sub,
  highlight,
}: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  iconClass?: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn('h-full', highlight && 'border-critical/40')}>
      <CardContent className="p-4 md:p-5 flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground text-balance">{title}</p>
          <div className={cn('p-1.5 rounded-md bg-muted shrink-0', iconClass)}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-1.5">
            <span className={cn('text-2xl font-semibold tabular-nums tracking-tight', highlight && 'text-critical')}>
              {value}
            </span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { reservoirs, systemStatus, chartData, flowChartData } = useApp();

  const avgLevel = reservoirs.reduce((s, r) => s + r.currentLevel, 0) / reservoirs.length;
  const totalInflow = reservoirs.reduce((s, r) => s + r.inflowRate, 0);
  const totalOutflow = reservoirs.reduce((s, r) => s + r.outflowRate, 0);
  const distributed = (systemStatus.totalWaterDistributedToday / 1000).toFixed(1);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time overview — Smart Water Distribution System
          </p>
        </div>

        {/* Emergency banner */}
        {systemStatus.emergencyStopActive && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-critical/40 bg-critical/5">
            <AlertTriangle className="w-4 h-4 text-critical shrink-0" />
            <p className="text-sm font-medium text-critical">
              Emergency stop is active. All valves and pumps are shut down.
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <KpiCard
            title="Avg. Water Level"
            value={avgLevel.toFixed(1)}
            unit="%"
            icon={Waves}
            iconClass="text-primary"
            sub="Across all reservoirs"
          />
          <KpiCard
            title="Inflow Rate"
            value={totalInflow.toFixed(0)}
            unit="L/min"
            icon={TrendingDown}
            iconClass="text-success"
            sub="Total system inflow"
          />
          <KpiCard
            title="Outflow Rate"
            value={totalOutflow.toFixed(0)}
            unit="L/min"
            icon={TrendingUp}
            iconClass="text-info"
            sub="Total system outflow"
          />
          <KpiCard
            title="Active Alarms"
            value={systemStatus.activeAlarms}
            icon={AlertTriangle}
            iconClass="text-warning"
            sub="Unacknowledged alerts"
            highlight={systemStatus.activeAlarms > 0}
          />
          <KpiCard
            title="Distributed Today"
            value={distributed}
            unit="kL"
            icon={Droplets}
            iconClass="text-primary"
            sub="Total volume"
          />
        </div>

        {/* Reservoir Tank Visualization */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Reservoir Status</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex flex-wrap gap-6 md:gap-10 justify-start">
              {reservoirs.map((r) => (
                <TankVisualization
                  key={r.id}
                  level={r.currentLevel}
                  name={r.name}
                  status={r.status}
                  capacity={r.capacity}
                  inflowRate={r.inflowRate}
                  outflowRate={r.outflowRate}
                  size="md"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Water level chart */}
          <Card className="h-full">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">Water Level — 24h</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="w-full min-w-0 overflow-hidden" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={5}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6 }}
                      formatter={(v: number) => [`${v.toFixed(1)}%`]}
                    />
                    <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Avg Level"
                      stroke="hsl(217 85% 46%)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="value2"
                      name="Main Reservoir"
                      stroke="hsl(142 72% 36%)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Flow rate chart */}
          <Card className="h-full">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">Flow Rates — 24h (L/min)</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="w-full min-w-0 overflow-hidden" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={flowChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval={5}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[80, 280]}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 6 }}
                      formatter={(v: number) => [`${v.toFixed(0)} L/min`]}
                    />
                    <Legend layout="horizontal" wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Inflow"
                      stroke="hsl(142 72% 36%)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="value2"
                      name="Outflow"
                      stroke="hsl(16 80% 55%)"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alarms */}
        {systemStatus.activeAlarms > 0 && (
          <Card>
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">Active Alarms</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-2">
                {/* Handled in Alerts page; just a summary here */}
                <p className="text-sm text-muted-foreground">
                  {systemStatus.activeAlarms} active alarm{systemStatus.activeAlarms !== 1 ? 's' : ''}. Navigate to{' '}
                  <a href="/alerts" className="text-primary underline-offset-2 hover:underline">
                    Alerts
                  </a>{' '}
                  to review and acknowledge.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
