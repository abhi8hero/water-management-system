import React from 'react';
import { cn } from '@/lib/utils';
import type { WaterLevelStatus } from '@/types/types';

interface TankVisualizationProps {
  level: number; // 0-100
  name: string;
  status: WaterLevelStatus;
  capacity?: number;
  inflowRate?: number;
  outflowRate?: number;
  size?: 'sm' | 'md' | 'lg';
}

const statusColors: Record<WaterLevelStatus, { fill: string; wave: string; text: string; label: string }> = {
  normal: {
    fill: 'rgba(34, 197, 94, 0.25)',
    wave: 'rgba(34, 197, 94, 0.5)',
    text: 'text-success',
    label: 'Normal',
  },
  warning: {
    fill: 'rgba(234, 179, 8, 0.25)',
    wave: 'rgba(234, 179, 8, 0.5)',
    text: 'text-warning',
    label: 'Warning',
  },
  critical: {
    fill: 'rgba(239, 68, 68, 0.25)',
    wave: 'rgba(239, 68, 68, 0.5)',
    text: 'text-critical',
    label: 'Critical',
  },
};

const sizeMap = {
  sm: { height: 120, width: 80 },
  md: { height: 160, width: 100 },
  lg: { height: 200, width: 120 },
};

export default function TankVisualization({
  level,
  name,
  status,
  capacity,
  inflowRate,
  outflowRate,
  size = 'md',
}: TankVisualizationProps) {
  const colors = statusColors[status];
  const { height, width } = sizeMap[size];
  const clampedLevel = Math.max(0, Math.min(100, level));
  const fillHeight = (clampedLevel / 100) * height;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-muted-foreground text-center truncate max-w-24">{name}</p>

      {/* Tank */}
      <div
        className="relative border border-border rounded-b-sm overflow-hidden bg-muted/30"
        style={{ width, height }}
      >
        {/* Water fill */}
        <div
          className="absolute bottom-0 left-0 right-0 tank-fill overflow-hidden"
          style={{ height: fillHeight, backgroundColor: colors.fill }}
        >
          {/* Wave */}
          {clampedLevel > 5 && (
            <svg
              className="absolute top-0 left-0 water-wave"
              style={{ width: '200%', height: 8 }}
              viewBox="0 0 200 8"
              preserveAspectRatio="none"
            >
              <path
                d="M0,4 C25,0 50,8 75,4 C100,0 125,8 150,4 C175,0 200,8 200,4 L200,8 L0,8 Z"
                fill={colors.wave}
              />
            </svg>
          )}
        </div>

        {/* Level tick marks */}
        {[25, 50, 75].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0 flex items-center"
            style={{ bottom: `${tick}%` }}
          >
            <div className="w-2 h-px bg-border/60" />
          </div>
        ))}

        {/* Percentage label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xs font-semibold tabular-nums', colors.text)}>
            {clampedLevel.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Status badge */}
      <span className={cn('text-xs font-medium', colors.text)}>{colors.label}</span>

      {/* Capacity if provided */}
      {capacity && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {(capacity / 1000000).toFixed(1)}M L
        </span>
      )}

      {/* Flow rates */}
      {(inflowRate !== undefined || outflowRate !== undefined) && (
        <div className="flex flex-col gap-0.5 text-center">
          {inflowRate !== undefined && (
            <span className="text-xs text-muted-foreground">
              ↑ {inflowRate.toFixed(0)} L/m
            </span>
          )}
          {outflowRate !== undefined && (
            <span className="text-xs text-muted-foreground">
              ↓ {outflowRate.toFixed(0)} L/m
            </span>
          )}
        </div>
      )}
    </div>
  );
}
