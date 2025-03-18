# Google Maps Tools for Model Context Protocol (MCP)

This repository provides a set of tools for interacting with the Google Maps API using the Model Context Protocol (MCP). These tools allow you to perform operations such as geocoding addresses, getting directions, searching for places, calculating distances, and more. The tools are fully developed and ready for use in MCP-based applications.

## Available Tools

### 1. `maps_geocode`
**Description**: Converts an address into a geographic location (latitude and longitude).  
**Input**: 
- `address`: The address to geocode.
  
**Usage**: This tool takes an address and returns the geographical coordinates (latitude and longitude) of the address.

---

### 2. `maps_reverse_geocode`
**Description**: Converts geographic coordinates (latitude and longitude) into an address.  
**Input**: 
- `latitude`: Latitude coordinate.
- `longitude`: Longitude coordinate.

**Usage**: This tool takes a set of geographic coordinates and returns the nearest address.

---

### 3. `maps_search_places`
**Description**: Searches for places based on a query, optionally within a specified radius around a given location.  
**Input**: 
- `query`: The search query (e.g., a place name or category).
- `location`: An optional object specifying the latitude and longitude of the search center.
- `radius`: An optional radius (in meters) to limit the search results.

**Usage**: This tool allows you to search for places (restaurants, parks, stores, etc.) using a keyword or category. You can also specify a search center and radius.

---

### 4. `maps_place_details`
**Description**: Retrieves detailed information about a specific place using its Google Maps place ID.  
**Input**: 
- `place_id`: The unique place ID for the place whose details are being requested.

**Usage**: This tool fetches detailed information about a specific place, such as its address, phone number, website, reviews, and more.

---

### 5. `maps_distance_matrix`
**Description**: Calculates the travel distance and time between multiple origins and destinations.  
**Input**: 
- `origins`: An array of origin addresses or coordinates.
- `destinations`: An array of destination addresses or coordinates.
- `mode`: The mode of travel (driving, walking, bicycling, or transit).

**Usage**: This tool calculates the distance and duration for travel between several origin and destination points. It can work with multiple origins and destinations at once.

---

### 6. `maps_elevation`
**Description**: Retrieves elevation data for locations on Earth.  
**Input**: 
- `locations`: An array of locations (latitude and longitude) for which elevation data is requested.

**Usage**: This tool provides the elevation (height above sea level) for given geographical coordinates.

---

### 7. `maps_directions`
**Description**: Provides driving, walking, bicycling, or transit directions between two locations.  
**Input**: 
- `origin`: The starting point address or coordinates.
- `destination`: The ending point address or coordinates.
- `mode`: The mode of transportation (driving, walking, bicycling, or transit).

**Usage**: This tool calculates the best route between two locations using the specified travel mode. It returns step-by-step directions and estimated travel time.
