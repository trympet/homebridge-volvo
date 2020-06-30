// types are based on responses for Volvo 2020 XC60 T8 
export interface Config {
  region: string
  email: string
  password: string
}

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
  status: string;
  statusTimestamp: Date;
  startTime: Date;
  serviceType: string;
  failureReason?: any;
  service: string;
  vehicleId: string;
  customerServiceId: string;
}

export interface VehicleAttributes {
  engineCode: string;
  exteriorCode: string;
  interiorCode: string;
  tyreDimensionCode: string;
  tyreInflationPressureLightCode?: any;
  tyreInflationPressureHeavyCode?: any;
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
  status: string;
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
  status: string;
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
  distanceToHVBatteryEmpty: number;
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
  frontLeftTyrePressure: string;
  frontRightTyrePressure: string;
  rearLeftTyrePressure: string;
  rearRightTyrePressure: string;
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
  brakeFluid: string;
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
  hvBattery: HvBattery;
  odometer: number;
  odometerTimestamp: Date;
  privacyPolicyEnabled: boolean;
  privacyPolicyEnabledTimestamp: Date;
  remoteClimatizationStatus: string;
  remoteClimatizationStatusTimestamp: Date;
  serviceWarningStatus: string;
  serviceWarningStatusTimestamp: Date;
  theftAlarm: TheftAlarm;
  timeFullyAccessibleUntil: Date;
  timePartiallyAccessibleUntil: Date;
  tripMeter1: number;
  tripMeter1Timestamp: Date;
  tripMeter2: number;
  tripMeter2Timestamp: Date;
  tyrePressure: TyrePressure;
  washerFluidLevel: string;
  washerFluidLevelTimestamp: Date;
  windows: Windows;
}