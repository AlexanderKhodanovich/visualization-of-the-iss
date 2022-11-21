
console.log("hello");


var canvas = d3.select("globe"),
    width = canvas.property("width"),
    height = canvas.property("height"),
    context = canvas.getContext("2d");

console.log("hello");


var projection = d3.geoOrthographic()
    .scale((height - 10) / 2)
    .translate([width / 2, height / 2])
    .precision(0.1);

var path = d3.geoPath()
    .projection(projection)
    .context(context);

console.log("hello");

d3.json("https://unpkg.com/world-atlas@1/world/110m.json", function(error, world) {
  if (error) throw error;

  var sphere = {type: "Sphere"},
      land = topojson.feature(world, world.objects.land);

  render = function() {
    context.clearRect(0, 0, width, height);
    context.beginPath(), path(sphere), context.fillStyle = "#fff", context.fill();
    context.beginPath(), path(land), context.fillStyle = "#000", context.fill();
    context.beginPath(), path(sphere), context.stroke();
  };

  render();
});