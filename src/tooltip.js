var is_tooltip_on = false;
var is_highlighting_on = false;

function hide_tooltip() {
    d3.select("g.module_highlighted")
        .attr("class", "module_normal");
    d3.select("g.tooltip")
        .attr("opacity", 0);
}

function on_mousemove_tt(e) {
    if (is_highlighting_on) {
        var id = find_closest_module({x: (e.clientX - margin.left - iss_offset.x), y: (e.clientY - margin.top - iss_offset.y)});

        d3.select("g.module_highlighted").attr("class", "module_normal");

        if (images[id].attr("class") == "module_normal")
            images[id].attr("class", "module_highlighted")
    }
    
    if (is_tooltip_on) {
        var id = find_closest_module({x: (e.clientX - margin.left - iss_offset.x), y: (e.clientY - margin.top - iss_offset.y)});
        var center = get_center(images[id].select("image"));

        var tt = d3.select("g.tooltip"),
            tt_dx = 50,
            tt_dy = -50;

        tt.select("text")
            .attr("dx", center.x + tt_dx)
            .attr("dy", center.y + tt_dy)
            .text(module_data[id].name);

        var w = tt.select("text").node().getComputedTextLength();

        tt.select("rect")
            .attr("x", center.x + tt_dx)
            .attr("y", center.y + tt_dy)
            .attr("width", w + 30);

        tt.transition()
            .duration(200)
            .attr("opacity", 1);
    }
}

function on_mouseout_tt(e) {
    var id = find_closest_module({x: (e.clientX - margin.left - iss_offset.x), y: (e.clientY - margin.top - iss_offset.y)});
    d3.select("g.module_highlighted").attr("class", "module_normal");
    
    var tt = d3.select("g.tooltip");
    tt.transition()
        .duration(200)
        .attr("opacity", 0);
}

function init_tooltip() {
    var tt = d3.select("g").append("g")
        .attr("class", "tooltip")
        .attr("opacity", 0);
    
    tt.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 100)
        .attr("height", 30);
    
    tt.append("text")
        .attr("x", 15)
        .attr("y", 22)
        .attr("dx", 0)
        .attr("dy", 0)
        .text("Name");
    
    // set up highlighting listener
    document.querySelector("g").addEventListener("mousemove", function(event) { on_mousemove_tt(event); });
    document.querySelector("g").addEventListener("mouseout", function(event) { on_mouseout_tt(event); });
}