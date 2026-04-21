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

// Load world map data and places data
Promise.all([
    d3.json('data/places.json'),
    d3.csv('data/fruits.csv'),
    d3.json('data/geojson.json')
]).then(([data, fruitThrees, coastline]) => {
    
    // Calculate bounds for all places
    const coordinates = data.places.map(p => [p.coordinates.lng, p.coordinates.lat]);
    const placeFeatures = {
        type: 'FeatureCollection',
        features: coordinates.map(c => ({ type: 'Feature', geometry: { type: 'Point', coordinates: c } }))
    };
    const bounds = d3.geoBounds(placeFeatures);
    
    // Set projection to fit all places with padding
    projection.fitExtent([[10, 10], [mapContainer.node().clientWidth - 10, mapContainer.node().clientHeight - 10]], placeFeatures);


    const [sw, ne] = bounds;
    const lngPadding = 1.2;
    const latPadding = 1.2;
    const paddedBounds = [
        [sw[0] - lngPadding, sw[1] - latPadding],
        [ne[0] + lngPadding, ne[1] + latPadding]
    ];

    const intersectsBounds = (feature, targetBounds) => {
        const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
        const [[targetMinLng, targetMinLat], [targetMaxLng, targetMaxLat]] = targetBounds;

        return !(maxLng < targetMinLng || minLng > targetMaxLng || maxLat < targetMinLat || minLat > targetMaxLat);
    };

    const coastlineFeatures = coastline?.type === 'FeatureCollection' ? coastline.features : [];
    const regionalCoastline = coastlineFeatures.filter(feature => intersectsBounds(feature, paddedBounds));

    svg.append('g')
        .attr('class', 'coastline-layer')
        .selectAll('path')
        .data(regionalCoastline)
        .enter()
        .append('path')
        .attr('class', 'coastline')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', 'purple')
        .attr('stroke-width', 1.1)
        .attr('stroke-opacity', 0.85);

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