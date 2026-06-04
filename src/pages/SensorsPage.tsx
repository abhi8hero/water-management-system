import React, { useState } from 'react';
import { Activity, Wifi, WifiOff, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { SensorType } from '@/types/types';

const sensorTypeLabel: Record<SensorType, string> = {
  water_level: 'Water Level',
  flow: 'Flow Rate',
  pressure: 'Pressure',
  temperature: 'Temperature',
};

const sensorTypeColor: Record<SensorType, string> = {
  water_level: 'text-primary',
  flow: 'text-success',
  pressure: 'text-info',
  temperature: 'text-warning',
};

export default function SensorsPage() {
  const { sensors, esp32Nodes } = useApp();
  const [search, setSearch] = useState('');

  const filtered = sensors.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      sensorTypeLabel[s.type].toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = sensors.filter((s) => s.status === 'online').length;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">Sensors</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time readings from all connected sensors.
            </p>
          </div>
          <span className="text-sm text-muted-foreground shrink-0">
            {onlineCount}/{sensors.length} online
          </span>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sensors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Sensor summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {(['water_level', 'flow', 'pressure', 'temperature'] as SensorType[]).map((type) => {
            const typeSensors = sensors.filter((s) => s.type === type);
            const avgVal = typeSensors.reduce((s, x) => s + x.value, 0) / (typeSensors.length || 1);
            const unit = typeSensors[0]?.unit ?? '';
            return (
              <Card key={type}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className={cn('w-3.5 h-3.5 shrink-0', sensorTypeColor[type])} />
                    <p className="text-xs text-muted-foreground">{sensorTypeLabel[type]}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold tabular-nums">{avgVal.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">{unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">avg • {typeSensors.length} sensors</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sensor table */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Sensor Data</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="w-full max-w-full overflow-x-auto bg-card">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Sensor</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Type</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Value</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Location</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">ESP32</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sensor) => {
                    const node = esp32Nodes.find((n) => n.id === sensor.esp32Id);
                    return (
                      <tr key={sensor.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium whitespace-nowrap">{sensor.name}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={cn('text-xs font-medium', sensorTypeColor[sensor.type])}>
                            {sensorTypeLabel[sensor.type]}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="text-sm font-semibold tabular-nums">{sensor.value.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground ml-1">{sensor.unit}</span>
                        </td>
                        <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">{sensor.location}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {node?.status === 'online' ? (
                              <Wifi className="w-3 h-3 text-success shrink-0" />
                            ) : (
                              <WifiOff className="w-3 h-3 text-critical shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground">{node?.name ?? sensor.esp32Id}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              sensor.status === 'online' && 'border-success/40 text-success',
                              sensor.status === 'offline' && 'border-muted-foreground/40 text-muted-foreground',
                              sensor.status === 'error' && 'border-critical/40 text-critical'
                            )}
                          >
                            {sensor.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                          {sensor.lastUpdated.toLocaleTimeString()}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-sm text-muted-foreground text-center">
                        No sensors match your search.
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
