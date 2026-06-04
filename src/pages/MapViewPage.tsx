import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layouts/MainLayout';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Import leaflet types but load lazily to avoid SSR issues
import type L from 'leaflet';

interface MarkerInfo {
  id: string;
  name: string;
  type: 'reservoir' | 'pump' | 'esp32';
  lat: number;
  lng: number;
  status: string;
  details: string;
}

export default function MapViewPage() {
  const { reservoirs, pumps, esp32Nodes } = useApp();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MarkerInfo | null>(null);

  const markers: MarkerInfo[] = [
    ...reservoirs.map((r) => ({
      id: r.id,
      name: r.name,
      type: 'reservoir' as const,
      lat: r.lat,
      lng: r.lng,
      status: r.status,
      details: `Level: ${r.currentLevel.toFixed(1)}% | Inflow: ${r.inflowRate.toFixed(0)} L/min | Outflow: ${r.outflowRate.toFixed(0)} L/min`,
    })),
    ...esp32Nodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: 'esp32' as const,
      lat: n.lat,
      lng: n.lng,
      status: n.status,
      details: `IP: ${n.ipAddress} | Firmware: ${n.firmware} | Devices: ${n.linkedDevices.length}`,
    })),
  ];

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon path
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [3.1478, 101.6953],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Colored icons
      const createIcon = (color: string) =>
        L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

      const reservoirIcon = createIcon('#3b82f6');
      const esp32OnlineIcon = createIcon('#22c55e');
      const esp32OfflineIcon = createIcon('#ef4444');
      const pumpIcon = createIcon('#f59e0b');

      // Add reservoir markers
      for (const r of reservoirs) {
        const marker = L.marker([r.lat, r.lng], { icon: reservoirIcon }).addTo(map);
        marker.bindPopup(
          `<b>${r.name}</b><br/>${r.location}<br/>Level: ${r.currentLevel.toFixed(1)}%<br/>Status: ${r.status}`,
          { maxWidth: 200 }
        );
        marker.on('click', () => {
          setSelectedMarker({
            id: r.id,
            name: r.name,
            type: 'reservoir',
            lat: r.lat,
            lng: r.lng,
            status: r.status,
            details: `Level: ${r.currentLevel.toFixed(1)}% | Inflow: ${r.inflowRate.toFixed(0)} L/min | Outflow: ${r.outflowRate.toFixed(0)} L/min`,
          });
        });
      }

      // Add ESP32 node markers
      for (const n of esp32Nodes) {
        const icon = n.status === 'online' ? esp32OnlineIcon : esp32OfflineIcon;
        const marker = L.marker([n.lat, n.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<b>${n.name}</b><br/>IP: ${n.ipAddress}<br/>Status: ${n.status}<br/>Firmware: ${n.firmware}`,
          { maxWidth: 200 }
        );
        marker.on('click', () => {
          setSelectedMarker({
            id: n.id,
            name: n.name,
            type: 'esp32',
            lat: n.lat,
            lng: n.lng,
            status: n.status,
            details: `IP: ${n.ipAddress} | Firmware: ${n.firmware} | Devices: ${n.linkedDevices.length}`,
          });
        });
      }

      // Add pump station markers (offset slightly from reservoir)
      pumps.forEach((p, i) => {
        const res = reservoirs[i % reservoirs.length];
        const lat = res.lat + 0.003 * (i + 1);
        const lng = res.lng - 0.004 * (i + 1);
        const marker = L.marker([lat, lng], { icon: pumpIcon }).addTo(map);
        marker.bindPopup(
          `<b>${p.name}</b><br/>${p.location}<br/>Status: ${p.isRunning ? 'Running' : 'Stopped'}<br/>Power: ${p.powerConsumption.toFixed(1)} kW`,
          { maxWidth: 200 }
        );
      });

      leafletMapRef.current = map;
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-balance">Map View</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Geographic overview of all nodes, reservoirs, and pump stations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {[
            { color: 'bg-primary', label: 'Reservoir' },
            { color: 'bg-success', label: 'ESP32 Online' },
            { color: 'bg-critical', label: 'ESP32 Offline' },
            { color: 'bg-warning', label: 'Pump Station' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div
                ref={mapRef}
                className="w-full"
                style={{ height: 480 }}
              />
            </Card>
          </div>

          {/* Marker list */}
          <div className="space-y-3">
            {selectedMarker && (
              <Card className="border-primary/30">
                <CardHeader className="px-4 pt-4 pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Selected
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <p className="text-sm font-semibold">{selectedMarker.name}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      selectedMarker.status === 'online' || selectedMarker.status === 'normal'
                        ? 'border-success/40 text-success'
                        : selectedMarker.status === 'warning'
                        ? 'border-warning/40 text-warning'
                        : 'border-critical/40 text-critical'
                    )}
                  >
                    {selectedMarker.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">{selectedMarker.details}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-xs font-semibold">All Nodes</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {markers.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex items-start gap-2 py-2 px-2.5 rounded-md cursor-pointer transition-colors',
                      selectedMarker?.id === m.id ? 'bg-accent' : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedMarker(m)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedMarker(m)}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-1 shrink-0',
                        m.type === 'reservoir' ? 'bg-primary'
                          : m.status === 'online' ? 'bg-success' : 'bg-critical'
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.type}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs ml-auto shrink-0',
                        m.status === 'online' || m.status === 'normal'
                          ? 'border-success/40 text-success'
                          : m.status === 'warning'
                          ? 'border-warning/40 text-warning'
                          : 'border-critical/40 text-critical'
                      )}
                    >
                      {m.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
