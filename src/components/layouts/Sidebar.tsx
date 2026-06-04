import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Waves,
  ToggleLeft,
  Zap,
  Activity,
  Map,
  FileText,
  Bell,
  Settings,
  Menu,
  X,
  Droplets,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Reservoirs', path: '/reservoirs', icon: Waves },
  { label: 'Valves', path: '/valves', icon: ToggleLeft },
  { label: 'Pumps', path: '/pumps', icon: Zap },
  { label: 'Sensors', path: '/sensors', icon: Activity },
  { label: 'Map View', path: '/map', icon: Map },
  { label: 'Logs', path: '/logs', icon: FileText },
  { label: 'Alerts', path: '/alerts', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();
  const { systemStatus } = useApp();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
          <Droplets className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground tracking-tight truncate">{"AVV TechSutra"}</p>
          <p className="text-xs text-muted-foreground truncate">Water Management</p>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          const showBadge = label === 'Alerts' && systemStatus.activeAlarms > 0;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {showBadge && (
                <span className="min-w-5 h-5 flex items-center justify-center rounded-full bg-critical text-critical-foreground text-xs font-medium px-1.5">
                  {systemStatus.activeAlarms}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full shrink-0',
            systemStatus.systemOnline ? 'bg-success' : 'bg-critical'
          )} />
          <span className="text-xs text-muted-foreground">
            {systemStatus.connectedNodes}/{systemStatus.totalNodes} nodes online
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-sidebar-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-50 h-9 w-9"
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-56 bg-sidebar">
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
