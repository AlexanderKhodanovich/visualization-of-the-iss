import {find_closest_module} from "./draw_modules.js";

// Constants
const path_images = "../data/sidebar_images/";
const path_icons = "../data/icons/";
const IMAGE_WIDTH = 550;
const IMAGE_HEIGHT = 550;

var is_selecting_on = false; 

function toggle_selecting_events() {
    is_selecting_on = !is_selecting_on;
}

function hide_sidebar() {
    d3.select(".module_selected")
        .attr("class", "module_normal");

    var done;
    var hide_promise = new Promise(resolve => {
        done = resolve;
    });

    d3.select("g.sidebar").transition()
        .duration(200)
        .attr("opacity", 0)
        .on("end", function() { done(); });

    // bring back live feed
    d3.select("iframe")
        .style("display", "none")
        .transition()
        .duration(200)
        .style("opacity", 1);

    return hide_promise;
}

function on_click_sidebar(data, e) {
    if (is_selecting_on) {
        var id = find_closest_module(data, {x: e.clientX, y: e.clientY});

        if (data.images[id].attr("class") == "module_highlighted"){
            // deselect previous module
            d3.select("g.module_selected")
                .attr("class", "module_normal");

            // select new module
            data.images[id].attr("class", "module_selected");

            var sidebar = d3.select("g.sidebar");

            // update title
            sidebar.select("text.title")
                .text(data.modules[id].name);
            
            // update image
            sidebar.select("image.module_image")
                .attr("xlink:href", path_images + `module_${id}.png`)
            
            // update owners
            sidebar.select("text.module_owners")
                .text(`${data.modules[id].owners}`)
            
            // update length
            sidebar.select("text.module_length")
                .text(`${data.modules[id].length.m} (${data.modules[id].length.ft})`)
            
            // update mass
            sidebar.select("text.module_mass")
                .text(`${data.modules[id].mass.kg} (${data.modules[id].mass.lb})`)
            
            // update diameter
            sidebar.select("text.module_diameter")
                .text(`${data.modules[id].diameter.m} (${data.modules[id].diameter.ft})`)
            
            // update assembly flight
            sidebar.select("text.assembly_flight")
                .text(`${data.modules[id].assemby_flight}`)
            
            // update launch_vehicle
            sidebar.select("text.launch_vehicle")
                .text(`${data.modules[id].launch_vehicle}`)

            // update launch_date
            sidebar.select("text.launch_date")
                .text(`${data.modules[id].launch_date}`)
            
            // update descritpion
            sidebar.select("foreignObject")
                .text(`${data.modules[id].description}`)
            
            // show sidebar
            sidebar.transition()
                .duration(200)
                .attr("opacity", 1);

            // hide live feed
            d3.select("iframe")
                .style("display", "none")
                .transition()
                .duration(200)
                .style("opacity", 0);
        }
    }
}

function rescale_sidebar() {
    var scale = window.innerWidth / 1920;
    var w = 400*scale;

    var sidebar = d3.select("g.sidebar")
    .attr("transform", ("translate(" + (window.innerWidth - w) + "," + 0 + ")"));

    sidebar.select("rect")
        .attr("width", w)
        .attr("height", window.innerHeight);

    sidebar.select("text.title")
        .attr("x", w/2)
        .attr("y", 60*scale);
}

function init_sidebar(data) {
    var scale = window.innerWidth / 1920;
    var w = 400*scale;

    var sidebar = d3.select("svg.iss").append("g")
        .attr("class", "sidebar")
        .attr("transform", ("translate(" + (window.innerWidth - w) + "," + 0 + ")"))
        .attr("opacity", "0");

    // Sidebar Background
    sidebar.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", window.innerHeight);
    
    // Hide Sidebar Button
    
    // On Hover
    var hover = sidebar.append("svg:image")
        .attr("class", "back_button")
        .attr("xlink:href", path_icons + "back_hover.png")
        .attr("x", "18.5%")
        .attr("y", "0.7%")
        .attr("width", "30")
        .attr("height", "30")
        .attr("style", "cursor:pointer")
        .style("opacity", "1")
    
    var back = sidebar.append("svg:image")
        .attr("class", "back_button")
        .attr("xlink:href", path_icons + "back.png")
        .attr("x", "18.5%")
        .attr("y", "0.7%")
        .attr("width", "30")
        .attr("height", "30")
        .attr("style", "cursor:pointer")
        .style("opacity", "1")
        .on("mouseover", function() {
            back.transition()
                .duration(200)
                .style("opacity", "0")
        })
        .on("mouseout", function() {
            back.transition()
                .duration(200)
                .style("opacity", "1")
        })
        .on("click", hide_sidebar)
        
    // ISS Module Name
    sidebar.append("text")
        .attr("class", "title")
        .attr("x", w/2)
        .attr("y", 60*scale)
        .text("Zvezda (Service Module)");
    
    // ISS Module Picture Border
    sidebar.append("rect")
        .attr("class", "imageBorder")
        .attr('fill', 'rgba(0,0,0,0)')
        .attr('stroke', '#2378ae')
        .attr("rx", "25px")
        .attr("x", 50*scale)
        .attr("y", 80*scale)
        .attr("width", 300)
        .attr("height", 300)
    
    // ISS Module Picture
    sidebar.append("svg:image")
        .attr("class", "module_image")
        .attr("xlink:href", path_images + "module_32.png")
        .attr("x", 50*scale)
        .attr("y", 80*scale)
        .attr("width", 300)
        .attr("height", 300)
    
    
    // ISS Module Owners
    sidebar.append("svg:image")
        .attr("xlink:href", path_icons + "owners.png")
        .attr("x", 50*scale)
        .attr("y", 400*scale)
        .attr("width", 20)
        .attr("height", 20)
    sidebar.append("text")
        .attr("class", "module_owners")
        .attr("x", 78*scale)
        .attr("y", 418*scale)
        .text("Owners: USA")
    
    // ISS Module Length
    sidebar.append("svg:image")
        .attr("xlink:href", path_icons + "length.png")
        .attr("x", 50*scale)
        .attr("y", 430*scale)
        .attr("width", 20)
        .attr("height", 20)
    sidebar.append("text")
        .attr("class", "module_length")
        .attr("x", 78*scale)
        .attr("y", 445*scale)
        .text("100m (100ft)")
    
    // ISS Module Weight
    sidebar.append("svg:image")
        .attr("xlink:href", path_icons + "weight.png")
        .attr("x", 200*scale)
        .attr("y", 400*scale)
        .attr("width", 20)
        .attr("height", 20)
    sidebar.append("text")
        .attr("class", "module_mass")
        .attr("x", 227*scale)
        .attr("y", 418*scale)
        .text("100kg (100lbs)")

    // ISS Module Diameter
    sidebar.append("svg:image")
        .attr("xlink:href", path_icons + "diameter.png")
        .attr("x", 200*scale)
        .attr("y", 430*scale)
        .attr("width", 20)
        .attr("height", 20)
    sidebar.append("text")
        .attr("class", "module_diameter")
        .attr("x", 227*scale)
        .attr("y", 445*scale)
        .text("100m (100ft)")
    
    // ISS Module Assembly Flight
    sidebar.append("text")
        .attr("class", "module_creation")
        .attr("x", 50*scale)
        .attr("y", 500*scale)
        .style("font-weight", "bold")
        .text("Assembly Flight")
    sidebar.append("text")
        .attr("class", "assembly_flight")
        .attr("x", 50*scale)
        .attr("y", 520*scale)
        .text("Canada")
    
    // ISS Module Launch Vehicle
    sidebar.append("text")
        .attr("class", "module_creation")
        .attr("x", 50*scale)
        .attr("y", 540*scale)
        .style("font-weight", "bold")
        .text("Launch Vehicle")
    sidebar.append("text")
        .attr("class", "launch_vehicle")
        .attr("x", 50*scale)
        .attr("y", 560*scale)
        .text("Warp Star")
    
    // ISS Module Launch Date
    sidebar.append("text")
        .attr("class", "module_creation")
        .attr("x", 50*scale)
        .attr("y", 580*scale)
        .style("font-weight", "bold")
        .text("Launch Date")
    sidebar.append("text")
        .attr("class", "launch_date")
        .attr("x", 50*scale)
        .attr("y", 600*scale)
        .text("1998-02-02")
    
    // ISS Module Description
    sidebar.append("svg:foreignObject")
        .attr("width", 300*scale)
        .attr("height", window.innerHeight)
        .attr("x", 50*scale)
        .attr("y", 640*scale)
        .style("font-family", "sans-serif")
        .style("font-size", ".69vw")
        .style("color", "white")
        .text("Zvezda (Russian: Звезда, meaning star), Salyut DOS-8, also known as the Zvezda Service Module, is a module of the International Space Station (ISS). It was the third module launched to the station, and provided all of the station's life support systems, some of which are supplemented in the US Orbital Segment (USOS), as well as living quarters for two crew members. It is the structural and functional center of the Russian Orbital Segment (ROS), which is the Russian part of the ISS. Crew assemble here to deal with emergencies on the station. The module was manufactured in the USSR by RKK Energia, with major sub-contracting work by GKNPTs Khrunichev. Zvezda was launched on a Proton launch vehicle on 12 July 2000, and docked with the Zarya module on 26 July 2000. (wikipedia)")
        
    document.querySelector("svg.iss").addEventListener("click", function(event) { on_click_sidebar(data, event); });
}

export {
    init_sidebar,
    rescale_sidebar,
    hide_sidebar,
    toggle_selecting_events
};