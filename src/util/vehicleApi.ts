import { REST } from "./helpers";
import { Config, CallState, VehicleState } from "./types";

export class VehicleApi extends REST {
  private vehicleUrl: string
  constructor(config: Config, url: string) {
    super(config);
    this.vehicleUrl = url;
  }

  private VALID_STATUS = ["Queued", "Started"]
  private VALID_STATUS_COMPLETION = ["MessageDelivered", "Successful", "Started"]

  /**
   * Make a remote method call
   */
  public async Call(method: string, data?: Record<string, unknown>) {
    const callResponse: CallState = await this.Post(method, this.vehicleUrl, data);

    if (!("service" in callResponse) || !("status" in callResponse) || !this.VALID_STATUS.includes(callResponse["status"])) {
      console.warn(`Failed to execute ${method}: ${callResponse["status"]}`);
    }

    const serviceUrl = callResponse["service"];
    const callState: CallState = await this.Get("", serviceUrl);
    if (!("status" in callState) || !this.VALID_STATUS_COMPLETION.includes(callState["status"])) {
      console.warn("Message not delivered");
      return false;
    } else if (callState.status === "Successful") {
      return true;
    }
    return false;
  }

  /**
   * Updates the state of the vehicle
   */
  public async Update(): Promise<VehicleState> {
    return await this.Get("status", this.vehicleUrl);
  }
}