import btoa from "btoa";
import { Config } from "./types";
import fetch, { Headers, RequestInit } from "node-fetch";

export const BasicAuth = (user: string, pass: string) => "Basic " + btoa(`${user}:${pass}`);

export class REST {
  region: string

  private username: string;

  private password: string;

  private _AUTH = ""

  // required headers for response from VOC API
  private HEADERS = new Headers({
    "X-Device-Id": "Device",
    "X-OS-Type": "Android",
    "X-Originator-Type": "App",
    "X-OS-Version": "22",
    "Content-Type": "application/json",
  })

  private static SERVICE_URL = (region: Config["region"]) => `https://vocapi${region}.wirelesscar.net/customerapi/rest/v3.0/`
  private _SERVICE_URL = ""

  constructor(config: Config) {
    // set service URL based on region
    this.username = config.email;
    this.password = config.password;
    this.region = config.region + ".";
    this._SERVICE_URL = `https://vocapi.${this.region !== "." || ""}wirelesscar.net/customerapi/rest/v3.0/`;
    this._AUTH = BasicAuth(this.username, this.password);
    // add auth header to API calls 
    this.HEADERS.append("Authorization", this._AUTH);
  }

  public async Get(url: string, rel?: string) {
    try {
      return (await fetch((rel || this._SERVICE_URL) + url, {
        method: "GET",
        headers: this.HEADERS,
      })).json();
    } catch (error) {
      console.error(error);
    }
  }

  public async Post(url: string, rel: string, data?: Record<string, unknown>) {
    const postParams: RequestInit = {
      method: "POST",
      headers: this.HEADERS,
      body: "{}",
    };
    if (data) {
      postParams["body"] = JSON.stringify(data);
    }

    return (await fetch((rel || this._SERVICE_URL) + url, postParams)).json();
  }
}