# AI Homework

Static websites built with AI.

## 🌍 Earthquakes around the world

**Live site:** https://ronenkla.github.io/AI-Homework/earthquakes/

A map and list of recent earthquakes, with filters by time period and magnitude.
Data comes from the free [USGS Earthquake API](https://earthquake.usgs.gov/earthquakes/feed/) (no key needed).
The map uses [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles.

Files are in the [`earthquakes`](earthquakes/) folder.

## 🧭 Compass

**Live app (open on a phone):** https://ronenkla.github.io/AI-Homework/compass/

A phone compass built on the browser's Device Orientation API, which reads the phone's
magnetometer. It also shows GPS coordinates from the Geolocation API.
Can be added to the home screen like an app.

**Computer viewer:** https://ronenkla.github.io/AI-Homework/compass/viewer.html

Open it on a computer and scan the QR code with the phone. The phone then streams its
heading and tilt live to the computer, through a free public MQTT server
([HiveMQ](https://www.hivemq.com/mqtt/public-mqtt-broker/), no key needed).

Files are in the [`compass`](compass/) folder.
