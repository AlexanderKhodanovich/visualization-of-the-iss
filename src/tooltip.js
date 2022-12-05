import {get_center} from "./utils.js";
import {find_closest_module} from "./draw_modules.js";

var is_tooltip_on = false;
var is_highlighting_on = false;

function toggle_tooltip_events() {
    is_tooltip_on = !is_tooltip_on;
}

function toggle_highlighting_events() {
    is_highlighting_on = !is_highlighting_on;
}

function hide_tooltip() {
    d3.select("g.module_highlighted")
        .attr("class", "module_normal");
    d3.select("g.tooltip")
        .attr("opacity", 0);
}

function on_mousemove_tt(data, e) {
    if (is_highlighting_on) {
        var id = find_closest_module(data, {x: e.clientX, y: e.clientY});

        d3.select("g.module_highlighted").attr("class", "module_normal");

        if (data.images[id].attr("class") == "module_normal")
            data.images[id].attr("class", "module_highlighted")
    }
    
    if (is_tooltip_on) {
        var id = find_closest_module(data, {x: e.clientX, y: e.clientY});
        var center = get_center(data.images[id].select("image"));

        var tt = d3.select("g.tooltip"),
            tt_dx = 50,
            tt_dy = -50;
        tt.select("text")
            .attr("dx", center.x + tt_dx)
            .attr("dy", center.y + tt_dy)
            .text(data.modules[id].name);

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

function on_mouseout_tt(data, e) {
    var id = find_closest_module(data, {x: e.clientX, y: e.clientY});
    d3.select("g.module_highlighted").attr("class", "module_normal");
    
    var tt = d3.select("g.tooltip");
    tt.transition()
        .duration(200)
        .attr("opacity", 0);
}

function init_tooltip(data) {
    var tt = d3.select("g.main").append("g")
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
    document.querySelector("g.main").addEventListener("mousemove", function(event) { on_mousemove_tt(data, event); });
    document.querySelector("g.main").addEventListener("mouseout", function(event) { on_mouseout_tt(data, event); });
}

export {
    init_tooltip,
    hide_tooltip,
    toggle_highlighting_events,
    toggle_tooltip_events
};