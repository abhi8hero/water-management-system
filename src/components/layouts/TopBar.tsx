import React, { useState, useEffect } from 'react';
import { Sun, Moon, Wifi, WifiOff, User, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="text-sm text-muted-foreground tabular-nums">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export default function TopBar() {
  const { systemStatus, isDark, toggleTheme, triggerEmergencyStop, resetEmergency } = useApp();
  const [confirmEmergency, setConfirmEmergency] = useState(false);

  const handleEmergencyClick = async () => {
    if (systemStatus.emergencyStopActive) {
      await resetEmergency();
      return;
    }
    if (confirmEmergency) {
      await triggerEmergencyStop();
      setConfirmEmergency(false);
    } else {
      setConfirmEmergency(true);
      setTimeout(() => setConfirmEmergency(false), 4000);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center gap-4 px-4 md:px-6 bg-background border-b border-border pl-14 lg:pl-4">
      {/* System status */}
      <div className="flex items-center gap-2 shrink-0">
        <div className={cn(
          'w-2 h-2 rounded-full shrink-0',
          systemStatus.systemOnline ? 'bg-success pulse-dot' : 'bg-critical'
        )} />
        <span className="text-xs font-medium hidden sm:inline">
          {systemStatus.systemOnline ? 'System Online' : 'System Offline'}
        </span>
      </div>
      <div className="w-px h-5 bg-border hidden sm:block shrink-0" />
      {/* ESP32 nodes */}
      <div className="flex items-center gap-1.5 shrink-0">
        {systemStatus.connectedNodes > 0 ? (
          <Wifi className="w-3.5 h-3.5 text-success" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-critical" />
        )}
        <span className="text-xs text-muted-foreground hidden md:inline">
          {systemStatus.connectedNodes}/{systemStatus.totalNodes} ESP32
        </span>
        <Badge variant="outline" className="text-xs h-5 hidden md:flex">
          {systemStatus.connectedNodes > 0 ? 'Connected' : 'Offline'}
        </Badge>
      </div>
      {/* Active alarms badge */}
      {systemStatus.activeAlarms > 0 && (
        <>
          <div className="w-px h-5 bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            <span className="text-xs text-warning font-medium">
              {systemStatus.activeAlarms} alarm{systemStatus.activeAlarms !== 1 ? 's' : ''}
            </span>
          </div>
        </>
      )}
      <div className="flex-1" />
      {/* Live clock */}
      <div className="shrink-0 hidden sm:block">
        <LiveClock />
      </div>
      {/* Emergency stop */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEmergencyClick}
        className={cn(
          'h-8 text-xs font-medium gap-1.5 border shrink-0',
          systemStatus.emergencyStopActive
            ? 'border-warning text-warning hover:bg-warning/10'
            : confirmEmergency
            ? 'border-critical bg-critical/10 text-critical hover:bg-critical/20'
            : 'border-border text-muted-foreground hover:text-foreground'
        )}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {systemStatus.emergencyStopActive
            ? 'Reset E-Stop'
            : confirmEmergency
            ? 'Confirm!'
            : 'E-Stop'}
        </span>
      </Button>
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={toggleTheme}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
      {/* User profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0">
            <User className="w-4 h-4" />
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">Operator</p>
            <p className="text-xs text-muted-foreground">admin@aquacontrol</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>System Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">{"Sign Out"}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
