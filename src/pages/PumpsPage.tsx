import React, { useState } from 'react';
import { Clock, Wifi, WifiOff, Play, Square, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { Pump } from '@/types/types';

function PumpCard({ pump }: { pump: Pump }) {
  const { togglePump, esp32Nodes, systemStatus } = useApp();
  const [loading, setLoading] = useState(false);

  const node = esp32Nodes.find((n) => n.id === pump.esp32Id);
  const nodeOnline = node?.status === 'online';
  const disabled = loading || systemStatus.emergencyStopActive;

  const handleAction = async (action: 'start' | 'stop') => {
    setLoading(true);
    await togglePump(pump.id, action);
    setLoading(false);
  };

  return (
    <Card className={cn('h-full flex flex-col', pump.isRunning && 'border-primary/30')}>
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold">{pump.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{pump.location}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {pump.isRunning && (
              <div className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
            )}
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                pump.isRunning ? 'border-success/50 text-success' : 'border-border text-muted-foreground'
              )}
            >
              {pump.isRunning ? 'Running' : 'Stopped'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex-1 flex flex-col gap-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Power</p>
            <div className="flex items-baseline gap-1">
              <Zap className="w-3 h-3 text-warning shrink-0" />
              <span className="text-sm font-semibold tabular-nums">{pump.powerConsumption.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">kW</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Flow Rate</p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold tabular-nums">{pump.flowRate.toFixed(0)}</span>
              <span className="text-xs text-muted-foreground">L/min</span>
            </div>
          </div>
        </div>

        {/* ESP32 node */}
        <div className="flex items-center gap-1.5 text-xs">
          {nodeOnline ? (
            <Wifi className="w-3 h-3 text-success shrink-0" />
          ) : (
            <WifiOff className="w-3 h-3 text-critical shrink-0" />
          )}
          <span className="text-muted-foreground">{node?.name ?? pump.esp32Id}</span>
          <span className={cn('ml-auto', nodeOnline ? 'text-success' : 'text-critical')}>
            {nodeOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'flex-1 h-9 gap-1.5 text-xs',
              !pump.isRunning && 'border-success/40 text-success hover:bg-success/5'
            )}
            onClick={() => handleAction('start')}
            disabled={disabled || pump.isRunning}
          >
            <Play className="w-3 h-3" />
            Start
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'flex-1 h-9 gap-1.5 text-xs',
              pump.isRunning && 'border-critical/40 text-critical hover:bg-critical/5'
            )}
            onClick={() => handleAction('stop')}
            disabled={disabled || !pump.isRunning}
          >
            <Square className="w-3 h-3" />
            Stop
          </Button>
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Updated {pump.lastUpdated.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PumpsPage() {
  const { pumps, systemStatus } = useApp();

  const runningCount = pumps.filter((p) => p.isRunning).length;
  const totalPower = pumps.reduce((s, p) => s + p.powerConsumption, 0);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-balance">Pump Control</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Start and stop pumps. Monitor power consumption and flow rates.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm shrink-0">
            <div>
              <span className="text-muted-foreground">Running: </span>
              <span className="font-medium">{runningCount}/{pumps.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Power: </span>
              <span className="font-medium tabular-nums">{totalPower.toFixed(1)} kW</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pumps.map((pump) => (
            <PumpCard key={pump.id} pump={pump} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
