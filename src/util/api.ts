
import { Config, User } from "./types";
import { REST } from "./helpers";
import { Vehicle } from "./vehicle";

export class API extends REST {
    public vehicles: Vehicle[] = []
    public vehicleCount = 0
    config: Config

    constructor(config: Config) {
      super(config);
      this.config = config;
    }

    public async Init() {
      await this.GetVehicles();
    }

    private async GetVehicles() {
      const user: User = await this.Get("customeraccounts");
      this.vehicleCount = user.accountVehicleRelations.length;
      console.log(`Got account for ${user["username"]}`);
      for (let i = 0; i < this.vehicleCount; i++) {
        const vehicle = user.accountVehicleRelations[i];
        const rel = await this.Get("", vehicle);
        if (rel["status"] === "Verified") {
          const url = rel["vehicle"] + "/";
          const attr = await this.Get("attributes", url);
          console.log(attr);
          this.vehicles.push(new Vehicle(attr, this.config, url));
        }
      }
    }
}