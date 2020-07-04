import { Config, VehicleAttributes, User, VolvoFeatureBindings, VolvoSensorBindings, VolvoActions } from "./util/types";
import { Service as IService, Characteristic as ICharacteristic, AccessoryConfig, Logger } from "homebridge";
import { HomebridgeAPI, API } from "homebridge/lib/api";
import { getConfig, cbfy } from "./helpers";
import { Vehicle } from "./util/vehicle";
import { REST } from "./util/rest";

let Service: typeof IService, Characteristic: typeof ICharacteristic;

export default function (homebridge: HomebridgeAPI) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-volvo", "Volvo", VolvoPlatform);
}

class VolvoPlatform extends REST {
  private readonly log: Logger;
  private readonly config: Config;
  private readonly api: API;

  private vehicle: Vehicle;
  private vehicleCount = 0;
  private readonly _BASENAME;

  constructor(log: Logger, config: AccessoryConfig, homebridgeApi: API) {
    super(getConfig(config));

    this.log = log;
    this.config = getConfig(config);
    this._BASENAME = `${this.config.name} Vehicle `;
    this.api = homebridgeApi;

    log.info("Starting homebridge-volvo");

    this.vehicle = this.GetVehicleSync();

    log.info(
      `Got vehicle ${this.vehicle.attr.modelYear} ${this.vehicle.attr.vehicleType} with` +
        ` registration number ${this.vehicle.attr.registrationNumber}.`,
    );
  }

  private async GetVehicle(): Promise<Vehicle> {
    // Get vehicles associated with user
    const user: User = await this.Get("customeraccounts");
    this.vehicleCount = user.accountVehicleRelations.length;
    this.log.debug(`Got account for ${user["username"]}`);
    // Get data and instantiate vehicle class for vehicle
    for (let i = 0; i < this.vehicleCount; i++) {
      const vehicle = user.accountVehicleRelations[i];
      const rel = await this.Get("", vehicle);
      if (rel["status"] === "Verified") {
        const url = rel["vehicle"] + "/";
        const attr: Promise<VehicleAttributes> = this.Get("attributes", url);
        if ((await attr).VIN === this.config.VIN) {
          const state = this.Get("status", url);
          return new Vehicle(this.config, url, Characteristic, this.log, await attr, await state);
        }
      }
    }
    throw new Error(`No vehicles found matching the VIN number you provided (${this.config.VIN}).`);
  }

  public GetVehicleSync(): Vehicle {
    // Get vehicles associated with user
    const user: User = this.GetSync("customeraccounts");
    this.vehicleCount = user.accountVehicleRelations.length;
    this.log.debug(`Got account for ${user["username"]}`);
    // Get data and instantiate vehicle class for each vehicle
    for (let i = 0; i < this.vehicleCount; i++) {
      const vehicle = user.accountVehicleRelations[i];
      const rel = this.GetSync("", vehicle);
      if (rel["status"] === "Verified") {
        const url = rel["vehicle"] + "/";
        const attr: VehicleAttributes = this.GetSync("attributes", url);
        if (attr.VIN === this.config.VIN || !this.config.VIN) {
          const state = this.GetSync("status", url);
          return new Vehicle(this.config, url, Characteristic, this.log, attr, state);
        }
      }
    }
    throw new Error(`No vehicles found matching the VIN number you provided (${this.config.VIN}).`);
  }

  public getServices() {
    const services: IService[] = [];

    // Feature services

    if (this.vehicle.features[VolvoFeatureBindings.HONK_AND_BLINK]) {
      const honkBlinkService = new Service.Switch(this._BASENAME + "Horn", "horn");
      honkBlinkService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.HONK_AND_BLINK)))
        .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.HONK_AND_BLINK, honkBlinkService)));
      // HONK_AND_OR_BLINK ∈ HONK_AND_BLINK
      if (this.vehicle.features[VolvoFeatureBindings.HONK_AND_OR_BLINK]) {
        const blinkService = new Service.Lightbulb(this._BASENAME + "Light", "light");
        blinkService
          .getCharacteristic(Characteristic.On)
          .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.BLINK)))
          .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.BLINK, blinkService)));
        services.push(blinkService);
      }
      services.push(honkBlinkService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.REMOTE_HEATER]) {
      const heaterService = new Service.Switch(this._BASENAME + "climate", "remoteHeater");
      heaterService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.HEATER_STATUS)))
        .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.HEATER, heaterService)));
      services.push(heaterService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.PRECLIMATIZATION]) {
      const heaterService = new Service.Switch(this._BASENAME + "climate", "preclimatizationHeater");
      heaterService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.HEATER_STATUS)))
        .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.HEATER, heaterService)));
      services.push(heaterService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.ENGINE_REMOTE_START]) {
      const engineService = new Service.Switch(this._BASENAME + "Engine", "engineRemoteStart");
      engineService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.ENGINE_REMOTE_START_STATUS)))
        .on(
          "set",
          cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.ENGINE_REMOTE_START, engineService)),
        );
      services.push(engineService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.LOCK] || this.vehicle.features[VolvoFeatureBindings.UNLOCK]) {
      const lockUnlockService = new Service.LockMechanism(this._BASENAME + "Lock", "lock");
      lockUnlockService
        .getCharacteristic(Characteristic.LockCurrentState)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.LOCK)));
      lockUnlockService.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED); // Prevents "Locking...."
      lockUnlockService
        .getCharacteristic(Characteristic.LockTargetState)
        .on("get", cbfy(this.vehicle.GetSensorTargetValue.bind(this.vehicle, VolvoSensorBindings.LOCK)));
      if (this.vehicle.features[VolvoFeatureBindings.LOCK] && this.vehicle.features[VolvoFeatureBindings.UNLOCK]) {
        lockUnlockService
          .getCharacteristic(Characteristic.LockTargetState)
          .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.LOCK_UNLOCK, lockUnlockService)));
      } else if (this.vehicle.features[VolvoFeatureBindings.LOCK]) {
        lockUnlockService
          .getCharacteristic(Characteristic.LockTargetState)
          .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.ONLY_LOCK, lockUnlockService)));
      } else {
        lockUnlockService
          .getCharacteristic(Characteristic.LockTargetState)
          .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.ONLY_UNLOCK, lockUnlockService)));
      }
      services.push(lockUnlockService);
    }

    // Sensor services

    if (this.vehicle.features[VolvoFeatureBindings.BATTERY]) {
      const batterySensorService = new Service.BatteryService(this._BASENAME + "Battery", "battery");
      batterySensorService
        .getCharacteristic(Characteristic.BatteryLevel)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.BATTERY_PERCENT)));
      batterySensorService
        .getCharacteristic(Characteristic.StatusLowBattery)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.BATTERY_PERCENT_LOW)));
      batterySensorService
        .getCharacteristic(Characteristic.ChargingState)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.BATTERY_CHARGE_STATUS)));
      services.push(batterySensorService);
    }

    const engineRunningService = new Service.OccupancySensor(this._BASENAME + "Engine Running", "engine");
    engineRunningService
      .getCharacteristic(Characteristic.OccupancyDetected)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.ENGINE_STATUS)));
    services.push(engineRunningService);

    /* One single accessory only supports one battery level sensor and one air quality sensor
     * Todo: allow for toggle between battery sensor and fuel sensor in config.json
     *       OR use platform instead of accessory
     */

    // const fuelSensorService = new Service.BatteryService(this._BASENAME + "Fuel", "fuel");
    // fuelSensorService
    //   .getCharacteristic(Characteristic.BatteryLevel)
    //   .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.FUEL_PERCENT)));
    // fuelSensorService
    //   .getCharacteristic(Characteristic.ChargingState)
    //   .on("get", async () => Characteristic.ChargingState.NOT_CHARGING); // fuel tank will never charge, sadly :(
    // fuelSensorService
    //   .getCharacteristic(Characteristic.StatusLowBattery)
    //   .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.FUEL_PERCENT_LOW)));
    // services.push(fuelSensorService);

    // const frontLeftTyreService = new Service.AirQualitySensor(this._BASENAME + "Front Left", "front-left");
    // frontLeftTyreService
    //   .getCharacteristic(Characteristic.AirQuality)
    //   .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.TYRE_FRONT_LEFT)));
    // services.push(frontLeftTyreService);

    // const frontRightTyreService = new Service.AirQualitySensor(this._BASENAME + "Front Right", "front-right");
    // frontRightTyreService
    //   .getCharacteristic(Characteristic.AirQuality)
    //   .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.TYRE_FRONT_RIGHT)));
    // services.push(frontRightTyreService);

    // const rearLeftTyreService = new Service.AirQualitySensor(this._BASENAME + "Rear Left", "rear-left");
    // rearLeftTyreService
    //   .getCharacteristic(Characteristic.AirQuality)
    //   .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.TYRE_REAR_LEFT)));
    // services.push(rearLeftTyreService);

    // const rearRightTyreService = new Service.AirQualitySensor(this._BASENAME + "Rear Right", "rear-right");
    // rearRightTyreService
    //   .getCharacteristic(Characteristic.AirQuality)
    //   .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.TYRE_REAR_RIGHT)));
    // services.push(rearRightTyreService);

    if (services.length === 0) {
      this.log.error("Could not find any capabilities for your car. Something has gone wrong. Sorry man :/");
    }

    return services;
  }
}
