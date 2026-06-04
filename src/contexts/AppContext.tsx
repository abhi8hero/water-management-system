import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import type {
  Reservoir,
  Valve,
  Pump,
  Sensor,
  Alert,
  LogEntry,
  ESP32Node,
  SystemStatus,
  ChartDataPoint,
  WaterLevelStatus,
} from '@/types/types';
import {
  controlValve,
  controlPump,
  emergencyStop as apiEmergencyStop,
  resetEmergencyStop as apiResetEmergencyStop,
} from '@/services/esp32Service';

interface AppContextValue {
  // Data
  reservoirs: Reservoir[];
  valves: Valve[];
  pumps: Pump[];
  sensors: Sensor[];
  alerts: Alert[];
  logs: LogEntry[];
  esp32Nodes: ESP32Node[];
  systemStatus: SystemStatus;
  chartData: ChartDataPoint[];
  flowChartData: ChartDataPoint[];

  // Actions
  toggleValve: (valveId: 'A' | 'B' | 'C' | 'D', state: boolean) => Promise<void>;
  togglePump: (pumpId: 'pump1' | 'pump2' | 'pump3', action: 'start' | 'stop') => Promise<void>;
  triggerEmergencyStop: () => Promise<void>;
  resetEmergency: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Helper to generate an ID
const genId = () => Math.random().toString(36).slice(2, 9);

// Helper to create a log entry
const createLog = (
  type: LogEntry['type'],
  message: string,
  source: string
): LogEntry => ({
  id: genId(),
  type,
  message,
  timestamp: new Date(),
  source,
  user: 'Operator',
});

// Helper to get water level status
const getStatus = (level: number): WaterLevelStatus => {
  if (level >= 40) return 'normal';
  if (level >= 20) return 'warning';
  return 'critical';
};

// Initial mock data
const INITIAL_RESERVOIRS: Reservoir[] = [
  {
    id: 'r1',
    name: 'Main Reservoir A',
    location: 'North District',
    capacity: 5000000,
    currentLevel: 74,
    inflowRate: 185,
    outflowRate: 162,
    status: 'normal',
    lastUpdated: new Date(),
    lat: 3.1478,
    lng: 101.6953,
  },
  {
    id: 'r2',
    name: 'Reservoir B',
    location: 'East District',
    capacity: 3000000,
    currentLevel: 38,
    inflowRate: 120,
    outflowRate: 130,
    status: 'warning',
    lastUpdated: new Date(),
    lat: 3.1560,
    lng: 101.7100,
  },
  {
    id: 'r3',
    name: 'Emergency Tank C',
    location: 'South District',
    capacity: 1500000,
    currentLevel: 91,
    inflowRate: 60,
    outflowRate: 45,
    status: 'normal',
    lastUpdated: new Date(),
    lat: 3.1320,
    lng: 101.6850,
  },
  {
    id: 'r4',
    name: 'Reservoir D',
    location: 'West District',
    capacity: 2500000,
    currentLevel: 17,
    inflowRate: 80,
    outflowRate: 95,
    status: 'critical',
    lastUpdated: new Date(),
    lat: 3.1400,
    lng: 101.6700,
  },
];

const INITIAL_VALVES: Valve[] = [
  { id: 'A', name: 'Valve A', isOpen: true, relayStatus: true, esp32Id: 'esp32-01', lastUpdated: new Date(), location: 'North Main Line' },
  { id: 'B', name: 'Valve B', isOpen: false, relayStatus: false, esp32Id: 'esp32-01', lastUpdated: new Date(), location: 'East Branch' },
  { id: 'C', name: 'Valve C', isOpen: true, relayStatus: true, esp32Id: 'esp32-02', lastUpdated: new Date(), location: 'South Distribution' },
  { id: 'D', name: 'Valve D', isOpen: false, relayStatus: false, esp32Id: 'esp32-03', lastUpdated: new Date(), location: 'West Supply Line' },
];

const INITIAL_PUMPS: Pump[] = [
  { id: 'pump1', name: 'Main Pump 1', isRunning: true, powerConsumption: 7.4, esp32Id: 'esp32-01', lastUpdated: new Date(), location: 'Pump Station Alpha', flowRate: 185 },
  { id: 'pump2', name: 'Pump 2', isRunning: false, powerConsumption: 0, esp32Id: 'esp32-02', lastUpdated: new Date(), location: 'Pump Station Beta', flowRate: 0 },
  { id: 'pump3', name: 'Booster Pump 3', isRunning: true, powerConsumption: 5.1, esp32Id: 'esp32-03', lastUpdated: new Date(), location: 'Pump Station Gamma', flowRate: 120 },
];

const INITIAL_SENSORS: Sensor[] = [
  { id: 's1', name: 'Level Sensor A1', type: 'water_level', value: 74, unit: '%', esp32Id: 'esp32-01', lastUpdated: new Date(), status: 'online', location: 'Reservoir A' },
  { id: 's2', name: 'Flow Meter F1', type: 'flow', value: 185, unit: 'L/min', esp32Id: 'esp32-01', lastUpdated: new Date(), status: 'online', location: 'Main Inlet' },
  { id: 's3', name: 'Flow Meter F2', type: 'flow', value: 162, unit: 'L/min', esp32Id: 'esp32-02', lastUpdated: new Date(), status: 'online', location: 'Main Outlet' },
  { id: 's4', name: 'Level Sensor B1', type: 'water_level', value: 38, unit: '%', esp32Id: 'esp32-02', lastUpdated: new Date(), status: 'online', location: 'Reservoir B' },
  { id: 's5', name: 'Pressure P1', type: 'pressure', value: 3.2, unit: 'bar', esp32Id: 'esp32-02', lastUpdated: new Date(), status: 'online', location: 'North Line' },
  { id: 's6', name: 'Level Sensor C1', type: 'water_level', value: 91, unit: '%', esp32Id: 'esp32-03', lastUpdated: new Date(), status: 'online', location: 'Reservoir C' },
  { id: 's7', name: 'Level Sensor D1', type: 'water_level', value: 17, unit: '%', esp32Id: 'esp32-03', lastUpdated: new Date(), status: 'online', location: 'Reservoir D' },
  { id: 's8', name: 'Temp Sensor T1', type: 'temperature', value: 24.5, unit: '°C', esp32Id: 'esp32-04', lastUpdated: new Date(), status: 'offline', location: 'Pump Station Alpha' },
];

const INITIAL_ALERTS: Alert[] = [
  { id: 'a1', title: 'Low Water Level', message: 'Reservoir D level below 20%. Immediate action required.', severity: 'critical', timestamp: new Date(Date.now() - 8 * 60000), acknowledged: false, source: 'Level Sensor D1', location: 'West District' },
  { id: 'a2', title: 'Warning: Reservoir B', message: 'Reservoir B approaching warning threshold (38%).', severity: 'warning', timestamp: new Date(Date.now() - 25 * 60000), acknowledged: false, source: 'Level Sensor B1', location: 'East District' },
  { id: 'a3', title: 'Sensor Offline', message: 'Temperature sensor T1 is not responding.', severity: 'info', timestamp: new Date(Date.now() - 60 * 60000), acknowledged: true, source: 'Temp Sensor T1', location: 'Pump Station Alpha' },
  { id: 'a4', title: 'Flow Imbalance', message: 'Outflow exceeds inflow by 15% in West sector.', severity: 'warning', timestamp: new Date(Date.now() - 90 * 60000), acknowledged: false, source: 'Flow Meter F2', location: 'West District' },
];

const INITIAL_LOGS: LogEntry[] = [
  { id: 'l1', type: 'alarm_triggered', message: 'Critical: Reservoir D level at 17%', timestamp: new Date(Date.now() - 8 * 60000), source: 'System', user: 'Auto' },
  { id: 'l2', type: 'valve_open', message: 'Valve A opened by operator', timestamp: new Date(Date.now() - 15 * 60000), source: 'Valve A', user: 'Operator' },
  { id: 'l3', type: 'pump_start', message: 'Main Pump 1 started', timestamp: new Date(Date.now() - 30 * 60000), source: 'Pump 1', user: 'Operator' },
  { id: 'l4', type: 'device_online', message: 'ESP32-01 reconnected', timestamp: new Date(Date.now() - 45 * 60000), source: 'esp32-01', user: 'System' },
  { id: 'l5', type: 'device_offline', message: 'Temp Sensor T1 went offline', timestamp: new Date(Date.now() - 60 * 60000), source: 'esp32-04', user: 'System' },
  { id: 'l6', type: 'valve_close', message: 'Valve B closed for maintenance', timestamp: new Date(Date.now() - 90 * 60000), source: 'Valve B', user: 'Admin' },
  { id: 'l7', type: 'pump_stop', message: 'Pump 2 stopped – low demand', timestamp: new Date(Date.now() - 120 * 60000), source: 'Pump 2', user: 'Operator' },
  { id: 'l8', type: 'system_event', message: 'System startup – all services initialized', timestamp: new Date(Date.now() - 480 * 60000), source: 'System', user: 'System' },
];

const INITIAL_ESP32_NODES: ESP32Node[] = [
  { id: 'esp32-01', name: 'Node Alpha', status: 'online', ipAddress: '192.168.1.101', lastSeen: new Date(), location: 'Pump Station Alpha', lat: 3.1478, lng: 101.6953, firmware: 'v2.3.1', linkedDevices: ['Valve A', 'Valve B', 'Pump 1', 'Flow Meter F1'] },
  { id: 'esp32-02', name: 'Node Beta', status: 'online', ipAddress: '192.168.1.102', lastSeen: new Date(), location: 'East Hub', lat: 3.1560, lng: 101.7100, firmware: 'v2.3.0', linkedDevices: ['Valve C', 'Pump 2', 'Flow Meter F2', 'Pressure P1'] },
  { id: 'esp32-03', name: 'Node Gamma', status: 'online', ipAddress: '192.168.1.103', lastSeen: new Date(), location: 'South Station', lat: 3.1320, lng: 101.6850, firmware: 'v2.2.8', linkedDevices: ['Valve D', 'Pump 3', 'Level Sensor C1'] },
  { id: 'esp32-04', name: 'Node Delta', status: 'offline', ipAddress: '192.168.1.104', lastSeen: new Date(Date.now() - 60 * 60000), location: 'West Monitoring', lat: 3.1400, lng: 101.6700, firmware: 'v2.2.5', linkedDevices: ['Temp Sensor T1', 'Level Sensor D1'] },
];

// Generate historical chart data (last 24 hours)
const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const hour = t.getHours().toString().padStart(2, '0');
    data.push({
      time: `${hour}:00`,
      value: 60 + Math.sin(i * 0.4) * 15 + Math.random() * 5,
      value2: 55 + Math.sin(i * 0.4 + 1) * 12 + Math.random() * 5,
    });
  }
  return data;
};

const generateFlowData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000);
    const hour = t.getHours().toString().padStart(2, '0');
    data.push({
      time: `${hour}:00`,
      value: 160 + Math.sin(i * 0.5) * 30 + Math.random() * 10,
      value2: 140 + Math.sin(i * 0.5 + 0.5) * 25 + Math.random() * 10,
    });
  }
  return data;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [reservoirs, setReservoirs] = useState<Reservoir[]>(INITIAL_RESERVOIRS);
  const [valves, setValves] = useState<Valve[]>(INITIAL_VALVES);
  const [pumps, setPumps] = useState<Pump[]>(INITIAL_PUMPS);
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [esp32Nodes] = useState<ESP32Node[]>(INITIAL_ESP32_NODES);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(generateChartData());
  const [flowChartData, setFlowChartData] = useState<ChartDataPoint[]>(generateFlowData());
  const [emergencyStopActive, setEmergencyStopActive] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const totalWaterRef = useRef(285000); // liters distributed today

  const systemStatus: SystemStatus = {
    totalWaterDistributedToday: totalWaterRef.current,
    activeAlarms: alerts.filter((a) => !a.acknowledged).length,
    connectedNodes: esp32Nodes.filter((n) => n.status === 'online').length,
    totalNodes: esp32Nodes.length,
    systemOnline: true,
    emergencyStopActive,
  };

  // Apply dark mode to html element
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  const addLog = useCallback((entry: LogEntry) => {
    setLogs((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setReservoirs((prev) =>
        prev.map((r) => {
          const delta = (r.inflowRate - r.outflowRate) / 60; // per second
          const newPct = Math.max(5, Math.min(100, r.currentLevel + delta * 0.1 + (Math.random() - 0.5) * 0.2));
          return {
            ...r,
            currentLevel: Math.round(newPct * 10) / 10,
            inflowRate: Math.max(50, r.inflowRate + (Math.random() - 0.5) * 4),
            outflowRate: Math.max(30, r.outflowRate + (Math.random() - 0.5) * 3),
            status: getStatus(newPct),
            lastUpdated: new Date(),
          };
        })
      );

      setSensors((prev) =>
        prev.map((s) => {
          if (s.status === 'offline') return s;
          const noise = (Math.random() - 0.5) * 2;
          return { ...s, value: Math.round((s.value + noise) * 10) / 10, lastUpdated: new Date() };
        })
      );

      setPumps((prev) =>
        prev.map((p) => ({
          ...p,
          powerConsumption: p.isRunning
            ? Math.round((p.powerConsumption + (Math.random() - 0.5) * 0.3) * 10) / 10
            : 0,
          flowRate: p.isRunning
            ? Math.round(p.flowRate + (Math.random() - 0.5) * 5)
            : 0,
        }))
      );

      // Update total distributed
      totalWaterRef.current += Math.floor(Math.random() * 50 + 100);
    }, 3000);

    // Update charts every 60 seconds (add new data point)
    const chartInterval = setInterval(() => {
      const now = new Date();
      const label = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setChartData((prev) => [
        ...prev.slice(1),
        { time: label, value: 60 + Math.random() * 20, value2: 55 + Math.random() * 15 },
      ]);
      setFlowChartData((prev) => [
        ...prev.slice(1),
        { time: label, value: 160 + Math.random() * 40, value2: 140 + Math.random() * 30 },
      ]);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(chartInterval);
    };
  }, []);

  const toggleValve = useCallback(
    async (valveId: 'A' | 'B' | 'C' | 'D', state: boolean) => {
      if (emergencyStopActive) {
        toast.error('Emergency stop active. Reset first.');
        return;
      }
      try {
        const result = await controlValve(valveId, state);
        if (result.success) {
          setValves((prev) =>
            prev.map((v) =>
              v.id === valveId
                ? { ...v, isOpen: state, relayStatus: state, lastUpdated: new Date() }
                : v
            )
          );
          const logEntry = createLog(
            state ? 'valve_open' : 'valve_close',
            `Valve ${valveId} ${state ? 'opened' : 'closed'}`,
            `Valve ${valveId}`
          );
          addLog(logEntry);
          toast.success(result.message);
        }
      } catch {
        toast.error(`Failed to control Valve ${valveId}`);
      }
    },
    [emergencyStopActive, addLog]
  );

  const togglePump = useCallback(
    async (pumpId: 'pump1' | 'pump2' | 'pump3', action: 'start' | 'stop') => {
      if (emergencyStopActive) {
        toast.error('Emergency stop active. Reset first.');
        return;
      }
      try {
        const result = await controlPump(pumpId, action);
        if (result.success) {
          setPumps((prev) =>
            prev.map((p) =>
              p.id === pumpId
                ? { ...p, isRunning: action === 'start', lastUpdated: new Date() }
                : p
            )
          );
          const name = pumps.find((p) => p.id === pumpId)?.name ?? pumpId;
          const logEntry = createLog(
            action === 'start' ? 'pump_start' : 'pump_stop',
            `${name} ${action}ed`,
            name
          );
          addLog(logEntry);
          toast.success(result.message);
        }
      } catch {
        toast.error(`Failed to control ${pumpId}`);
      }
    },
    [emergencyStopActive, addLog, pumps]
  );

  const triggerEmergencyStop = useCallback(async () => {
    try {
      const result = await apiEmergencyStop();
      if (result.success) {
        setValves((prev) => prev.map((v) => ({ ...v, isOpen: false, relayStatus: false, lastUpdated: new Date() })));
        setPumps((prev) => prev.map((p) => ({ ...p, isRunning: false, lastUpdated: new Date() })));
        setEmergencyStopActive(true);
        const logEntry = createLog('emergency_stop', 'EMERGENCY STOP triggered – all valves and pumps shut down', 'System');
        addLog(logEntry);
        const newAlert: Alert = {
          id: genId(),
          title: 'Emergency Stop Activated',
          message: 'All valves and pumps have been shut down.',
          severity: 'critical',
          timestamp: new Date(),
          acknowledged: false,
          source: 'System',
          location: 'All',
        };
        setAlerts((prev) => [newAlert, ...prev]);
        toast.error('EMERGENCY STOP activated. All systems halted.', { duration: 6000 });
      }
    } catch {
      toast.error('Emergency stop failed. Contact maintenance immediately.');
    }
  }, [addLog]);

  const resetEmergency = useCallback(async () => {
    try {
      const result = await apiResetEmergencyStop();
      if (result.success) {
        setEmergencyStopActive(false);
        const logEntry = createLog('system_event', 'Emergency stop reset – system ready for manual control', 'System');
        addLog(logEntry);
        toast.success('Emergency stop reset. Manual control restored.');
      }
    } catch {
      toast.error('Failed to reset emergency stop.');
    }
  }, [addLog]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    const logEntry = createLog('alarm_acknowledged', `Alert ${alertId} acknowledged`, 'Operator');
    addLog(logEntry);
  }, [addLog]);

  return (
    <AppContext.Provider
      value={{
        reservoirs,
        valves,
        pumps,
        sensors,
        alerts,
        logs,
        esp32Nodes,
        systemStatus,
        chartData,
        flowChartData,
        toggleValve,
        togglePump,
        triggerEmergencyStop,
        resetEmergency,
        acknowledgeAlert,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
