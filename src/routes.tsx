import type { ReactNode } from 'react';
import DashboardPage from './pages/DashboardPage';
import ReservoirsPage from './pages/ReservoirsPage';
import ValvesPage from './pages/ValvesPage';
import PumpsPage from './pages/PumpsPage';
import SensorsPage from './pages/SensorsPage';
import MapViewPage from './pages/MapViewPage';
import LogsPage from './pages/LogsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Dashboard', path: '/', element: <DashboardPage />, public: true },
  { name: 'Reservoirs', path: '/reservoirs', element: <ReservoirsPage />, public: true },
  { name: 'Valves', path: '/valves', element: <ValvesPage />, public: true },
  { name: 'Pumps', path: '/pumps', element: <PumpsPage />, public: true },
  { name: 'Sensors', path: '/sensors', element: <SensorsPage />, public: true },
  { name: 'Map View', path: '/map', element: <MapViewPage />, public: true },
  { name: 'Logs', path: '/logs', element: <LogsPage />, public: true },
  { name: 'Alerts', path: '/alerts', element: <AlertsPage />, public: true },
  { name: 'Settings', path: '/settings', element: <SettingsPage />, public: true },
];
