# homebridge-volvo
## About
This is a plugin for [Homebridge](https://homebridge.io/), allowing you to control your Volvo car, and aims to replicate most of the functionality from the official Volvo On Call app.   

## Installation
### Plugin installation
1. Install [Homebridge](https://homebridge.io/) using: `npm install -g homebridge`
2. Install homebridge-volvo using: `npm install -g homebridge-volvo`
3. Configure homebridge-volvo by editing your `~/.homebridge/config.json` file. See example below:
## Configuration
### Basic Configuration Example:
``` json
{
  "accessory": "Volvo",
  "name": "Volvo",
  "email": "alice@example.com",
  "password": "1234",
  "region": ""
}
```
### Full Configuration Example:
``` json
{
  "accessory": "Volvo",
  "name": "My Volvo Car",
  "email": "alice@example.com",
  "password": "1234",
  "region": "",
  "VIN": "YV1AX8850J3766769",
  "updateInterval": 10,
  "engineStartDuration": 15,
  "batteryLowThreshold": 5,
  "enabledFeatures": {
    "carLocatorSupported": true,
    "honkAndOrBlink": true,
    "honkAndBlink": true,
    "remoteHeaterSupported": true,
    "unlockSupported": true,
    "lockSupported": false,
    "preclimatizationSupported": true,
    "engineStartSupported": true,
    "highVoltageBatterySupported": true
  }
}
```
### Configuration Parameters:
- `name`: Required string. Name of the accessory. Siri uses this parameter for identifying your car.
- `email`: Required string. Volvo On Call account email.
- `password`: Required string. Volvo On Call account password.
- `region`: Required string. Volvo On Call region.   
    Values:
  - `""`: Europe
  - `"na"`: North America
  - `"cn"`: China
- `VIN`: Optional string. VIN of your Volvo vehicle. Only required if you have multiple vehicles associated with your account.
- `updateInterval`: Optional number (default: `5`). Refresh interval in seconds from API. 
- `engineStartDuration`: Optional number greater than or equal to `1`, less than or equal to `15` (default: `15`). Duration of remote engine start in minutes.
- `batteryLowThreshold`: Optional number greater than or equal to `1`, less than or equal to `99` (default: `20`). Percentage threshold for battery low notification. Only applicable if you have an EV or plugin hybrid.
- `enabledFeatures`: Optional **object** (default: all enabled). Manually enable or disable features. Homebridge-volvo will automatically detect the features available on your car. This is only useful for disableling features for security reasons, such as lock/unlock. Properties:   
  - `carLocatorSupported`: Optional boolean (default: `true`)
  - `honkAndOrBlink`: Optional boolean (default: `true`)
  - `honkAndBlink`: Optional boolean (default: `true`)
  - `remoteHeaterSupported`: Optional boolean (default: `true`)
  - `unlockSupported`: Optional boolean (default: `true`)
  - `lockSupported`: Optional boolean (default: `true`)
  - `preclimatizationSupported`: Optional boolean (default: `true`)
  - `engineStartSupported`: Optional boolean (default: `true`)
  - `highVoltageBatterySupported`: Optional boolean (default: `true`)

## DEV Updates
### Update 2020-07-13
I have everything working in my environment, and worked out some bugs. Still much to be done in terms of bug testing, as well as adhering to the error handling requirements secified [here](https://github.com/homebridge/homebridge/wiki/verified-Plugins#requirements).

### Update 202-07-02
Homebridge is now working, allthough I have not tested much of the functionality yet. This is still very much in early development.   

The currently implemented services via Homebridge are:
- Engine remote start
- Heater
- Preclimatization
- Lock/unlock
- Honk and blink
- Blink
- Engine status
- Battery level
- Charge status

### Update 2020-06-30
I am still in early development. At this point, the only thing implemented is an interface to the VOC API, along with basic functionality, such as turning on or off the parking heater, engine control, doors, etc.   
I only have access to my own car for testing. Therefore, I am only able to test the functionality available on my car, a 2020 XC60 T8. Feel free to open an issue containing example responses from the API for your car.   
   
Useful endpoints include:
- `https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/status`
- `https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/attributes`
