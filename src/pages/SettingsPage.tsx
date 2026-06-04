import React from 'react';
import { Sun, Moon, Wifi, Info, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ESP32_BASE_URL } from '@/services/esp32Service';

export default function SettingsPage() {
  const { isDark, toggleTheme, esp32Nodes, systemStatus } = useApp();

  return (
    <MainLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure system preferences and ESP32 connections.
          </p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Switch between light and dark interface</p>
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">System Information</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {[
              { label: 'System Status', value: systemStatus.systemOnline ? 'Online' : 'Offline' },
              { label: 'Connected Nodes', value: `${systemStatus.connectedNodes} / ${systemStatus.totalNodes}` },
              { label: 'Active Alarms', value: `${systemStatus.activeAlarms}` },
              { label: 'API Base URL', value: ESP32_BASE_URL },
              { label: 'Version', value: 'AquaControl v1.0.0' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ESP32 Nodes */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">ESP32 Nodes</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {esp32Nodes.map((node) => (
              <div
                key={node.id}
                className="flex items-start gap-3 py-3 border-b border-border last:border-0"
              >
                <div className={cn(
                  'mt-1 w-2 h-2 rounded-full shrink-0',
                  node.status === 'online' ? 'bg-success' : 'bg-critical'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{node.name}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        node.status === 'online' ? 'border-success/40 text-success' : 'border-critical/40 text-critical'
                      )}
                    >
                      {node.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{node.location}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3 h-3" />
                      {node.ipAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      {node.firmware}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Devices: {node.linkedDevices.join(', ')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 pt-0.5">
                  {node.lastSeen.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Integration notes */}
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">ESP32 Integration Notes</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md p-3.5 border border-border">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p>To connect real ESP32 hardware, update <code className="bg-muted px-1 py-0.5 rounded">BASE_URL</code> in <code className="bg-muted px-1 py-0.5 rounded">src/services/esp32Service.ts</code> to your ESP32 IP address.</p>
                <p>Ensure your ESP32 firmware exposes: <code className="bg-muted px-1 py-0.5 rounded">GET /api/status</code> and <code className="bg-muted px-1 py-0.5 rounded">POST /api/valve{'<ID>'}</code></p>
                <p>For WebSocket support, extend the service with a WebSocket connection handler pointing to <code className="bg-muted px-1 py-0.5 rounded">ws://{'<esp32-ip>'}/ws</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
