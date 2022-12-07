// Inspiration -> https://bl.ocks.org/atanumallick/8d18989cd538c72ae1ead1c3b18d7b54

import {SIDEBAR_BASE_WIDTH} from "./sidebar.js";
import {get_transform, draw_points} from "./utils.js";

// SVG Dimensions
const width = 960;
const height = 500;

// Globe Properties
const config = {
  speed: 0.05,
  verticalTilt: -30,
  horizontalTilt: 0
}

// Array for ISS Coordinates 
let locations = [];

// Polling rate for API
var tickRate = 5000; /* polls every 5 seconds*/

// Creates SVG and Globe Projection
const svg = d3.select('svg')
    .attr('width', width).attr('height', height);
const markerGroup = svg.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width/2, height/2];   

// Renders Continents, Countries, and ISS Coordinates
function drawGlobe() {  
    getCoordinates();
    d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
        .then( function(worldData) {
            svg.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", path)
                .attr("x", "50%")
                .attr("y", "50%")
                .style("stroke", "white")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => '#228B22')
                .style("opacity", "1");
    });
}

// Renders Gridlines and Ocean
function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    svg.append("circle")
        .attr("r", 250)
        .style("fill", "#2B65EC")
        .attr("cx", "50%")
        .attr("cy", "50%")
    
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path)
        .style("fill", "#2B65EC")
        .style("stroke", "#ccc");
}

// Changes Rotation of Globe every tick
function enableRotation() {
    d3.timer(function (elapsed) {
        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });
}        

// Updates Coordinates from API per tickRate
function pollCoordinates() {
    d3.interval(getCoordinates, tickRate);
}

// Recieves coordinates of ISS from API and renders a point on the globe with the location
function getCoordinates() {
    d3.json('https://api.wheretheiss.at/v1/satellites/25544').then(function(data) {
        console.log(`Current ISS Coordinates: ${data.longitude} ${data.latitude}`)
        locations = [[data.longitude, data.latitude], [data.longitude, data.latitude]]
        drawMarkers();
    });
}

// Renders baby ISS
function drawMarkers() { 
    const markers = markerGroup.selectAll('circle')
        .data(locations);
    markers
        .enter()
        .append('circle')
        .merge(markers)
        .attr('cx', d => projection(d)[0])
        .attr('cy', d => projection(d)[1])
        .attr('fill', d => {
            const coordinate = locations[0];
            var gdistance = d3.geoDistance(coordinate, projection.invert(center));
            return gdistance > 1.57 ? 'none' : 'red';
        })
        .attr('r', 7);

    markerGroup.each(function () {
        this.parentNode.appendChild(this);
    });
}

// Shows Real-Time ISS Stats
function show_ISS_stats() {
    const markers = markerGroup.selectAll('text')
        .data(locations);
    markers
        .enter()
        .append('text')
        .attr('x', d => projection(d)[0] + 10)
        .attr('y', d => projection(d)[1] - 10)
    
}

function globe_interactive_scale(mgn_top, mgn_side, mgn_bot) {
    var globe = d3.select("svg.globe");
    return Math.min(
        (window.innerHeight - mgn_top - mgn_bot) / (+globe.attr("height")),
        (SIDEBAR_BASE_WIDTH*window.innerWidth/1920 - 2*mgn_side) / (+globe.attr("width"))
    );
}

function move_globe() {
    
}

// Changes Globe size with window size
function resize_globe(is_interactive) {
    var globe = d3.select("svg.globe");
    var scale = 1;
    
    // The globe is big and in the middle of the screen
    if (!is_interactive) {
        // define constants
        const mgn_top = 60;
        const mgn_side = 20;
        const mgn_bottom = 20;

        // calculate
        var globe_div = d3.select("div.globe_pos");
        
        const rect_btn = document.querySelector("button.begin").getBoundingClientRect();
        const rect_switch = document.querySelector("div.vis_slider").getBoundingClientRect();
        const h_needed = window.innerHeight - rect_btn.y - rect_btn.height - rect_switch.height - mgn_top - mgn_bottom;
        scale = Math.min(
            h_needed / (+globe.attr("height")),
            (window.innerWidth - 2*mgn_side) / (+globe.attr("width"))
        );
        const top = rect_btn.y + rect_btn.height + mgn_top;

        // set properties
        globe.style("transform-origin", "top center");
        globe.style("top", top + "px");
        globe.style("left", "50%")
        globe.style("transform", "translate(-50%, 0%)" +
                    " scale(" + scale + ")");
    }
    // the globe is small and in the bottom right corner
    else {
        // define constants
        const mgn_top = 20;
        const mgn_side = 20;
        const mgn_bot = 40;

        var globe = d3.select("svg.globe");
        const scale = globe_interactive_scale(mgn_top, mgn_side, mgn_bot);
        const sb_width = SIDEBAR_BASE_WIDTH*window.innerWidth/1920;
        const left = (window.innerWidth - sb_width + mgn_side);
        const top = window.innerHeight - mgn_bot - (+globe.attr("height")*scale);

        globe.style("transform-origin", "top left");
        globe.style("top", top);
        globe.style("left", left);
        globe.style("transform", "scale(" + scale + ")");
    }
}

function init_globe() {
    setTimeout(drawGlobe(), 5000);    
    drawGraticule();
    enableRotation();
    pollCoordinates();
    resize_globe();
}

export {init_globe, resize_globe, globe_interactive_scale, move_globe};
