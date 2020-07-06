import btoa from "btoa";
import { Config } from "./types";
import fetch, { Headers, RequestInit } from "node-fetch";
import * as syncRequest from "sync-request";

export const BasicAuth = (user: string, pass: string) => "Basic " + btoa(`${user}:${pass}`);

export class REST {
  region: string;

  private username: string;
  private password: string;

  private _AUTH = "";
  private _SERVICE_URL = "";

  // required headers for response from VOC API
  private HEADERS: Headers;
  private SYNC_HEADERS;

  private static SERVICE_URL = (region: Config["region"]) =>
    `https://vocapi${region}.wirelesscar.net/customerapi/rest/v3.0/`;

  constructor(config: Config) {
    // set service URL based on region
    this.username = config.email;
    this.password = config.password;
    this.region = config.region + ".";
    this._SERVICE_URL = `https://vocapi.${this.region !== "." || ""}wirelesscar.net/customerapi/rest/v3.0/`;
    this._AUTH = BasicAuth(this.username, this.password);
    // add auth header to API calls
    const headerObj = {
      "X-Device-Id": "Device",
      "X-OS-Type": "Android",
      "X-Originator-Type": "App",
      "X-OS-Version": "22",
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: this._AUTH,
    };
    this.HEADERS = new Headers(headerObj);
    this.SYNC_HEADERS = headerObj;
  }

  private MakeUrl = (url: string, rel?: string) => (rel || this._SERVICE_URL) + url;

  public async Get(url: string, rel?: string) {
    return (
      await fetch(this.MakeUrl(url, rel), {
        method: "GET",
        headers: this.HEADERS,
      })
    ).json();
  }

  public GetSync(url: string, rel?: string) {
    const req = syncRequest.default("GET", this.MakeUrl(url, rel), {
      headers: this.SYNC_HEADERS,
    });
    return JSON.parse(req.getBody().toString());
  }

  public async Post(url: string, rel: string, data?: Record<string, unknown>) {
    const postParams: RequestInit = {
      method: "POST",
      headers: this.HEADERS,
      body: "{}",
    };
    if (data) {
      console.log("post req has data:", data);
      postParams["body"] = JSON.stringify(data);
    }
    const res = await fetch(this.MakeUrl(url, rel), postParams);
    return res.json();
  }
}
