/* Types are based on responses for Volvo 2020 XC60 T8 */
export interface Config {
  name: string;
  region: string;
  email: string;
  password: string;
  // Optional values
  VIN?: string;
  updateInterval: number; // seconds
  engineStartDuration: number; // minutes
  batteryLowThreshold: number; // percentage
  enabledFeatures?: EnabledFeatures;  
}

export interface EnabledFeatures {
  "carLocatorSupported": boolean,
  "honkAndOrBlink": boolean,
  "honkAndBlink": boolean,
  "remoteHeaterSupported": boolean,
  "unlockSupported": boolean,
  "lockSupported": boolean,
  "preclimatizationSupported": boolean,
  "engineStartSupported": boolean,
  "highVoltageBatterySupported": boolean,
}

export type FluidLevelStatus = "Normal" | "Low" | "VeryLow"; 
export type TyrePressureStatus = "Normal" | "LowSoft";


/* RESPONSE FROM https://vocapi.wirelesscar.net/customerapi/rest/v3.0/customeraccounts */
export interface User {
  username: string;
  firstName: string;
  lastName: string;
  accountId: string;
  account: string;
  accountVehicleRelations: string[];
}

/* RESPONSE FROM https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/CALL_METHOD */
export interface CallState {
  status?: "MessageDelivered" | "Successful" | "Started" | "Queued" | "Failed";
  statusTimestamp: Date;
  startTime: Date;
  serviceType: string;
  failureReason?: any;
  service: string;
  vehicleId: string;
  customerServiceId: string;
}

/* RESPONSE FROM https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/position */
export interface PositionResponse {
  position: Position;
  calculatedPosition: CalculatedPosition;
}

export interface Position {
  longitude: number;
  latitude: number;
  timestamp: Date;
  speed?: any;
  heading?: any;
}

export interface CalculatedPosition {
  longitude?: any;
  latitude?: any;
  timestamp?: any;
  speed?: any;
  heading?: any;
}

export interface VehicleAttributes {
  engineCode: string;
  exteriorCode: string;
  interiorCode: string;
  DimensionCode: string;
  InflationPressureLightCode?: any;
  InflationPressureHeavyCode?: any;
  gearboxCode: string;
  fuelType: string;
  fuelTankVolume: number;
  grossWeight: number;
  modelYear: number;
  vehicleType: string;
  vehicleTypeCode: string;
  numberOfDoors: number;
  country: string;
  registrationNumber: string;
  carLocatorDistance: number;
  honkAndBlinkDistance: number;
  bCallAssistanceNumber: string;
  carLocatorSupported: boolean;
  honkAndBlinkSupported: boolean;
  honkAndBlinkVersionsSupported: string[];
  remoteHeaterSupported: boolean;
  unlockSupported: boolean;
  lockSupported: boolean;
  journalLogSupported: boolean;
  assistanceCallSupported: boolean;
  unlockTimeFrame: number;
  verificationTimeFrame: number;
  timeFullyAccessible: number;
  timePartiallyAccessible: number;
  subscriptionType: string;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  serverVersion: string;
  VIN: string;
  journalLogEnabled: boolean;
  highVoltageBatterySupported: boolean;
  maxActiveDelayChargingLocations: number;
  preclimatizationSupported: boolean;
  sendPOIToVehicleVersionsSupported: string[];
  climatizationCalendarVersionsSupported: string[];
  climatizationCalendarMaxTimers: number;
  vehiclePlatform: string;
  vin: string;
  overrideDelayChargingSupported: boolean;
  engineStartSupported: boolean;
  heater: any;
}

/* RESPONSE FROM https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/status */
export interface ERS {
  status: "off" | "on";
  timestamp: Date;
  engineStartWarning: string;
  engineStartWarningTimestamp: Date;
}
export interface Doors {
  tailgateOpen: boolean;
  rearRightDoorOpen: boolean;
  rearLeftDoorOpen: boolean;
  frontRightDoorOpen: boolean;
  frontLeftDoorOpen: boolean;
  hoodOpen: boolean;
  timestamp: Date;
}
export interface SeatSelection {
  frontDriverSide: boolean;
  frontPassengerSide: boolean;
  rearDriverSide: boolean;
  rearPassengerSide: boolean;
  rearMid: boolean;
}
export interface Timer {
  time?: any;
  state?: any;
}
export interface Heater {
  seatSelection: SeatSelection;
  status: "off" | "on";
  timer1: Timer;
  timer2: Timer;
  timestamp: Date;
}
export interface HvBattery {
  hvBatteryChargeStatusDerived: string;
  hvBatteryChargeStatusDerivedTimestamp: Date;
  hvBatteryChargeModeStatus?: any;
  hvBatteryChargeModeStatusTimestamp?: any;
  hvBatteryChargeStatus: string;
  hvBatteryChargeStatusTimestamp: Date;
  hvBatteryLevel: number;
  hvBatteryLevelTimestamp: Date;
  distanceToHVBatteryEmpty: number | null;
  distanceToHVBatteryEmptyTimestamp: Date;
  hvBatteryChargeWarning: string;
  hvBatteryChargeWarningTimestamp: Date;
  timeToHVBatteryFullyCharged: number;
  timeToHVBatteryFullyChargedTimestamp: Date;
}
export interface TheftAlarm {
  longitude: number;
  latitude: number;
  timestamp: Date;
}
export interface TyrePressure {
  frontLeftTyrePressure: TyrePressureStatus;
  frontRightTyrePressure: TyrePressureStatus;
  rearLeftTyrePressure: TyrePressureStatus;
  rearRightTyrePressure: TyrePressureStatus;
  timestamp: Date;
}
export interface Windows {
  frontLeftWindowOpen: boolean;
  frontRightWindowOpen: boolean;
  timestamp: Date;
  rearLeftWindowOpen: boolean;
  rearRightWindowOpen: boolean;
}
export interface VehicleState {
  ERS: ERS;
  averageFuelConsumption: number;
  averageFuelConsumptionTimestamp: Date;
  averageSpeed: number;
  averageSpeedTimestamp: Date;
  brakeFluid: FluidLevelStatus;
  brakeFluidTimestamp: Date;
  bulbFailures: any[];
  bulbFailuresTimestamp: Date;
  carLocked: boolean;
  carLockedTimestamp: Date;
  connectionStatus: string;
  connectionStatusTimestamp: Date;
  distanceToEmpty: number;
  distanceToEmptyTimestamp: Date;
  doors: Doors;
  engineRunning: boolean;
  engineRunningTimestamp: Date;
  fuelAmount: number;
  fuelAmountLevel: number;
  fuelAmountLevelTimestamp: Date;
  fuelAmountTimestamp: Date;
  heater: Heater;
  hvBattery: HvBattery | null;
  odometer: number;
  odometerTimestamp: Date;
  privacyPolicyEnabled: boolean;
  privacyPolicyEnabledTimestamp: Date;
  remoteClimatizationStatus: string;
  remoteClimatizationStatusTimestamp: Date;
  serviceWarningStatus: string;
  serviceWarningStatusTimestamp: Date;
  theftAlarm: TheftAlarm | null;
  timeFullyAccessibleUntil: Date;
  timePartiallyAccessibleUntil: Date;
  tripMeter1: number;
  tripMeter1Timestamp: Date;
  tripMeter2: number;
  tripMeter2Timestamp: Date;
  tyrePressure: TyrePressureStatus;
  washerFluidLevel: FluidLevelStatus;
  washerFluidLevelTimestamp: Date;
  windows: Windows;
  honkBlinkActive: boolean | undefined; // Set in vehicle constructor
  blinkActive: boolean | undefined; // set in vehicle constructor
}

export interface HonkBlinkBody extends Record<string, unknown> {
  clientLatitude: number;
  clientLongitude: number;
  clientAccuracy: 0;
}

export enum VolvoFeatureBindings {
  LOCATOR = "carLocatorSupported",
  HONK_AND_OR_BLINK = "honkAndOrBlink",
  HONK_AND_BLINK = "honkAndBlink",
  REMOTE_HEATER = "remoteHeaterSupported",
  UNLOCK = "unlockSupported",
  LOCK = "lockSupported",
  PRECLIMATIZATION = "preclimatizationSupported",
  ENGINE_REMOTE_START = "engineStartSupported",
  BATTERY = "highVoltageBatterySupported",
}

export enum VolvoSensorBindings {
  // List of groups
  GROUP_ENGINE_REMOTE_START = "ERS",
  GROUP_HEATER = "heater",
  GROUP_BATTERY = "hvBattery",
  GROUP_TYRE = "tyrePressure",
  // GROUP_DOORS = "doors",
  // GROUP_WINDOWS = "windows",

  // sensor keys
  LOCK = "carLocked", // only allows locked -> unlocked
  ENGINE_REMOTE_START_STATUS = "status",
  ENGINE_STATUS = "engineRunning",
  FUEL_PERCENT = "fuelAmountLevel",
  FUEL_PERCENT_LOW = "fuelAmountLevelLow",
  HEATER_STATUS = "status",
  BATTERY_PERCENT = "hvBatteryLevel",
  BATTERY_CHARGE_STATUS = "hvBatteryChargeStatus",
  BATTERY_PERCENT_LOW = "hvBatteryLevelLow",
  TYRE_REAR_RIGHT = "rearRightTyrePressure",
  TYRE_REAR_LEFT = "rearLeftTyrePressure",
  TYRE_FRONT_RIGHT = "frontRightTyrePressure",
  TYRE_FRONT_LEFT = "frontLeftTyrePressure",
  HONK_AND_BLINK = "honkBlinkActive",
  BLINK = "blinkActive",
}
/**
 * Binding between calls to the VOC api and user actions
 */
export enum VolvoActions {
  ONLY_LOCK, // only allows locked -> unlocked
  ONLY_UNLOCK, // only allows unlocked -> locked
  LOCK_UNLOCK, // allows locked <-> unlockedv
  HEATER,
  PRECLIMATIZATION,
  HONK_AND_BLINK,
  BLINK,
  ENGINE_REMOTE_START,
}

// DONE:
// Battery sensor
// engine running sensor
// Lock
// honk and blink
// blink
// heater
// ERS
// fuel level
