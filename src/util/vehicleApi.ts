import { REST } from "./rest";
import { Config, CallState, VehicleState, PositionResponse } from "./types";
import { wait } from "../helpers";
import { Logger } from "homebridge";

export class VehicleApi extends REST {
  constructor(config: Config, private readonly vehicleUrl: string, public readonly log: Logger) {
    super(config);
  }

  private VALID_STATUS = ["Queued", "Started"];

  /**
   * Make a call to the VOC API.
   */
  public async Call(method: string, data?: Record<string, unknown>) {
    const initialCall: CallState = await this.Post(method, this.vehicleUrl, data);
    // Sometimes the VOC API doesn't return valid JSON. Therefore we have this edgecase.
    if (!initialCall["service"] || !initialCall["status"] || !this.VALID_STATUS.includes(initialCall["status"] || "")) {
      this.log.error(`Failed to execute ${method}: ${initialCall["errorDescription"]}`);
      this.log.error(JSON.stringify(initialCall, null, 2));
      return false;
    }
    return await this.CheckCallState(initialCall);
  }

  private async CheckCallState(callState: CallState, initial?: boolean): Promise<boolean> {
    if (!("status" in callState)) {
      this.log.warn("Message not delivered");
      return false;
    }
    let status: boolean;
    switch (callState.status) {
      case "Successful":
        status = true;
        break;

      case "MessageDelivered":
        status = true;
        break;

      case "Queued":
        await wait(10);
        status = false;
        break;

      case "Started":
        status = true;
        break;

      case "Failed":
        this.log.error(`Could not execute ${callState.serviceType} with failure reason "${callState.failureReason}"`)
        status = false;
        break;
      default:
        status = false;
        break;
    }
    if (status) {
      if (initial) {
        // Initial call was successful. Now check status
        return await this.GetCallState(callState.service);
      } else {
        // Follow-up callstate is successful.
        return true;
      }
    } else {
      return false;
    }
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
