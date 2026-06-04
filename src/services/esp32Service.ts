// Mock ESP32 API Service
// In production, replace BASE_URL with actual ESP32 IP/domain
// and uncomment the real fetch calls

const BASE_URL = '/api'; // Replace with ESP32 IP, e.g. 'http://192.168.1.100'

export interface ESP32CommandResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// Simulated delay to mimic network latency
const simulateDelay = (ms = 150) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Mock state store
const mockState = {
  valveA: true,
  valveB: false,
  valveC: true,
  valveD: false,
  pump1: true,
  pump2: false,
  pump3: true,
  emergencyStop: false,
};

// GET /api/status - Fetch current system status from ESP32
export async function getSystemStatus(): Promise<{
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
}> {
  /* Real implementation:
  const response = await fetch(`${BASE_URL}/status`);
  return response.json();
  */
  await simulateDelay();
  return {
    waterLevel: 70 + Math.random() * 10,
    valveA: mockState.valveA,
    valveB: mockState.valveB,
    valveC: mockState.valveC,
    valveD: mockState.valveD,
    pump1: mockState.pump1,
    pump2: mockState.pump2,
    pump3: mockState.pump3,
    flowRateIn: 180 + Math.random() * 40,
    flowRateOut: 150 + Math.random() * 30,
    timestamp: new Date().toISOString(),
  };
}

// POST /api/valveA - Control valve A
export async function controlValve(
  valveId: 'A' | 'B' | 'C' | 'D',
  state: boolean
): Promise<ESP32CommandResponse> {
  /* Real implementation:
  const response = await fetch(`${BASE_URL}/valve${valveId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
  return response.json();
  */
  await simulateDelay(200);
  const key = `valve${valveId}` as keyof typeof mockState;
  mockState[key] = state as never;
  return {
    success: true,
    message: `Valve ${valveId} ${state ? 'opened' : 'closed'} successfully`,
    timestamp: new Date().toISOString(),
  };
}

// POST /api/pump - Control pump
export async function controlPump(
  pumpId: 'pump1' | 'pump2' | 'pump3',
  action: 'start' | 'stop'
): Promise<ESP32CommandResponse> {
  /* Real implementation:
  const response = await fetch(`${BASE_URL}/${pumpId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return response.json();
  */
  await simulateDelay(200);
  mockState[pumpId] = action === 'start';
  return {
    success: true,
    message: `${pumpId} ${action}ed successfully`,
    timestamp: new Date().toISOString(),
  };
}

// POST /api/emergency - Emergency stop all valves
export async function emergencyStop(): Promise<ESP32CommandResponse> {
  /* Real implementation:
  const response = await fetch(`${BASE_URL}/emergency`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'stop_all' }),
  });
  return response.json();
  */
  await simulateDelay(100);
  mockState.valveA = false;
  mockState.valveB = false;
  mockState.valveC = false;
  mockState.valveD = false;
  mockState.pump1 = false;
  mockState.pump2 = false;
  mockState.pump3 = false;
  mockState.emergencyStop = true;
  return {
    success: true,
    message: 'Emergency stop executed. All valves and pumps shut down.',
    timestamp: new Date().toISOString(),
  };
}

// Reset emergency stop
export async function resetEmergencyStop(): Promise<ESP32CommandResponse> {
  await simulateDelay(100);
  mockState.emergencyStop = false;
  return {
    success: true,
    message: 'Emergency stop reset. System ready for manual control.',
    timestamp: new Date().toISOString(),
  };
}

export const ESP32_BASE_URL = BASE_URL;
