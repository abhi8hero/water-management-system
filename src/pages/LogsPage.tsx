import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import type { LogEventType } from '@/types/types';

const eventTypeLabel: Record<LogEventType, string> = {
  valve_open: 'Valve Open',
  valve_close: 'Valve Close',
  pump_start: 'Pump Start',
  pump_stop: 'Pump Stop',
  emergency_stop: 'Emergency Stop',
  alarm_triggered: 'Alarm Triggered',
  alarm_acknowledged: 'Alarm Ack',
  device_online: 'Device Online',
  device_offline: 'Device Offline',
  sensor_alert: 'Sensor Alert',
  system_event: 'System Event',
};

const eventTypeColor: Record<LogEventType, string> = {
  valve_open: 'text-success',
  valve_close: 'text-muted-foreground',
  pump_start: 'text-primary',
  pump_stop: 'text-muted-foreground',
  emergency_stop: 'text-critical',
  alarm_triggered: 'text-warning',
  alarm_acknowledged: 'text-success',
  device_online: 'text-success',
  device_offline: 'text-critical',
  sensor_alert: 'text-warning',
  system_event: 'text-info',
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

export default function LogsPage() {
  const { logs } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = logs.filter((l) => {
    const matchSearch =
      search === '' ||
      l.message.toLowerCase().includes(search.toLowerCase()) ||
      l.source.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || l.type === typeFilter;
    return matchSearch && matchType;
  });

  const allTypes = Array.from(new Set(logs.map((l) => l.type)));

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">Event Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Chronological record of all system events and operations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 h-9">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {allTypes.map((t) => (
                <SelectItem key={t} value={t}>{eventTypeLabel[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Log table */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold">System Events</CardTitle>
              <span className="text-xs text-muted-foreground">{filtered.length} entries</span>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Time</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Message</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Source</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">User</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div>
                          <p className="text-xs tabular-nums">{log.timestamp.toLocaleTimeString()}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(log.timestamp)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn('text-xs border-current/30', eventTypeColor[log.type])}
                        >
                          {eventTypeLabel[log.type]}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">
                        <span className={cn(log.type === 'emergency_stop' && 'font-medium text-critical')}>
                          {log.message}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.source}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.user ?? '—'}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-sm text-muted-foreground text-center">
                        No log entries match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
