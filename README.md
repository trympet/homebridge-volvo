# homebridge-volvo
## About
This is a plugin for [Homebridge](https://homebridge.io/), allowing you to control your Volvo car, and aims to replicate most of the functionality from the official Volvo On Call app.   

## Installation
### Plugin installation
1. Install [Homebridge](https://homebridge.io/) using: `npm install -g homebridge`
2. Install homebridge-volvo using: `npm install -g homebridge-volvo`
3. Configure homebridge-volvo by editing your `~/.homebridge/config.json` file, or use [config-ui-x](https://www.npmjs.com/package/homebridge-config-ui-x). See example below:
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
