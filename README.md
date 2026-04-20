# Maps of Interest

A beautiful web visualization that overlays places of interest onto an interactive map using D3.js.

## Features

- **Interactive Map**: D3.js-powered map visualization with Web Mercator projection
- **Place Markers**: Click on markers to view detailed information
- **User Annotations**: Each place includes user-generated annotations
- **Responsive Design**: Modern, gradient UI with clean typography

## Data Structure

The `data/places.json` file contains an array of places with the following structure:

```json
{
  "places": [
    {
      "name": "Place Name",
      "coordinates": {
        "lat": 0.0,
        "lng": 0.0
      },
      "annotation": "User-generated note about this place"
    }
  ]
}
```

### Fields:
- **name** (string): The name of the place
- **coordinates** (object): Geographic coordinates
  - **lat** (number): Latitude
  - **lng** (number): Longitude
- **annotation** (string): User-generated annotation or description

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Add your own places to `data/places.json`
4. Click on markers to view place details in the info panel

## Technology Stack

- **D3.js v7**: Map visualization and data-driven DOM manipulation
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: Core interactivity logic

## Usage

### Adding New Places

Edit `data/places.json` and add entries following the structure above:

```json
{
  "name": "My Favorite Spot",
  "coordinates": {
    "lat": 51.5074,
    "lng": -0.1278
  },
  "annotation": "A wonderful place I visited on vacation"
}
```

## File Structure

```
maps-of-interest/
├── index.html       # Main HTML file
├── styles.css       # Styling and D3 map styles
├── map.js          # D3 visualization logic
├── data/
│   └── places.json # Place data
└── README.md       # This file
```

## Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- D3.js v7
- CSS Grid and Flexbox