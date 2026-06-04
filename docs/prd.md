# Requirements Document

## 1. Application Overview

**Application Name**: Industrial Water Management System

**Description**: A professional web-based dashboard for monitoring and controlling city water distribution infrastructure. The system integrates with ESP32 hardware devices to provide real-time monitoring of reservoirs, valves, pumps, and sensors, enabling remote control and emergency management of water distribution networks.

## 2. Users and Usage Scenarios

**Target Users**: Water utility operators, facility managers, system administrators

**Core Usage Scenarios**:
- Monitor real-time water levels across multiple reservoirs
- Remotely control valves and pumps through web interface
- Track water flow rates and distribution metrics
- Respond to system alerts and emergency situations
- View historical data and system logs
- Manage ESP32 device connections and status

## 3. Page Structure and Functionality

```
Water Management System
├── Dashboard (Main)
├── Reservoirs
├── Valves
├── Pumps
├── Sensors
├── Map View
├── Logs
├── Alerts
└── Settings
```

### 3.1 Dashboard (Main Page)

**Top Bar**:
- Display system status indicator
- Show count of connected ESP32 nodes
- Display current time
- Show user profile access

**Dashboard Cards** (5 cards displaying key metrics):
- Card 1: Reservoir Water Level (%)
- Card 2: Inflow Rate (L/min)
- Card 3: Outflow Rate (L/min)
- Card 4: Active Alarms count
- Card 5: Total Water Distributed Today

**Reservoir Monitoring Section**:
- Display animated tank level visualization
- Show water percentage value
- Apply color indication:
  - Green for Normal status
  - Yellow for Warning status
  - Red for Critical status

**Historical Charts**:
- Display water level trends
- Display flow rate trends
- Use Chart.js for visualization

**Emergency Controls**:
- Provide Emergency Shutdown button
- Execute immediate stop of all valves when activated

### 3.2 Reservoirs Page

- List all monitored reservoirs
- Display water level for each reservoir
- Show inflow and outflow rates
- Display status indicators

### 3.3 Valves Page

**Valve Control Panel** (4 valves: Valve A, Valve B, Valve C, Valve D)

For each valve:
- Provide ON/OFF toggle switch
- Display Open/Close status
- Show last updated timestamp
- Display associated ESP32 device status (Online/Offline)
- Show relay status

**Control Logic**:
- When user clicks OPEN: Send HTTP request to ESP32, ESP32 turns relay ON, relay opens valve
- When user clicks CLOSE: Send HTTP request to ESP32, ESP32 turns relay OFF, relay closes valve
- Update UI instantly upon command execution
- Display success notification after command completion

### 3.4 Pumps Page

**Pump Control Panel** (3 pumps: Pump 1, Pump 2, Pump 3)

For each pump:
- Provide Start button
- Provide Stop button
- Display running indicator
- Show power consumption value
- Display associated ESP32 device status

### 3.5 Sensors Page

**Sensor Data Table**:
- List all connected sensors (water level sensors, flow sensors)
- Display real-time sensor readings
- Show sensor status
- Display last update time
- Show associated ESP32 device

### 3.6 Map View Page

**Interactive Map**:
- Integrate OpenStreetMap
- Display ESP32 node locations with markers
- Display reservoir locations with markers
- Display pump station locations with markers
- Enable click on marker to view device details
- Show device status on map (online/offline indication)

### 3.7 Logs Page

**Event Logs Table**:
- Display system events chronologically
- Show valve operations (open/close commands)
- Show pump operations (start/stop commands)
- Display alarm events
- Show ESP32 connection/disconnection events
- Display timestamp for each event

### 3.8 Alerts Page

**Active Alerts List**:
- Display current active alarms
- Show alarm type and severity
- Display affected device/location
- Show alarm timestamp

**Alarm Notifications**:
- Display real-time alarm notifications
- Provide alarm acknowledgment function

### 3.9 Settings Page

- Configure system parameters
- Manage user profile
- Toggle between Dark and Light mode
- Configure ESP32 device connections

### 3.10 Left Sidebar Navigation

- Provide navigation links to all pages:
  - Dashboard
  - Reservoirs
  - Valves
  - Pumps
  - Sensors
  - Map View
  - Logs
  - Alerts
  - Settings

## 4. Business Rules and Logic

### 4.1 ESP32 Communication

**Communication Methods**:
- REST API
- WebSocket (for real-time data updates)

**API Endpoints**:

GET /api/status
Response format:
```
{
  \"waterLevel\": 75,
  \"valveA\": true,
  \"pump1\": false
}
```

POST /api/valveA
Request format:
```
{
  \"state\": true
}
```

### 4.2 Real-time Data Updates

- System receives real-time data from ESP32 devices
- Dashboard cards update automatically
- Sensor readings refresh continuously
- Device status updates reflect immediately

### 4.3 Device Status Monitoring

- Track ESP32 device online/offline status
- Display connection status in top bar
- Show last communication timestamp for each device

### 4.4 Emergency Shutdown Logic

- Emergency Shutdown button sends stop commands to all valves
- All valves close immediately
- System logs emergency shutdown event
- Display confirmation notification

### 4.5 Color Indication Rules

**Water Level Status**:
- Green: Normal operation (above warning threshold)
- Yellow: Warning level (approaching critical threshold)
- Red: Critical level (immediate attention required)

### 4.6 Responsive Design

- Interface adapts to different screen sizes
- Mobile responsive layout
- Touch-friendly controls for mobile devices

### 4.7 Theme Support

- Support Dark mode
- Support Light mode
- User can toggle between modes in Settings

## 5. Exceptions and Boundary Cases

| Scenario | Handling |
|----------|----------|
| ESP32 device offline | Display offline status, disable control buttons, show last known data |
| API request timeout | Display error notification, retry mechanism, log failure event |
| Invalid sensor reading | Display error indicator, log anomaly, alert operator |
| Network connection lost | Display connection lost warning, queue commands for retry |
| Emergency shutdown activated | Immediately disable all manual controls, log event, require manual reset |
| Concurrent valve operations | Process commands sequentially, display operation queue status |
| Critical water level reached | Trigger alarm notification, highlight affected reservoir in red |

## 6. Acceptance Criteria

1. User opens the dashboard and views real-time water level, inflow rate, outflow rate, active alarms count, and total water distributed today on dashboard cards
2. User navigates to Valves page, clicks OPEN button on Valve A, system sends HTTP request to ESP32, valve opens, UI updates to show Open status with timestamp
3. User navigates to Map View page, clicks on a reservoir marker, system displays reservoir details including water level and status
4. User clicks Emergency Shutdown button, system immediately closes all valves and displays confirmation notification
5. User navigates to Logs page and views chronological list of all valve operations, pump operations, and alarm events with timestamps

## 7. Features Not Included in This Release

- User authentication and authorization system
- Multi-user role management
- Data export functionality
- Automated scheduling for valve/pump operations
- Predictive maintenance alerts
- Integration with external weather data services
- SMS/email notification system
- Mobile native application
- Advanced analytics and reporting module
- Historical data archiving beyond current session
- Multi-language support
- Audit trail for configuration changes