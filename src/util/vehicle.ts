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
import { wait } from "../helpers";

export class Vehicle extends VehicleApi {
  private state: VehicleState;
  public readonly features: Record<string, boolean> = {};
  private lockTargetState: CharacteristicValue;
  private bootUnlock = false;

  constructor(
    private config: Config,
    public url: string,
    private readonly Characteristic: typeof ICharacteristic,
    private readonly log: Logger,
    public readonly attr: VehicleAttributes,
    state: VehicleState,
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

    const getFeatures = (): string => Object.keys(this.features).filter(k => this.features[k]).join("\n\t");

    this.log.info(`Features available:\n\t${getFeatures()}`);

    if (this.config.enabledFeatures) {
      for (const feature in this.config.enabledFeatures) {
        if (Object.prototype.hasOwnProperty.call(this.config, feature) && !this.config.enabledFeatures[feature]) {
          // User has disabled the feature, so we disable it as well.
          this.features[feature] = false;
        }
      }
    }

    this.log.info(`Features enabled:\n\t${getFeatures()}`);

    // Update periodically.
    setInterval(this.Update.bind(this), this.config.updateInterval * 1000);
  }

  /**
   * Get characteristic values for correspondig sensors.
   * @param sensor
   */
  public async GetSensorValue(sensor: VolvoSensorBindings): Promise<CharacteristicValue> {
    this.log.debug(`GET ${sensor}`);
    let value: CharacteristicValue;
    switch (sensor) {
      case VolvoSensorBindings.ENGINE_REMOTE_START_STATUS:
        this.log.debug(
          this.state[VolvoSensorBindings.GROUP_ENGINE_REMOTE_START][VolvoSensorBindings.ENGINE_REMOTE_START_STATUS],
        );
        value =
          this.state[VolvoSensorBindings.GROUP_ENGINE_REMOTE_START][VolvoSensorBindings.ENGINE_REMOTE_START_STATUS] !==
          "off"
            ? true
            : false;
        break;

      case VolvoSensorBindings.HEATER_STATUS:
        value = this.state[VolvoSensorBindings.GROUP_HEATER][VolvoSensorBindings.HEATER_STATUS] !== "off" ? true : false;
        break;

      case VolvoSensorBindings.BATTERY_CHARGE_STATUS:
        value =
          this.state[VolvoSensorBindings.GROUP_BATTERY]![sensor] === "Started"
            ? this.Characteristic.ChargingState.CHARGING
            : this.Characteristic.ChargingState.NOT_CHARGING;
        break;

      case VolvoSensorBindings.BATTERY_PERCENT:
        value = this.state[VolvoSensorBindings.GROUP_BATTERY]![sensor];
        break;

      case VolvoSensorBindings.BATTERY_PERCENT_LOW:
        value =
          this.state[VolvoSensorBindings.GROUP_BATTERY]!.hvBatteryLevel < this.config.batteryLowThreshold
            ? this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        break;

      case VolvoSensorBindings.FUEL_PERCENT_LOW:
        value =
          this.state.fuelAmountLevel < 20
            ? this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
        break;

      case VolvoSensorBindings.DOOR_TAILGATE ||
        VolvoSensorBindings.DOOR_FRONT_LEFT ||
        VolvoSensorBindings.DOOR_FRONT_RIGHT ||
        VolvoSensorBindings.DOOR_REAR_LEFT ||
        VolvoSensorBindings.DOOR_REAR_RIGHT:
        value = 
          this.state[VolvoSensorBindings.GROUP_DOORS][sensor]
            ? this.Characteristic.ContactSensorState.CONTACT_DETECTED
            : this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        break;

      case VolvoSensorBindings.WINDOW_FRONT_LEFT ||
        VolvoSensorBindings.WINDOW_FRONT_RIGHT ||
        VolvoSensorBindings.WINDOW_REAR_LEFT ||
        VolvoSensorBindings.WINDOW_REAR_RIGHT:
        value = 
          this.state[VolvoSensorBindings.GROUP_WINDOWS][sensor]
            ? this.Characteristic.ContactSensorState.CONTACT_DETECTED
            : this.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
        break;

      case VolvoSensorBindings.TYRE_FRONT_LEFT ||
        VolvoSensorBindings.TYRE_FRONT_RIGHT ||
        VolvoSensorBindings.TYRE_REAR_LEFT ||
        VolvoSensorBindings.TYRE_REAR_RIGHT:
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

  /**
   * Set target value for lock.
   * @param sensor
   */
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
    this.log.debug(`SET ${sensor} to ${value}`);
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
          this.bootUnlock = false;
        } else {
          this.bootUnlock = true;
          success = await this.Unlock();
          setTimeout(() => {
            if (success && !this.state.carLocked && this.bootUnlock) {
              // Vehicle hasn't been unlocked by pressing boot
              service.updateCharacteristic(
                this.Characteristic.LockCurrentState,
                this.Characteristic.LockCurrentState.SECURED,
              );
              // Boot unlock has passed. Car is locking automatically
              this.bootUnlock = false;
            }
          }, this.attr.unlockTimeFrame);
        }
        if (success) {
          // Update status to unlocked now, and revert it back to locked if vehicle is still unlocked after timeframe
          service.updateCharacteristic(this.Characteristic.LockCurrentState, value);
        }
        break;

      case VolvoActions.HONK_AND_BLINK:
        if (value === false || this.state.engineRunning) {
          // Stateless and not available while engine running.
          return false;
        } else {
          await this.HonkAndBlink();
          // Set status to off after 7 seconds
          setTimeout(() => service.updateCharacteristic(this.Characteristic.On, false), 7000);
        }
        break;

      case VolvoActions.BLINK:
        if (value === false || this.state.engineRunning) {
          // Stateless and not available while engine running.
          return false;
        } else {
          await this.Blink();
          // Set status to off after 10 seconds
          setTimeout(() => service.updateCharacteristic(this.Characteristic.On, false), 7000);
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

    setTimeout(() => this.Update(), 5 * 1000); // Update 5 seconds after value change
  }

  /**
   * Refreshes state from VOC API. Note that the state may be delayed by quite a bit.
   */
  private async Update(): Promise<void> {
    this.log.debug("Updating...");
    await this.RequestUpdate();
    await wait(5);
    const newState = await this.GetUpdate();
    if (this.bootUnlock) {
      // User has unlocked boot
      if (!newState.carLocked) {
        // Car has been fully unlocked
        this.bootUnlock = false;
      } else {
        // Car is still partially locked, but indicate to the user that the vehicle is in fact unlocked.
        // Manually set car unlocked, since boot is open. This isn't shown by the API,
        // only by querying for services by /services?active=true. No point in implementing this, since
        // this is stateful.
        newState.carLocked = false;
      }
    }
    this.state = newState;
  }

  private async Lock() {
    return await this.Call("lock");
  }

  private async Unlock() {
    return await this.Call("unlock");
  }

  private async StartEngine() {
    return await this.Call("engine/start", { runtime: this.config.engineStartDuration });
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
    const success = await this.Call("honk_blink/lights", await this.GetHonkBlinkBody());
    if (success) {
      return true;
    } else {
      // This didn't work on my car, but might on others?
      // ref: https://github.com/molobrakos/volvooncall/issues/19#issue-338097144
      await this.Call("honk_blink/blink", await this.GetHonkBlinkBody());
    }
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
