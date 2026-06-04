import React from 'react';
import { Waves, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import TankVisualization from '@/components/TankVisualization';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { WaterLevelStatus } from '@/types/types';

const statusBadgeMap: Record<WaterLevelStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  normal: { label: 'Normal', variant: 'secondary' },
  warning: { label: 'Warning', variant: 'outline' },
  critical: { label: 'Critical', variant: 'destructive' },
};

export default function ReservoirsPage() {
  const { reservoirs } = useApp();

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">Reservoirs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor water levels and flow rates across all reservoirs.
          </p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {reservoirs.map((r) => {
            const badge = statusBadgeMap[r.status];
            return (
              <Card key={r.id} className="h-full">
                <CardContent className="p-4 flex flex-col gap-2 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-balance leading-snug">{r.name}</p>
                    <Badge
                      variant={badge.variant}
                      className={cn(
                        'text-xs shrink-0',
                        r.status === 'warning' && 'border-warning text-warning',
                        r.status === 'normal' && 'border-success/40 text-success'
                      )}
                    >
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-semibold tabular-nums">{r.currentLevel.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((r.capacity * r.currentLevel) / 100 / 1000000).toFixed(2)}M / {(r.capacity / 1000000).toFixed(1)}M L
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed reservoir cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservoirs.map((r) => (
            <Card key={r.id} className={cn('h-full', r.status === 'critical' && 'border-critical/30')}>
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold text-balance">{r.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.location}</p>
                  </div>
                  <Badge
                    variant={statusBadgeMap[r.status].variant}
                    className={cn(
                      'text-xs shrink-0',
                      r.status === 'warning' && 'border-warning text-warning',
                      r.status === 'normal' && 'border-success/40 text-success'
                    )}
                  >
                    {statusBadgeMap[r.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex gap-6 items-start">
                  {/* Tank */}
                  <div className="shrink-0">
                    <TankVisualization
                      level={r.currentLevel}
                      name={r.name}
                      status={r.status}
                      size="lg"
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex-1 min-w-0 space-y-4 pt-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Current Volume</p>
                      <p className="text-sm font-medium">
                        {((r.capacity * r.currentLevel) / 100 / 1000).toFixed(0)} kL
                        <span className="text-muted-foreground font-normal"> / {(r.capacity / 1000).toFixed(0)} kL</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <TrendingDown className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Inflow</p>
                          <p className="text-sm font-medium tabular-nums">{r.inflowRate.toFixed(0)} L/min</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-info mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Outflow</p>
                          <p className="text-sm font-medium tabular-nums">{r.outflowRate.toFixed(0)} L/min</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Net Flow</p>
                      <p className={cn('text-sm font-medium tabular-nums', r.inflowRate >= r.outflowRate ? 'text-success' : 'text-critical')}>
                        {r.inflowRate >= r.outflowRate ? '+' : ''}{(r.inflowRate - r.outflowRate).toFixed(0)} L/min
                      </p>
                    </div>

                    {/* Water level progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Level</span>
                        <span>{r.currentLevel.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            r.status === 'normal' ? 'bg-success' : r.status === 'warning' ? 'bg-warning' : 'bg-critical'
                          )}
                          style={{ width: `${r.currentLevel}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Updated {r.lastUpdated.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
