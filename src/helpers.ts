/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { AccessoryConfig } from "homebridge";
import * as dotenv from "dotenv";
import { Config } from "./util/types";


export function getConfig(config: AccessoryConfig): Config {
  // load config
  if (config && config["email"] && config["password"] && config["region"] !== undefined) {
    return {
      email: config.email,
      password: config.password,
      region: config.region,
      VIN: config.VIN,
    };
  } else if (process.env["VOC_EMAIL"] && process.env["VOC_PASSWORD"]) {
    dotenv.config();
    return {
      email: process.env.VOC_EMAIL,
      password: process.env.VOC_PASSWORD,
      region: process.env.VOC_REGION || "",
      VIN: process.env.VIN,
    };
  }
  throw new Error("No valid config provided.");
}

export function wait(seconds: number): Promise<void> {
  return new Promise(r => setTimeout(r, seconds * 1000));
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
