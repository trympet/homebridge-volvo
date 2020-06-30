# homebridge-volvo
## About
This is a plugin for [Homebridge](https://homebridge.io/), allowing you to control your Volvo car, and aims to replicate most of the functionality from the official Volvo On Call app.
### Update 2020-06-30
I am still in early development. At this point, the only thing implemented is an interface to the VOC API, along with basic functionality, such as turning on or off the parking heater, engine control, doors, etc.   
I only have access to my own car for testing. Therefore, I am only able to test the functionality available on my car, a 2020 XC60 T8. Feel free to open an issue containing example responses from the API for your car.   
   
Useful endpoints include:
- `https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/status`
- `https://vocapi.wirelesscar.net/customerapi/rest/v3.0/vehicles/VEHICLE_VIN/attributes`
