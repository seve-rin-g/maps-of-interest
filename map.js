// D3 Map Visualization
const mapContainer = d3.select('#map-container');
const infoPanel = d3.select('#info-content');

// Web Mercator projection
const projection = d3.geoMercator();
const path = d3.geoPath().projection(projection);

// Create SVG
const svg = mapContainer.append('svg');

// Load world map data and places data
Promise.all([
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
    d3.json('data/places.json')
]).then(([world, data]) => {
    // Extract countries
    const countries = topojson.feature(world, world.objects.countries);
    
    // Calculate bounds for all places
    const coordinates = data.places.map(p => [p.coordinates.lng, p.coordinates.lat]);
    const bounds = d3.geoBounds({ type: 'FeatureCollection', features: coordinates.map(c => ({ type: 'Point', geometry: { type: 'Point', coordinates: c } })) });
    
    // Set projection to fit all places with padding
    projection.fitExtent([[10, 10], [mapContainer.node().clientWidth - 10, mapContainer.node().clientHeight - 10]], 
        { type: 'FeatureCollection', features: coordinates.map(c => ({ type: 'Point', geometry: { type: 'Point', coordinates: c } })) });
    
    // Draw countries
    svg.selectAll('.country')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'countries')
        .attr('d', path);
    
    // Create marker groups
    const markers = svg.selectAll('.marker')
        .data(data.places)
        .enter()
        .append('g')
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