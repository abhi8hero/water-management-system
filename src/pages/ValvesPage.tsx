import React, { useState } from 'react';
import { Clock, Wifi, WifiOff, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { Valve } from '@/types/types';

function ValveCard({ valve }: { valve: Valve }) {
  const { toggleValve, esp32Nodes, systemStatus } = useApp();
  const [loading, setLoading] = useState(false);

  const node = esp32Nodes.find((n) => n.id === valve.esp32Id);
  const nodeOnline = node?.status === 'online';
  const disabled = loading || systemStatus.emergencyStopActive;

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    await toggleValve(valve.id, checked);
    setLoading(false);
  };

  return (
    <Card className={cn('h-full', valve.isOpen && 'border-primary/30')}>
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">{valve.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{valve.location}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs shrink-0',
              valve.isOpen ? 'border-success/50 text-success' : 'border-border text-muted-foreground'
            )}
          >
            {valve.isOpen ? 'Open' : 'Closed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Toggle row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{valve.isOpen ? 'ON — Open' : 'OFF — Closed'}</p>
            <p className="text-xs text-muted-foreground">Solenoid valve control</p>
          </div>
          <Switch
            checked={valve.isOpen}
            onCheckedChange={handleToggle}
            disabled={disabled}
            className={cn(loading && 'opacity-50')}
          />
        </div>

        {/* Status grid */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Relay Status</p>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                valve.relayStatus ? 'bg-success' : 'bg-muted-foreground'
              )} />
              <span className="text-xs font-medium">{valve.relayStatus ? 'Energized' : 'De-energized'}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">ESP32 Node</p>
            <div className="flex items-center gap-1.5">
              {nodeOnline ? (
                <Wifi className="w-3 h-3 text-success shrink-0" />
              ) : (
                <WifiOff className="w-3 h-3 text-critical shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{node?.name ?? valve.esp32Id}</span>
            </div>
          </div>
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Updated {valve.lastUpdated.toLocaleTimeString()}</span>
        </div>

        {/* Emergency stop notice */}
        {systemStatus.emergencyStopActive && (
          <div className="flex items-start gap-1.5 text-xs text-warning bg-warning/5 border border-warning/20 rounded px-2.5 py-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Emergency stop active. Control disabled.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ValvesPage() {
  const { valves, systemStatus } = useApp();

  const openCount = valves.filter((v) => v.isOpen).length;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">Valve Control</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage solenoid valves via ESP32 relay modules.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-muted-foreground">
              {openCount} / {valves.length} open
            </span>
            {systemStatus.emergencyStopActive && (
              <Badge variant="destructive" className="text-xs">Emergency Stop Active</Badge>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3.5 py-3 border border-border">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Toggling a valve sends an HTTP request to the linked ESP32 node. The ESP32 activates/deactivates the relay,
            which opens/closes the solenoid valve. The UI updates immediately upon successful command.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {valves.map((valve) => (
            <ValveCard key={valve.id} valve={valve} />
          ))}
        </div>

        {/* API Reference */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">ESP32 API Reference</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-muted/40 rounded-md p-3 space-y-1">
                <p className="font-sans font-medium text-sm mb-2">GET /api/status</p>
                <p className="text-muted-foreground">{'{'}</p>
                <p className="pl-4 text-muted-foreground">"waterLevel": 75,</p>
                <p className="pl-4 text-muted-foreground">"valveA": true,</p>
                <p className="pl-4 text-muted-foreground">"valveB": false,</p>
                <p className="pl-4 text-muted-foreground">"pump1": false</p>
                <p className="text-muted-foreground">{'}'}</p>
              </div>
              <div className="bg-muted/40 rounded-md p-3 space-y-1">
                <p className="font-sans font-medium text-sm mb-2">POST /api/valve{'<ID>'}</p>
                <p className="text-muted-foreground">Body:</p>
                <p className="text-muted-foreground">{'{'}</p>
                <p className="pl-4 text-muted-foreground">"state": true</p>
                <p className="text-muted-foreground">{'}'}</p>
                <p className="mt-2 text-muted-foreground">Response:</p>
                <p className="text-muted-foreground">{'{ "success": true }'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
