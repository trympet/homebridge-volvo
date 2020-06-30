import { PlatformConfig } from "homebridge";
import { API } from "./util/api";
import { Config } from "./util/types";
import * as dotenv from "dotenv"; 
class VolvoPlatform {
  private api: API
  constructor(config?: PlatformConfig) {
    let vocConfig: Config;
    if (config) {
      const {
        email,
        password,
        region,
      } = config;
      vocConfig = {
        email: email,
        password: password,
        region: region,
      };

    } else {
      dotenv.config();
      const {
        VOC_EMAIL,
        VOC_PASSWORD,
        VOC_REGION,
      } = process.env;
      if (!VOC_EMAIL || !VOC_PASSWORD) {
        throw new Error("No login details provided.");
      }
      vocConfig = {
        email: VOC_EMAIL,
        password: VOC_PASSWORD,
        region: VOC_REGION || "",
      };
    }



    this.api = new API(vocConfig);
  }

  public async Start() {
    await this.api.Init();
  }

  public async TestHeater() {
    
    this.api.vehicles[0].StartHeater();
  }
}
(async () => {
  const platform = new VolvoPlatform();
  await platform.Start();
  await platform.TestHeater();

})();