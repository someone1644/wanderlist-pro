# WanderList Pro

WanderList Pro is an interactive, frontend focused travel itinerary planner built with React. It allows users to search for global destinations, visualize them on an interactive map, and manage their travel bucket lists through a dynamic column-based UI.

## Features

* **Interactive Map Integration:** Utilizes `react-leaflet` and OpenStreetMap APIs to dynamically fly to and plot user-searched destinations.
* **Geocoding Search:** Integrated with the Nominatim OpenStreetMap API to convert text-based city searches into precise latitude and longitude coordinates.
* **State Management & Persistence:** Leverages React Hooks (`useState`, `useEffect`) and browser `localStorage` to ensure user itineraries are saved locally without needing a backend database.
* **Dynamic Itinerary Board:** A three-tier management system (Bucket List, Active Itinerary, Completed) allowing users to track their travel progress.
* **Integrated Utility Widget:** Includes a custom-built budget calculator component directly in the dashboard.

## Tech Stack

* **Frontend:** React (Vite)
* **Map Rendering:** Leaflet, React-Leaflet
* **APIs:** OpenStreetMap (Nominatim Geocoding API)
* **Styling:** Custom CSS (Responsive, Modern UI)

## Running the Project Locally

To run this project on your local machine:

1. Clone the repository:
   ```bash
   git clone [https://github.com/someone1644/wanderlist-pro.git](https://github.com/someone1644/wanderlist-pro.git)