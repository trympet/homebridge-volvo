/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { AccessoryConfig } from "homebridge";
import { Config, SensorNames } from "./util/types";
const DEFAULT_INTERVAL = 15;
const DEFAULT_START_DURATION = 15;
const DEFAULT_BATTERY_THRESHOLD = 20;
/**
 * Get vehicle config
 * @param accessoryConfig - Config from homebridge API 
 */
export const getConfig = ({
  name,
  email,
  password,
  region,
  VIN = undefined,
  updateInterval = DEFAULT_INTERVAL,
  engineStartDuration = DEFAULT_START_DURATION,
  batteryLowThreshold = DEFAULT_BATTERY_THRESHOLD,
}: AccessoryConfig): Config => {
  // Ensure no illegal values.
  updateInterval > 5 
    ? updateInterval
    : DEFAULT_INTERVAL;
  1 <= engineStartDuration && engineStartDuration <= 15
    ? engineStartDuration
    : DEFAULT_START_DURATION;
  1 <= batteryLowThreshold && batteryLowThreshold <=99
    ? batteryLowThreshold
    : DEFAULT_BATTERY_THRESHOLD;
  return {
    name,
    email,
    password,
    region,
    VIN,
    updateInterval,
    engineStartDuration,
    batteryLowThreshold,
  };
};

export function getSensorNames({
  honkAndBlink = "Horn",
  blink = "Lights",
  heater = "Heater",
  preclimatization = "Climate",
  engineStart = "Engine",
  lock = "Lock",
  movement = "Movement",
  tailgate = "Tailgate Door",
  rearRightDoor = "Rear Right Door",
  rearLeftDoor = "Rear Left Door",
  frontRightDoor = "Front Right Door",
  frontLeftDoor = "Front Left Door",
  rearRightWindow = "Rear Right Window",
  rearLeftWindow = "Rear Left Window",
  frontRightWindow = "Front Right Window",
  frontLeftWindow = "Front Left Window",
}: Partial<SensorNames>): SensorNames {
  return {
    honkAndBlink,
    blink,
    heater,
    preclimatization,
    engineStart,
    lock,
    movement,
    tailgate,
    rearRightDoor,
    rearLeftDoor,
    frontRightDoor,
    frontLeftDoor,
    rearRightWindow,
    rearLeftWindow,
    frontRightWindow,
    frontLeftWindow,
  };
}

export function wait(seconds: number): Promise<void> {
  return new Promise((r) => setTimeout(r, seconds * 1000));
}

/**
 * Callbackfiy. Transforms a promise based function to a callback based one.
 */
export function cbfy(func: (...args: any[]) => Promise<any>) {
  return (...args: any[]) => {
    const onlyArgs: any[] = [];
    let maybeCallback: Function | null = null;

    for (const arg of args) {
      if (typeof arg === "function") {
        maybeCallback = arg;
        break;
      }

      onlyArgs.push(arg);
    }

    if (!maybeCallback) {
      throw new Error("Missing callback parameter!");
    }

    const callback = maybeCallback;

    func(...onlyArgs)
      .then((data: any) => callback(null, data))
      .catch((err: any) => callback(err));
  };
}
