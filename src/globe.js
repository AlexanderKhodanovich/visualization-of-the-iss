const width = 960;
const height = 500;
const config = {
  speed: 0.05,
  verticalTilt: -30,
  horizontalTilt: 0
}
let locations = [];
const svg = d3.select('svg')
    .attr('width', width).attr('height', height);
const markerGroup = svg.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const path = d3.geoPath().projection(projection);
const center = [width/2, height/2];   

function drawGlobe() {  
    d3.json('http://api.open-notify.org/iss-now.json').then(function(data) {
        locations = [[data.iss_position.longitude, data.iss_position.latitude], [data.iss_position.longitude, data.iss_position.latitude]]
    });
    d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
        .then( function(worldData) {
            //worldData = values[0]
            //locationData = values[1]
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
                drawMarkers();
    });
}

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

function enableRotation() {
    d3.timer(function (elapsed) {
        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        svg.selectAll("path").attr("d", path);
        drawMarkers();
    });
}        

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

function resize_globe(is_interactive) {
    
    // The globe is big and in the middle of the screen
    if (!is_interactive) {
        // define constants
        const mgn_top = 60;
        const mgn_side = 20;
        const mgn_bottom = 20;

        // calculate
        var globe_div = d3.select("div.globe_pos");
        var globe = d3.select("svg.globe");
        const rect_btn = document.querySelector("button.begin").getBoundingClientRect();
        const rect_switch = document.querySelector("div.vis_slider").getBoundingClientRect();
        const h_needed = window.innerHeight - rect_btn.y - rect_btn.height - rect_switch.height - mgn_top - mgn_bottom;
        const scale = Math.min(h_needed / (+globe.attr("height")), (window.innerWidth - 2*mgn_side) / (+globe.attr("width")));
        const top = rect_btn.y + rect_btn.height + mgn_top;

        // set properties
        globe.style("transform", "translate(-50%, 0%)" +
                    " scale(" + scale + ")");

        globe.style("top", top + "px");
    }
    // the globe is small and in the bottom right corner
    else {
        
    }
}

function init_globe() {
    setTimeout(drawGlobe(), 5000);    
    drawGraticule();
    enableRotation();
    resize_globe();
}

export {init_globe, resize_globe};
