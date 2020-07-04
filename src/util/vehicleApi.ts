import { REST } from "./rest";
import { Config, CallState, VehicleState, PositionResponse } from "./types";
import { wait } from "../helpers";

export class VehicleApi extends REST {
  private vehicleUrl: string;
  constructor(config: Config, url: string) {
    super(config);
    this.vehicleUrl = url;
  }

  private VALID_STATUS = ["Queued", "Started"];

  /**
   * Make a call to the VOC API.
   */
  public async Call(method: string, data?: Record<string, unknown>) {
    const initialCall: CallState = await this.Post(method, this.vehicleUrl, data);
    if (!initialCall["service"] || !initialCall["status"] || !this.VALID_STATUS.includes(initialCall["status"] || "")) {
      console.warn(`Failed to execute ${method}: ${initialCall["errorDescription"]}`);
      console.log(JSON.stringify(initialCall));
      return false;
    }
    return await this.CheckCallState(initialCall);
  }

  private async CheckCallState(callState: CallState): Promise<boolean> {
    console.log(callState.status);
    if (!("status" in callState)) {
      console.warn("Message not delivered");
      return false;
    }
    switch (callState.status) {
      case "Successful":
        return true;
        break;

      case "MessageDelivered":
        return true;
        break;

      case "Queued":
        await wait(10);
        break;
      case "Started":
        return true;
        break;
      default:
        return false;
        break;
    }
    return await this.GetCallState(callState.service);
  }

  private async GetCallState(serviceUrl: string) {
    const response: CallState = await this.Get("", serviceUrl);
    return await this.CheckCallState(response);
  }

  /**
   * Gets the current position of your car.
   * If position delta > 500m, sirens and horns won't work.
   */
  public async GetVehiclePosition(): Promise<PositionResponse> {
    return await this.Get("position", this.vehicleUrl);
  }

  /**
   * Tells the VOC API to fetch the state from your car.
   * Timestamps in state will reflect this.
   */
  public async RequestUpdate(): Promise<void> {
    return await this.Post("updatestatus", this.vehicleUrl);
  }

  /**
   * Gets the state from the VOC API
   */
  public async GetUpdate(): Promise<VehicleState> {
    return await this.Get("status", this.vehicleUrl);
  }
}
