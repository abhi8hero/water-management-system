// Core system types for Water Management System

export type WaterLevelStatus = 'normal' | 'warning' | 'critical';

export interface Reservoir {
  id: string;
  name: string;
  location: string;
  capacity: number; // liters
  currentLevel: number; // percentage 0-100
  inflowRate: number; // L/min
  outflowRate: number; // L/min
  status: WaterLevelStatus;
  lastUpdated: Date;
  lat: number;
  lng: number;
}

export type ValveId = 'A' | 'B' | 'C' | 'D';

export interface Valve {
  id: ValveId;
  name: string;
  isOpen: boolean;
  relayStatus: boolean;
  esp32Id: string;
  lastUpdated: Date;
  location: string;
}

export type PumpId = 'pump1' | 'pump2' | 'pump3';

export interface Pump {
  id: PumpId;
  name: string;
  isRunning: boolean;
  powerConsumption: number; // kW
  esp32Id: string;
  lastUpdated: Date;
  location: string;
  flowRate: number; // L/min
}

export type SensorType = 'water_level' | 'flow' | 'pressure' | 'temperature';

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  esp32Id: string;
  lastUpdated: Date;
  status: 'online' | 'offline' | 'error';
  location: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
  location: string;
}

export type LogEventType =
  | 'valve_open'
  | 'valve_close'
  | 'pump_start'
  | 'pump_stop'
  | 'emergency_stop'
  | 'alarm_triggered'
  | 'alarm_acknowledged'
  | 'device_online'
  | 'device_offline'
  | 'sensor_alert'
  | 'system_event';

export interface LogEntry {
  id: string;
  type: LogEventType;
  message: string;
  timestamp: Date;
  source: string;
  user?: string;
  metadata?: Record<string, unknown>;
}

export type ESP32Status = 'online' | 'offline' | 'reconnecting';

export interface ESP32Node {
  id: string;
  name: string;
  status: ESP32Status;
  ipAddress: string;
  lastSeen: Date;
  location: string;
  lat: number;
  lng: number;
  firmware: string;
  linkedDevices: string[];
}

export interface SystemStatus {
  totalWaterDistributedToday: number; // liters
  activeAlarms: number;
  connectedNodes: number;
  totalNodes: number;
  systemOnline: boolean;
  emergencyStopActive: boolean;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  value2?: number;
}

export interface ESP32ApiResponse {
  waterLevel: number;
  valveA: boolean;
  valveB: boolean;
  valveC: boolean;
  valveD: boolean;
  pump1: boolean;
  pump2: boolean;
  pump3: boolean;
  flowRateIn: number;
  flowRateOut: number;
  timestamp: string;
}
