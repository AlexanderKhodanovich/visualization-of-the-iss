function get_transform(transform) {
  var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttributeNS(null, "transform", transform);
  
  var matrix = g.transform.baseVal.consolidate().matrix;
  var {a, b, c, d, e, f} = matrix;
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * 180 / Math.PI,
    skewX: Math.atan(skewX) * 180 / Math.PI,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

function distance(p1, p2) {
    var l1 = Math.abs(p1.x - p2.x),
        l2 = Math.abs(p1.y - p2.y);
    
    return Math.sqrt(l1*l1 + l2*l2);
}

function get_center(obj) {
    var w = +obj.attr("width"),
        h = +obj.attr("height"),
        cx = +obj.attr("x") + w/2,
        cy = +obj.attr("y") + h/2;
    
    return {x:cx, y:cy};
}

function move_in_2d(target, x, y) {
    target
        .attr("x", x)
        .attr("y", y);
}

// calculates the new x and y as if the object is moved in 3d
function move_in_3d(x, y, d_arr) {
    // move along x axis in 3d
    x += Math.sin(Math.PI/3)*d_arr[0];
    y += Math.cos(Math.PI/3)*d_arr[0];
    
    // move along y axis in 3d
    x += Math.sin(Math.PI/3)*d_arr[1];
    y -= Math.cos(Math.PI/3)*d_arr[1];
    
    // move along z axis in 3d
    y -= d_arr[2];

    return [x, y];
}

function draw_axes(parent, axes, module, line_len=600) {
    // find center of the line
    var c = get_center(module);
    
    // init stuff
    var g = parent.append("g").attr("class", "axes"),
        line = d3.line()
            .x(function (d) { return d[0]; })
            .y(function (d) { return d[1]; });
    
    
    if (axes.includes("x")) {
        // find endpoints
        var points = [
            move_in_3d(c.x, c.y, [0, 0, 0]),
            move_in_3d(c.x, c.y, [line_len/2, 0, 0])
        ];
        // draw the line
        g.append("path")
            .attr("d", line(points))
        g.append("text")
            .attr("x", (points[1][0] + 4))
            .attr("y", (points[1][1] + 12))
            .text("X");
    }
    if (axes.includes("y")) {
        // find endpoints
        var points = [
            move_in_3d(c.x, c.y, [0, 0, 0]),
            move_in_3d(c.x, c.y, [0, line_len/2, 0])
        ];
        // draw the line
        g.append("path")
            .attr("d", line(points))
        g.append("text")
            .attr("x", (points[1][0] + 4))
            .attr("y", (points[1][1] - 3))
            .text("Y");
    }
    if (axes.includes("z")) {
        // find endpoints
        var points = [
            move_in_3d(c.x, c.y, [0, 0, 0]),
            move_in_3d(c.x, c.y, [0, 0, line_len/2])
        ];
        // draw the line
        g.append("path")
            .attr("d", line(points))
        g.append("text")
            .attr("x", (points[1][0] + - 7))
            .attr("y", (points[1][1] - 6))
            .text("Z");
    }
}

function draw_points(p_arr) {
    p_arr.forEach(p => {
        d3.select("svg").append("circle")
            .attr("cx", p.x)
            .attr("cy", p.y)
            .attr("r", 5)
            .style("fill", "red");
    });
}

export {
    get_transform,
    distance,
    get_center,
    move_in_2d,
    move_in_3d,
    draw_axes,
    draw_points
};