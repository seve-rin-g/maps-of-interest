// D3 Map Visualization
const mapContainer = d3.select('#map-container');
const infoPanel = d3.select('#info-content');
const infoPanel2 = d3.select('#fruit-content');

// Web Mercator projection
const projection = d3.geoMercator();
const path = d3.geoPath().projection(projection);

// Create SVG
const svg = mapContainer.append('svg');

// Adding zoom behavior to the svg
const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on('zoom', (event) => {
    svg.attr('transform', event.transform);
  });

svg.call(zoom);

// Buttons for zooming in and out
const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const resetButton = document.getElementById('zoom-reset');

zoomInButton.addEventListener('click', () => {
    svg.transition().duration(750).call(zoom.scaleBy, 1.2);
});

zoomOutButton.addEventListener('click', () => {
  svg.transition().call(zoom.scaleBy, 0.8);
});

resetButton.addEventListener('click', () => {
  svg.transition().call(zoom.transform, d3.zoomIdentity);
});


// Load world map data and places data
Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/land-10m.json'),
    d3.json('data/places.json'),
    d3.csv('data/fruits.csv')
]).then(([world, data, fruitThrees]) => {
    // Extract land geometry from world-atlas TopoJSON
    const land = topojson.feature(world, world.objects.land);
    
    // Calculate bounds for all places
    const coordinates = data.places.map(p => [p.coordinates.lng, p.coordinates.lat]);
    const bounds = d3.geoBounds({ type: 'FeatureCollection', features: coordinates.map(c => ({ type: 'Point', geometry: { type: 'Point', coordinates: c } })) });
    
    // Set projection to fit all places with padding
    projection.fitExtent([[10, 10], [mapContainer.node().clientWidth - 10, mapContainer.node().clientHeight - 10]], 
        { type: 'FeatureCollection', features: coordinates.map(c => ({ type: 'Point', geometry: { type: 'Point', coordinates: c } })) });
    
    svg.append('path')
        .datum(land)
        .attr('class', 'land')
        .attr('d', path);

    // Create marker groups
    const fruits = svg.selectAll('.fruit')
        .data(fruitThrees)
        .enter()
        .append('g')
        .attr('width',10)
        .attr('height',10)
        .attr('class', 'fruit')
        .attr('transform', d => {
            const coords = projection([d.lng, d.lat]);
            return `translate(${coords[0]},${coords[1]})`;
        })
        .on('click', (event, d) => {
            // Remove active class from all markers
            svg.selectAll('.fruit').classed('active', false);
            // Add active class to clicked marker
            d3.select(event.currentTarget).classed('active', true);
            // Update info panel
            updateFruitPanel(d);
        });
    
         // Create marker groups
    const markers = svg.selectAll('.marker')
        .data(data.places)
        .enter()
        .append('g')
        .attr('width',20)
        .attr('height',20)
        .attr('class', 'marker')
        .attr('transform', d => {
            const coords = projection([d.coordinates.lng, d.coordinates.lat]);
            return `translate(${coords[0]},${coords[1]})`;
        })
        .on('click', (event, d) => {
            // Remove active class from all markers
            svg.selectAll('.marker').classed('active', false);
            // Add active class to clicked marker
            d3.select(event.currentTarget).classed('active', true);
            // Update info panel
            updateInfoPanel(d);
        });

    // Add circles to markers
    markers.append('circle')
        .attr('r', 6);

    // 
    fruits.append('circle').attr('r', 2);
    
}).catch(error => {
    console.error('Error loading data:', error);
    infoPanel.html('<p class="placeholder">Error loading map data. Make sure you have internet connection.</p>');
});

function updateInfoPanel(place) {
    const latValue = place.coordinates.lat.toFixed(4);
    const lngValue = place.coordinates.lng.toFixed(4);
    const html = `
        <div class="place-info">
            <h2>${place.name}</h2>
            <div class="coordinates">
                <label>Coordinates</label>
                <div class="coordinate-value">Latitude: ${latValue}</div>
                <div class="coordinate-value">Longitude: ${lngValue}</div>
            </div>
            <div class="annotation">
                <span class="annotation-label">Annotation</span>
                <p>${place.annotation}</p>
            </div>
        </div>
    `;
    infoPanel.html(html);
}

function updateFruitPanel(place) {
    console.log(place)
    const tooltipHtml=`<div class="place-info">
        ${place.description}<br>
        ${place.address}</div>
    `
    infoPanel2.html(tooltipHtml);
}