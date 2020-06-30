import { VehicleAttributes, VehicleState, Config } from "./types";
import { VehicleApi } from "./vehicleApi";

export class Vehicle {
  attr: VehicleAttributes
  state: VehicleState | null = null
  connection: VehicleApi
  constructor(attr: VehicleAttributes, config: Config, url: string) {
    this.attr = attr;
    this.connection = new VehicleApi(config, url);
    this.Update();
  }
  
  private async Update() {
    this.state = await this.connection.Update();
  }

  /**
   * Starts heater
   */
  public async StartHeater(): Promise<boolean> {
    if (this.IsRemoteHeaterSupported()) {
      await this.connection.Call("heater/start");
      await this.Update();
      if (this.IsHeaterRunning()) {
        return true;
      }
      return false;
    } else if (this.IsPreclimatizationSupported()) {
      await this.connection.Call("preclimatization/start");
      await this.Update();
      return this.IsHeaterRunning();

    }
    return false;
  }

  // public StopHeater(): void {

  // }

  private IsRemoteHeaterSupported() {
    return this.attr.remoteHeaterSupported;
  }

  private IsPreclimatizationSupported() {
    return this.attr.preclimatizationSupported;
  }

  private IsHeaterSupported() {
    return (this.IsRemoteHeaterSupported() || this.IsPreclimatizationSupported()) && "heater" in this.attr;
  }

  /**
   * Returns heater state
   * @returns {boolean}
   */
  private IsHeaterRunning() {
    return this.IsHeaterSupported() && this.state !== null && this.state.heater && this.state.heater.status !== "off";
  }

  // public async Unlock() {

  // }

  private IsUnlockSupported(): boolean {
    return this.attr.unlockSupported;
  }

  private IsLockSupported(): boolean {
    return this.attr.lockSupported;
  }

  private IsLocked(): boolean {
    return this.state !== null && this.state.carLocked;
  }

}