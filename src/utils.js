function move_in_2d(target, x, y) {
    target.select("image")
        .attr("x", x - IMAGE_WIDTH / 2)
        .attr("y", y - IMAGE_HEIGHT / 2);
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
    var w = +module.select("image").attr("width"),
        h = +module.select("image").attr("height"),
        cx = +module.select("image").attr("x") + w/2,
        cy = +module.select("image").attr("y") + h/2,
        c = {x: cx, y:cy };
    
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