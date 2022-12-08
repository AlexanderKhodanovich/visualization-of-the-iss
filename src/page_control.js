import {transform_iss} from "./draw_modules.js";
import {toggle_highlighting_events, toggle_tooltip_events, hide_tooltip} from "./tooltip.js";
import {toggle_selecting_events, hide_sidebar} from "./sidebar.js";
import {resize_globe} from "./globe.js";

var interactive = false;
var is_globe_displayed = true;

function is_interactive() {
    return interactive;
}

function on_start_click(data) {
    // now in interactive mode
    interactive = true;
    
    // get objects
    var svg = d3.select("svg.iss");
    var header = d3.select("div.header");
    var feed = d3.select("iframe.live_feed");
    var globe = d3.select("svg.globe");
    var stats = d3.select("div.iss_data");
    var slider = d3.select("div.vis_slider");
    var footer = d3.select("div.footer");
    is_globe_displayed = (+d3.select("label.switch input").attr("state") == 0);
    
    // fade out header
    header.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() {
            // hide Header
            header.style("display", "none"); 
            header.style("position", "absolute");
            
            // start interactive mode
            start_interactive(data);
        });
    
    // if feed is selected
    if (!is_globe_displayed) {
        // fade out feed
        feed.transition()
            .duration(500)
            .style("opacity", 0)
            .on("end", function() { feed.style("display", "none"); });
    }
    // if globe is selected
    else {
        // fade out globe
        globe.transition()
            .duration(500)
            .style("opacity", 0);
    }
    
    // fade out iss stats
    stats.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() { slider.style("display", "none"); });
    
    // fade out slider
    slider.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() { slider.style("display", "none"); });

    // fade out footer
    footer.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() { footer.style("display", "none"); });
}

function on_back_click(data) {
    // now in normal mode
    interactive = false;
    
    // get objects
    var iss = d3.select("svg.iss");
    var globe = d3.select("svg.globe")
    var g = d3.select("g.main")
    var bb = d3.select("div.back");
    var prompt = d3.select("div.prompt");

    // hide back button
    bb.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() { bb.style("display", "none"); });
    
    // hide prompt (if not already hidden)
    prompt.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() { prompt.style("display", "none"); });

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
                // then hide iss
                iss.style("display", "none");
                
                // and finally start normal mode
                start_normal(data);
            });
        });
    });
    
    // fade out globe
    globe.transition()
        .duration(200)
        .style("opacity", 0);
}

function start_normal(data) {
    // get objects
    var header = d3.select("div.header");
    var globe = d3.select("svg.globe");
    var feed = d3.select("iframe.live_feed");
    var stats = d3.select("div.iss_data");
    var slider = d3.select("div.vis_slider");
    var footer = d3.select("div.footer");
    
    // fade in header
    header.style("position", "relative");
    header.style("display", "block").transition()
        .duration(500)
        .style("opacity", 1)
        .on("end", function() {
            // move globe
            console.log("int", is_interactive());
            resize_globe(is_interactive());

            // if globe is selected
            if (is_globe_displayed) {
                // fade in globe
                globe.style("display", "block").transition()
                    .duration(500)
                    .style("opacity", 1);
            }
            // if feed is selected
            else {
                // fade in feed
                feed.style("opacity", 0).style("display", "block").transition()
                    .duration(500)
                    .style("opacity", 1);
            }
        });
    
    // fade in stats
    stats.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
    
    // fade in slider
    slider.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
    
    
    // fade in footer
    footer.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
}

function start_interactive(data) {
    // get objects
    var iss = d3.select("svg.iss");
    var globe = d3.select("svg.globe");
    var g = d3.select("g.main");
    
    // show iss
    iss.style("display", "block");

    // bring tooltip to front
    d3.select("g.tooltip").raise();
    
    // move globe
    resize_globe(is_interactive);
    
    // fade in globe
    globe.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
    
    // show ISS
    transform_iss(g, 0, 0, 2000).then(function() {
        // animate ISS
        data.animation.animate_all(50);

        data.animation.finished().then(function() {
            // show prompt 
            d3.select("div.prompt")
                .style("display", "block")
                .transition()
                .duration(500)
                .style("opacity", 1);
            
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
    var chartTitle = d3.select(".chartTitle")
    
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
                chartTitle.transition()
                    .duration(200)
                    .text("ISS Live Video Feed")
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
                chartTitle.transition()
                    .duration(200)
                    .text("ISS Live Location")
            });
    }
    
    // switch state
    d3.select("label.switch input").attr("state", ((state + 1) % 2));
    
}

function resize_feed() {
    // define constants
    const mgn_top = 400;
    const mgn_side = 20;
    const mgn_bottom = 180;
    
    // calculate
    var feed = d3.select("iframe.live_feed");
    const height = window.innerHeight - mgn_top - mgn_bottom;
    const width = Math.min((window.innerWidth - mgn_side*2), (height*16/9));
    const top = mgn_top;
    
    // set parameters
    feed.style("width", width + "px");
    feed.style("height", height + "px");
    feed.style("top", top + "px");
}

export {
    on_start_click,
    on_back_click,
    on_toggle_feature_click,
    resize_feed,
    is_interactive
};