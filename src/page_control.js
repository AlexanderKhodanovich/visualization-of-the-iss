import {transform_iss} from "./draw_modules.js";
import {toggle_highlighting_events, toggle_tooltip_events, hide_tooltip} from "./tooltip.js";
import {toggle_selecting_events, hide_sidebar} from "./sidebar.js";

function on_start_click(data) {
    // get objects
    var svg = d3.select("svg.iss");
    var header = d3.select("div.header");
    var feature_div = d3.select("div.secondary_visualizations");
    var footer = d3.select("div.footer");

    // fade out header
    header.transition()
        .duration(1000)
        .style("opacity", 0)
    // once faded out
        .on("end", function() {
        // hide Header
        header.style("display", "none");

        // start interactive mode
        start_interactive(data);
    });
    
    // fade out feature div
    feature_div.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() { feature_div.style("display", "none"); });

    // fade out footer
    footer.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() { footer.style("display", "none"); });
}

function on_back_click(data) {
    // get objects
    var svg = d3.select("svg.iss");
    var g = d3.select("g.main")
    var bb = d3.select("div.back");

    // hide back button
    bb.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() { bb.style("display", "none"); });

    // lock interactions
    toggle_highlighting_events();
    toggle_tooltip_events();
    toggle_selecting_events();

    // hide tooltip
    hide_tooltip();

    // fade out sidebar
    hide_sidebar().then(function() {
        // then reverse animate
        data.animation.animate_reverse();

        data.animation.finished().then(function() {
            // then move iss off screen
            transform_iss(g, -window.innerWidth*2, 0, 2000).then(function() {
                // then hide svg
                svg.style("display", "none");

                // and finally start normal mode
                start_normal(data);
            });
        });
    });
}

function start_normal(data) {
    // get objects
    var header = d3.select("div.header");
    var feature_div = d3.select("div.secondary_visualizations")
    var footer = d3.select("div.footer");

    // fade in header
    header.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);

    // fade in globe
    feature_div.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
    
    // fade in footer
    footer.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
}

function start_interactive(data) {
    // get objects
    var svg = d3.select("svg.iss");
    var g = d3.select("g.main");

    // show svg
    svg.style("display", "block");

    // bring tooltip to front
    d3.select("g.tooltip").raise();

    // show ISS
    transform_iss(g, 0, 0, 2000).then(function() {

        // animate ISS
        data.animation.animate_all(50);

        data.animation.finished().then(function() {
            // show back button
            d3.select(".back")
                .style("display", "block")
                .transition()
                .duration(500)
                .style("opacity", 1)
                .on("end", function() {
                    // enable selecting/highlighting/tooltip
                    toggle_highlighting_events();
                    toggle_tooltip_events();
                    toggle_selecting_events();
                });
        });
    });
}

function on_toggle_feature_click() {
    // get objects
    var globe = d3.select("svg.globe");
    var feed = d3.select("iframe.live_feed");
    
    // get current state
    var state = +d3.select("label.switch input").attr("state");
    
    if (state == 0) {
        globe.transition()
            .duration(200)
            .style("opacity", 0)
            .on("end", function() {
                globe.style("display", "none");
                feed.style("display", "block").transition()
                    .duration(200)
                    .style("opacity", 1);
            });
    } else {
        feed.transition()
            .duration(200)
            .style("opacity", 0)
            .on("end", function() {
                feed.style("display", "none");
                globe.style("display", "block").transition()
                    .duration(200)
                    .style("opacity", 1);
            });
    }
    
    // switch state
    d3.select("label.switch input").attr("state", ((state + 1) % 2));
    
}

export {
    on_start_click,
    on_back_click,
    on_toggle_feature_click
};