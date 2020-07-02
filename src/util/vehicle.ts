import {
  VehicleAttributes,
  VehicleState,
  Config,
  VolvoFeatureBindings,
  VolvoSensorBindings,
  VolvoActions,
  HonkBlinkBody,
} from "./types";
import { VehicleApi } from "./vehicleApi";
import { Characteristic as ICharacteristic, CharacteristicValue, Logger, Service } from "homebridge";

export class Vehicle extends VehicleApi {
  private state: VehicleState;
  public readonly features: Record<string, boolean> = {};
  private lockTargetState: CharacteristicValue;

  constructor(
    config: Config,
    public url: string,
    private readonly Characteristic: typeof ICharacteristic,
    private readonly log: Logger,
    public readonly attr: VehicleAttributes,
    state: VehicleState
  ) {
    super(config, url);

    // Add default values to honk and blink state
    state["honkBlinkActive"] = false;
    state["blinkActive"] = false;
    this.lockTargetState = state[VolvoSensorBindings.LOCK]
      ? this.Characteristic.LockTargetState.SECURED
      : this.Characteristic.LockTargetState.UNSECURED;
    this.state = state;

    // Set features
    this.features[VolvoFeatureBindings.LOCATOR] = this.attr.carLocatorSupported;
    this.features[VolvoFeatureBindings.HONK_AND_OR_BLINK] =
      this.attr.honkAndBlinkSupported &&
      this.attr.honkAndBlinkVersionsSupported.includes(VolvoFeatureBindings.HONK_AND_OR_BLINK);
    this.features[VolvoFeatureBindings.HONK_AND_BLINK] =
      this.attr.honkAndBlinkSupported &&
      this.attr.honkAndBlinkVersionsSupported.includes(VolvoFeatureBindings.HONK_AND_BLINK);
    this.features[VolvoFeatureBindings.REMOTE_HEATER] = this.attr.remoteHeaterSupported;
    this.features[VolvoFeatureBindings.UNLOCK] = this.attr.unlockSupported;
    this.features[VolvoFeatureBindings.LOCK] = this.attr.lockSupported;
    this.features[VolvoFeatureBindings.PRECLIMATIZATION] = this.attr.preclimatizationSupported;
    this.features[VolvoFeatureBindings.ENGINE_REMOTE_START] = this.attr.engineStartSupported;
    this.features[VolvoFeatureBindings.BATTERY] = this.attr.highVoltageBatterySupported;

    // update every 30 seconds
    setTimeout(() => this.Update(), 30 * 1000);
  }

  public async GetSensorValue(sensor: VolvoSensorBindings): Promise<CharacteristicValue> {
    this.log.debug(`GET ${sensor}`);
    let value: CharacteristicValue;
    switch (sensor) {
      case VolvoSensorBindings.ENGINE_REMOTE_START_STATUS:
        value =
          this.state[VolvoSensorBindings.GROUP_ENGINE_REMOTE_START][VolvoSensorBindings.ENGINE_REMOTE_START_STATUS] ===
          "on"
            ? true
            : false;
        break;

      case VolvoSensorBindings.HEATER_STATUS:
        value = this.state[VolvoSensorBindings.GROUP_HEATER][VolvoSensorBindings.HEATER_STATUS] === "on" ? true : false;
        break;

      case VolvoSensorBindings.BATTERY_CHARGE_STATUS:
        debugger;
        value =
          this.state[VolvoSensorBindings.GROUP_BATTERY][sensor] === "Started"
            ? this.Characteristic.ChargingState.CHARGING
            : this.Characteristic.ChargingState.NOT_CHARGING;
        break;

      case VolvoSensorBindings.BATTERY_PERCENT:
        debugger;
        value = this.state[VolvoSensorBindings.GROUP_BATTERY][sensor];
        break;

      case VolvoSensorBindings.BATTERY_PERCENT_LOW:
        debugger;
        value =
          this.state[VolvoSensorBindings.GROUP_BATTERY].hvBatteryLevel < 20
            ? this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        break;

      case VolvoSensorBindings.FUEL_PERCENT_LOW:
        value =
          this.state.fuelAmountLevel < 20
            ? this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        break;

      case (VolvoSensorBindings.TYRE_FRONT_LEFT ||
        VolvoSensorBindings.TYRE_FRONT_RIGHT ||
        VolvoSensorBindings.TYRE_REAR_LEFT ||
        VolvoSensorBindings.TYRE_REAR_RIGHT):
        value =
          this.state[VolvoSensorBindings.GROUP_TYRE][sensor] === "Normal"
            ? this.Characteristic.AirQuality.GOOD
            : this.Characteristic.AirQuality.POOR;
        break;

      case VolvoSensorBindings.HONK_AND_BLINK:
        value = this.state[sensor] ? true : false;
        break;

      case VolvoSensorBindings.BLINK:
        value = this.state[sensor] ? true : false;
        break;

      case VolvoSensorBindings.ENGINE_STATUS:
        value = this.state[sensor]
          ? this.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
          : this.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
        break;

      case VolvoSensorBindings.LOCK:
        value = this.state[sensor]
          ? this.Characteristic.LockCurrentState.SECURED
          : this.Characteristic.LockCurrentState.UNSECURED;
        break;

      default:
        value = this.state[sensor];
        break;
    }
    return value;
  }

  public async GetSensorTargetValue(sensor: VolvoSensorBindings.LOCK): Promise<CharacteristicValue> {
    if (sensor === VolvoSensorBindings.LOCK) {
      return this.lockTargetState;
    }
    throw new Error("Wow, this is all your fault. Good job. Never tought I'd see the day...");
  }

  public async SetSensorValue(
    sensor: VolvoActions,
    service: Service,
    value: CharacteristicValue,
  ): Promise<void | false> {
    let success: boolean;

    switch (sensor) {
      case VolvoActions.ONLY_LOCK:
        if (value === this.Characteristic.LockTargetState.UNSECURED) {
          return false;
        }
        this.lockTargetState = value;
        success = await this.Lock();
        if (success) {
          service.updateCharacteristic(this.Characteristic.LockCurrentState, value);
        }
        break;

      case VolvoActions.ONLY_UNLOCK:
        if (value === this.Characteristic.LockTargetState.SECURED) {
          return false;
        }
        this.lockTargetState = value;
        success = await this.Unlock();
        if (success) {
          service.updateCharacteristic(this.Characteristic.LockCurrentState, value);
        }
        break;

      case VolvoActions.LOCK_UNLOCK:
        this.lockTargetState = value;
        if (value === this.Characteristic.LockTargetState.SECURED) {
          success = await this.Lock();
        } else {
          success = await this.Unlock();
        }
        if (success) {
          service.updateCharacteristic(this.Characteristic.LockCurrentState, value);
        }
        break;

      case VolvoActions.HONK_AND_BLINK:
        if (value === false) {
          // Can't turn off again
          return false;
        } else {
          await this.HonkAndBlink();
          // Set status to off after 10 seconds
          setTimeout(() => service.updateCharacteristic(this.Characteristic.On, false), 10000);
        }
        break;

      case VolvoActions.BLINK:
        if (value === false) {
          // Can't turn off again
          return false;
        } else {
          await this.Blink();
          // Set status to off after 10 seconds
          setTimeout(() => service.updateCharacteristic(this.Characteristic.On, false), 10000);
        }
        break;

      case VolvoActions.HEATER:
        if (value) {
          success = await this.StartHeater();
        } else {
          success = await this.StopHeater();
        }

        if (success) {
          service.updateCharacteristic(this.Characteristic.On, value);
        }
        break;

      case VolvoActions.PRECLIMATIZATION:
        if (value) {
          success = await this.StartPreclimatization();
        } else {
          success = await this.StopPreclimatization();
        }

        if (success) {
          service.updateCharacteristic(this.Characteristic.On, value);
        }
        break;

      case VolvoActions.ENGINE_REMOTE_START:
        if (value) {
          success = await this.StartEngine();
        } else {
          success = await this.StopEngine();
        }

        if (success) {
          service.updateCharacteristic(this.Characteristic.On, value);
        }
        break;

      default:
        return false;
        break;
    }

    const x = setTimeout(() => this.Update(), 20 * 1000); // Update 20 seconds after value change
  }

  /**
   * Refreshes state from VOC API. Note that the state may be delayed by quite a bit.
   */
  private async Update(): Promise<void> {
    this.log.debug("Updating...");
    this.state = await this.GetUpdate();
  }

  private async Lock() {
    return await this.Call("lock");
  }

  private async Unlock() {
    return await this.Call("unlock");
  }

  private async StartEngine() {
    return await this.Call("engine/start", { runtime: 15 });
  }

  private async StopEngine() {
    return await this.Call("engine/stop");
  }

  private async GetHonkBlinkBody(): Promise<HonkBlinkBody> {
    const position = await this.GetVehiclePosition();
    return {
      clientAccuracy: 0,
      clientLatitude: position.position.latitude,
      clientLongitude: position.position.longitude,
    };
  }

  private async HonkAndBlink() {
    await this.Call("honk_blink/both", await this.GetHonkBlinkBody());
  }

  private async Blink() {
    await this.Call("honk_blink/blink", await this.GetHonkBlinkBody());
  }

  /**
   * Starts heater
   */
  private async StartHeater(): Promise<boolean> {
    return await this.Call("heater/start");
  }

  private async StopHeater(): Promise<boolean> {
    return await this.Call("heater/stop");
  }

  private async StartPreclimatization() {
    return await this.Call("preclimatization/start");
  }

  private async StopPreclimatization() {
    return await this.Call("preclimatization/stop");
  }
}
