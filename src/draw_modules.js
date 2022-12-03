/*eslint-env browser*/          // removes local errors in brackets


//--------------------------------------------------- Definitions ---------------------------------------------------//
// Constants
const IMAGE_WIDTH = 550;
const IMAGE_HEIGHT = 550;

const SVG_WIDTH = window.innerWidth;
const SVG_HEIGHT = window.innerHeight;


// Data paths
path_positions = "../data/positions.json";
path_images = "../data/images/";

// Data vars
var images = [];
var positions = [];

// Flags
is_highlighting_on = false;

// width/height/center of the main g
var margin = {left: 50, right: 50, top: 0, bottom: 0 }, 
    width = SVG_WIDTH - margin.left -margin.right,
    height = SVG_HEIGHT - margin.top - margin.bottom;
var center = {x: width/2, y: height/2};
var offset_to_center = {
    x: (center.x - 825),
    y: (center.y - 425)
};

//---------------------------------------------------- Functions ----------------------------------------------------//
function find_closest_module(point) {
    d_arr = [];
    
    // calculate distances from mouse to image centers
    get_module_centers().forEach(p => {
        d_arr.push(distance(point, p));
    });
    
    // find and return the closest
    return d_arr.indexOf(Math.min(...d_arr));
}

function on_mousemove_highlight(e) {
    if (is_highlighting_on) {
        var id = find_closest_module({x: (e.clientX - margin.left), y: (e.clientY - margin.top)});

        d3.select("g.module_highlighted").attr("class", "module_normal");

        if (images[id].attr("class") == "module_normal")
            images[id].attr("class", "module_highlighted")
    }
}

function on_mouseout_highlight(e) {
    var id = find_closest_module({x: (e.clientX - margin.left), y: (e.clientY - margin.top)});
    d3.select("g.module_highlighted").attr("class", "module_normal");
}

function create_image(parent, image_name, w, h) {
    new_g = parent
        .append("g")
        .attr("class", "module_normal")

    new_g
        .append("svg:image")
        .attr("x", center.x - w/2)
        .attr("y", center.y - h/2)
        .attr("width", w)
        .attr("height", h)
        .attr("xlink:href", (path_images + image_name));
    
    return new_g;
}

function create_svg() {
    // create an empty svg
    var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g_main = svg.append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    return svg;
}

function draw_modules(g, dx=0) {
    // start parsing and get the promise
    var draw_promise = d3.json(path_positions);
    
    // shift the whole thing for future animation
    g.attr("transform", "translate(" + (margin.left + dx) + "," + margin.top + ")");
    
    // draw modules once the promise is fulfilled
    draw_promise.then(function(data) {
        positions = data;
        for (let i = 38; i >= 0; i--) {
            if (data[i].x) {
                var m = create_image(g, "module_" + i + ".png", IMAGE_WIDTH, IMAGE_HEIGHT);
                move_in_2d(m, data[i].x + offset_to_center.x, data[i].y + offset_to_center.y);
                // preserves the order (so that id is the same as index)
                images[i] = m;   
            }
        }
        
        // set up highlighting listener
        document.querySelector("g").addEventListener("mousemove", function(event) { on_mousemove_highlight(event); });
        document.querySelector("g").addEventListener("mouseout", function(event) { on_mouseout_highlight(event); });
    });
    
    // return the promise
    return [draw_promise, images];
}

function show_iss(g, dx, duration) {
    var done;
    var show_promise = new Promise(resolve => {
        done = resolve;
    });
    
    g.transition()
        .duration(duration)
        .ease(d3.easePoly)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .on("end", function() { done(); });
    
    return show_promise;
}

function get_module_centers() {
    var centers = [];
    
    images.forEach((img, i) => {
        var raw_center = get_center(img.select("image"));
        centers.push({
            x: raw_center.x + positions[i].x_offset,
            y: raw_center.y + positions[i].y_offset
        });
    });
    
    return centers;
}

//------------------------------------------------------ Code -------------------------------------------------------//
document.addEventListener("click", function (event) {
    console.log("x : " + event.clientX + ", y : " + event.clientY);
});

//-------------------------------------------------------------------------------------------------------------------//