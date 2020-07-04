/* eslint-disable max-len */
import { Config, VehicleAttributes, User, VolvoFeatureBindings, VolvoSensorBindings, VolvoActions, SensorNames } from "./util/types";
import { Service as IService, Characteristic as ICharacteristic, AccessoryConfig, Logger } from "homebridge";
import { HomebridgeAPI, API } from "homebridge/lib/api";
import { getConfig, cbfy, getSensorNames } from "./helpers";
import { Vehicle } from "./util/vehicle";
import { REST } from "./util/rest";

let Service: typeof IService, Characteristic: typeof ICharacteristic;

export default function (homebridge: HomebridgeAPI) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-volvo", "Volvo", VolvoPlatform);
}

class VolvoPlatform extends REST {
  private readonly config: Config;
  private readonly sensorNames: SensorNames;

  private vehicle: Vehicle;
  private vehicleCount = 0;
  private readonly _BASENAME;
  private AccessoryInformationService;

  constructor(private readonly log: Logger, accessoryConfig: AccessoryConfig, private readonly api: API) {
    super(getConfig(accessoryConfig));
    this.log = log;
    this.config = getConfig(accessoryConfig);
    this.sensorNames = getSensorNames(accessoryConfig.sensorNames);
    this._BASENAME = `${this.config.name} `;

    log.info("Starting homebridge-volvo");

    this.vehicle = this.GetVehicleSync();
    const vehicleModel = `${this.vehicle.attr.modelYear} ${this.vehicle.attr.vehicleType}`;
    log.info(
      `Got vehicle ${vehicleModel} with registration number ${this.vehicle.attr.registrationNumber}.`,
    );
    this.AccessoryInformationService = new this.api.hap.Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Manufacturer, "Volvo")
      .setCharacteristic(Characteristic.SerialNumber, this.vehicle.attr.registrationNumber)
      .setCharacteristic(Characteristic.Model, vehicleModel);
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
    const services: IService[] = [this.AccessoryInformationService];

    // Feature services

    if (this.vehicle.features[VolvoFeatureBindings.HONK_AND_BLINK]) {
      const honkBlinkService = new Service.Switch(this._BASENAME + this.sensorNames.honkAndBlink, VolvoFeatureBindings.HONK_AND_BLINK);
      honkBlinkService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.HONK_AND_BLINK)))
        .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.HONK_AND_BLINK, honkBlinkService)));
      // HONK_AND_OR_BLINK ∈ HONK_AND_BLINK
      if (this.vehicle.features[VolvoFeatureBindings.HONK_AND_OR_BLINK]) {
        const blinkService = new Service.Lightbulb(this._BASENAME + this.sensorNames.blink, VolvoFeatureBindings.HONK_AND_OR_BLINK);
        blinkService
          .getCharacteristic(Characteristic.On)
          .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.BLINK)))
          .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.BLINK, blinkService)));
        services.push(blinkService);
      }
      services.push(honkBlinkService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.REMOTE_HEATER]) {
      const heaterService = new Service.Switch(this._BASENAME + this.sensorNames.heater, VolvoFeatureBindings.REMOTE_HEATER);
      heaterService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.HEATER_STATUS)))
        .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.HEATER, heaterService)));
      services.push(heaterService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.PRECLIMATIZATION]) {
      const heaterService = new Service.Switch(this._BASENAME + this.sensorNames.preclimatization, VolvoFeatureBindings.PRECLIMATIZATION);
      heaterService
        .getCharacteristic(Characteristic.On)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.HEATER_STATUS)))
        .on("set", cbfy(this.vehicle.SetSensorValue.bind(this.vehicle, VolvoActions.PRECLIMATIZATION, heaterService)));
      services.push(heaterService);
    }

    if (this.vehicle.features[VolvoFeatureBindings.ENGINE_REMOTE_START]) {
      const engineService = new Service.Switch(this._BASENAME + this.sensorNames.engineStart, VolvoFeatureBindings.ENGINE_REMOTE_START);
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
      const lockUnlockService = new Service.LockMechanism(this._BASENAME + this.sensorNames.lock, VolvoFeatureBindings.LOCK);
      lockUnlockService
        .getCharacteristic(Characteristic.LockCurrentState)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.LOCK)));
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
      const batterySensorService = new Service.BatteryService(this._BASENAME, VolvoSensorBindings.BATTERY_PERCENT);
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
    } else {
      const fuelSensorService = new Service.BatteryService(this._BASENAME, VolvoSensorBindings.FUEL_PERCENT);
      fuelSensorService
        .getCharacteristic(Characteristic.BatteryLevel)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.FUEL_PERCENT)));
      fuelSensorService
        .getCharacteristic(Characteristic.ChargingState)
        .on("get", cbfy(async () => Characteristic.ChargingState.NOT_CHARGING)); // fuel tank will never charge, sadly :(
      fuelSensorService
        .getCharacteristic(Characteristic.StatusLowBattery)
        .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.FUEL_PERCENT_LOW)));
      services.push(fuelSensorService);
    }

    const engineRunningService = new Service.MotionSensor(this._BASENAME + this.sensorNames.movement, VolvoSensorBindings.ENGINE_STATUS);
    engineRunningService
      .getCharacteristic(Characteristic.MotionDetected)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.ENGINE_STATUS)));
    services.push(engineRunningService);

    const tailgateDoorService = new Service.ContactSensor(this._BASENAME + this.sensorNames.tailgate, VolvoSensorBindings.DOOR_TAILGATE);
    tailgateDoorService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.DOOR_TAILGATE)));
    services.push(tailgateDoorService);

    const rearRightDoorService = new Service.ContactSensor(this._BASENAME + this.sensorNames.rearRightDoor, VolvoSensorBindings.DOOR_REAR_RIGHT);
    rearRightDoorService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.DOOR_REAR_RIGHT)));
    services.push(rearRightDoorService);

    const rearLeftDoorService = new Service.ContactSensor(this._BASENAME + this.sensorNames.rearLeftDoor, VolvoSensorBindings.DOOR_REAR_LEFT);
    rearLeftDoorService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.DOOR_REAR_LEFT)));
    services.push(rearLeftDoorService);

    const frontRightDoorService = new Service.ContactSensor(this._BASENAME + this.sensorNames.frontRightDoor, VolvoSensorBindings.DOOR_FRONT_RIGHT);
    frontRightDoorService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.DOOR_FRONT_RIGHT)));
    services.push(frontRightDoorService);

    const frontLeftDoorService = new Service.ContactSensor(this._BASENAME + this.sensorNames.frontLeftDoor, VolvoSensorBindings.DOOR_FRONT_LEFT);
    frontLeftDoorService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.DOOR_FRONT_LEFT)));
    services.push(frontLeftDoorService);

    const rearRightWindowService = new Service.ContactSensor(this._BASENAME + this.sensorNames.rearRightWindow, VolvoSensorBindings.WINDOW_REAR_RIGHT);
    rearRightWindowService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.WINDOW_REAR_RIGHT)));
    services.push(rearRightWindowService);

    const rearLeftWindowService = new Service.ContactSensor(this._BASENAME + this.sensorNames.rearLeftWindow, VolvoSensorBindings.WINDOW_REAR_LEFT);
    rearLeftWindowService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.WINDOW_REAR_LEFT)));
    services.push(rearLeftWindowService);

    const frontRightWindowService = new Service.ContactSensor(this._BASENAME + this.sensorNames.frontRightWindow, VolvoSensorBindings.WINDOW_FRONT_RIGHT);
    frontRightWindowService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.WINDOW_FRONT_RIGHT)));
    services.push(frontRightWindowService);

    const frontLeftWindowService = new Service.ContactSensor(this._BASENAME + this.sensorNames.frontLeftWindow, VolvoSensorBindings.WINDOW_FRONT_LEFT);
    frontLeftWindowService
      .getCharacteristic(Characteristic.ContactSensorState)
      .on("get", cbfy(this.vehicle.GetSensorValue.bind(this.vehicle, VolvoSensorBindings.WINDOW_FRONT_LEFT)));
    services.push(frontLeftWindowService);


    /* Multipe air quality services from one accessory seems to not be supported. */

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

    if (services.length === 1) {
      this.log.error("Could not find any capabilities for your car. Something has gone wrong. Sorry man :/");
    }

    return services;
  }
}
