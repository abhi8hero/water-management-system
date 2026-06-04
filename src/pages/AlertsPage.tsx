import React, { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, X, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { AlertSeverity } from '@/types/types';

const severityConfig: Record<AlertSeverity, { icon: React.ElementType; color: string; label: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: 'text-critical', label: 'Critical', bg: 'bg-critical/5 border-critical/20' },
  warning: { icon: AlertTriangle, color: 'text-warning', label: 'Warning', bg: 'bg-warning/5 border-warning/20' },
  info: { icon: Info, color: 'text-info', label: 'Info', bg: 'bg-info/5 border-info/20' },
};

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AlertsPage() {
  const { alerts, acknowledgeAlert } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const filtered = alerts.filter((a) => {
    if (filter === 'active') return !a.acknowledged;
    if (filter === 'acknowledged') return a.acknowledged;
    if (filter === 'critical') return a.severity === 'critical' && !a.acknowledged;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.acknowledged).length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and acknowledge system alarms and notifications.
          </p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-critical">{criticalCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-warning">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-semibold tabular-nums">{alerts.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Filter alerts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="critical">Critical Only</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{filtered.length} alert{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Alert list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CheckCircle className="w-8 h-8 text-success" />
            <p className="text-sm font-medium">No alerts</p>
            <p className="text-xs text-muted-foreground">All systems operating normally.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((alert) => {
              const { icon: Icon, color, label, bg } = severityConfig[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-md border transition-opacity',
                    bg,
                    alert.acknowledged && 'opacity-50'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <Badge
                        variant="outline"
                        className={cn('text-xs border-current/40', color)}
                      >
                        {label}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="secondary" className="text-xs">Acknowledged</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground text-pretty">{alert.message}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Source: {alert.source}</span>
                      <span>Location: {alert.location}</span>
                      <span>{formatRelativeTime(alert.timestamp)}</span>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="sr-only">Acknowledge</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Acknowledge all */}
        {activeCount > 0 && (
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                alerts.filter((a) => !a.acknowledged).forEach((a) => acknowledgeAlert(a.id));
              }}
            >
              <Bell className="w-3.5 h-3.5" />
              Acknowledge All ({activeCount})
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
