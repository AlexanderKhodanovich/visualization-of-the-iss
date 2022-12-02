/*eslint-env browser*/          // removes local errors in brackets


//--------------------------------------------------- Definitions ---------------------------------------------------//
// Constants
const SCALE_FACTOR = 0.25;
const IMAGE_WIDTH = 2200 * SCALE_FACTOR;
const IMAGE_HEIGHT = 2200 * SCALE_FACTOR;

const SVG_WIDTH = window.innerWidth;
const SVG_HEIGHT = window.innerHeight;


// Data paths
path_positions = "../data/positions.json";
path_images = "../data/images/";

// Data vars
var images = [];
var positions = [];
var prev_highlighted = -1;

// width/height/center of the main g
var margin = {left: 50, right: 50, top: 0, bottom: 0 }, 
    width = SVG_WIDTH - margin.left -margin.right,
    height = SVG_HEIGHT - margin.top - margin.bottom;
var center = {x: width/2, y: height/2};
var offset_to_center = {
    x: (center.x - 3300 * SCALE_FACTOR),
    y: (center.y - 1700 * SCALE_FACTOR)
};

//---------------------------------------------------- Functions ----------------------------------------------------//
function offset(target, x_offset, y_offset) {
    var dx = (+target.select("image").attr("x")) + x_offset;
    var dy = (+target.select("image").attr("y")) + y_offset;
    target.select("image")
        .attr("x", dx)
        .attr("y", dy);
}

function on_mousemove_highlight(e) {
    p_mouse = {x: (e.clientX - margin.left), y: (e.clientY - margin.top)};
    d_arr = [];
    
    // calculate distances from mouse to image centers
    get_module_centers().forEach(p => {
        d_arr.push(distance(p_mouse, p));
    });
    
    // find the closest
    var id = d_arr.indexOf(Math.min(...d_arr));
    if (prev_highlighted != -1 && images[prev_highlighted].attr("class") == "module_highlighted")
        images[prev_highlighted].attr("class", "module_normal");
    
    images[id].attr("class", "module_highlighted");
    prev_highlighted = id;
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

function draw_modules(g) {
    // start parsing and get the promise
    var draw_promise = d3.json(path_positions);
    
    // draw modules once the promise is fulfilled
    draw_promise.then(function(data) {
        positions = data;
        for (let i = 38; i >= 0; i--) {
            if (data[i].x) {
                var m = create_image(g, "module_" + i + ".png", IMAGE_WIDTH, IMAGE_HEIGHT);
                move_in_2d(m, data[i].x * SCALE_FACTOR + offset_to_center.x, data[i].y * SCALE_FACTOR + offset_to_center.y);
                // preserves the order (so that id is the same as index)
                images[i] = m;   
            }
        }
        
        // set up highlighting listener
        document.querySelector("g").addEventListener("mousemove", function(event) {
            on_mousemove_highlight(event);
        });
    });
    
    // return the promise
    return [draw_promise, images];
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