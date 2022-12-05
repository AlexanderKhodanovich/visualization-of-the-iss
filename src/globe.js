var w = 960;
var h = 500;
var coordinates;
var config = {
  speed: 0.05,
  verticalTilt: -30,
  horizontalTilt: 0
}

var globe = d3.select("#globe")
    .attr("class", "globe")
    .attr('width', w)
    .attr('height', h)
const issLocation = globe.append('g');
const projection = d3.geoOrthographic();
const initialScale = projection.scale();
const globePath = d3.geoPath().projection(projection);
var centro = [w/2, h/2];

setTimeout(drawGlobe(), 5000);    
drawGraticule();
enableRotation(); 

function drawGlobe() { 
    d3.json('http://api.open-notify.org/iss-now.json').then(function(data) {
        coordinates = [[data.iss_position.longitude, data.iss_position.latitude], [data.iss_position.longitude, data.iss_position.latitude]]
    });
    d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
        .then( function(worldData) {
            globe.selectAll(".segment")
                .data(topojson.feature(worldData, worldData.objects.countries).features)
                .enter().append("path")
                .attr("class", "segment")
                .attr("d", globePath)
                .style("stroke", "white")
                .style("stroke-width", "1px")
                .style("fill", (d, i) => 'green')
                .style("opacity", "1");
                moveISS();
    });
}

function drawGraticule() {
    const graticule = d3.geoGraticule()
        .step([10, 10]);
    
    // temp fix so ocean stops clipping
    globe.append("circle")
        .attr("r", 250)
        .style("fill", "blue")
        .attr("cx", "50%")
        .attr("cy", "50%")
    
    globe.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", globePath)
        .style("fill", "blue")
        .style("stroke", "#ccc");
        
}

function enableRotation() {
    d3.timer(function (elapsed) {
        projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
        globe.selectAll("path").attr("d", globePath);
        moveISS()
    });
}        

function moveISS() {
    const marker = issLocation.selectAll("circle")
        .data(coordinates);
    marker
        .enter()
        .append("circle")
        .merge(marker)
        .attr("cx", d => projection(d)[0])
        .attr("cy", d => projection(d)[1])
        .attr('fill', d => {
            //console.log(coordinates[0]);
            const coordinate = coordinates[0];
            gdistance = d3.geoDistance(coordinate, projection.invert(centro));
            return gdistance > 1.57 ? 'none' : 'red';
        })
        .attr("r", 20);

        issLocation.each(function () {
            this.parentNode.appendChild(this);
        });
}
