# homebridge-volvo
## About
This is a plugin for [Homebridge](https://homebridge.io/), allowing you to control your Volvo car, and aims to replicate most of the functionality from the official Volvo On Call app.   

## Configuration
Example config.json:
```
}
  "accessories": [
    {
      "accessory": "Volvo",
      "name": "My fancy Volvo",
      "email": "alice@example.com",
      "password": "1234",
      "region": "",
      "VIN": "4T1BB3EK3AU115504"
    }
  ]
}
```
Valid regions are "NA" for North-America, "CN" for China and "" (empty string) for anywhere else.   
VIN is only required if you have multiple Volvo cars, connected to the same Volvo On Call account.
### Update 2020-07-02
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
