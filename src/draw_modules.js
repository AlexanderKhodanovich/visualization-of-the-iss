import {move_in_2d, move_in_3d, get_center, distance, get_transform} from "./utils.js";
import {rescale_sidebar} from "./sidebar.js";

//--------------------------------------------------- Definitions ---------------------------------------------------//
// Constants
const path_images = "../data/images/";
const IMAGE_WIDTH = 550;
const IMAGE_HEIGHT = 550;

// width/height/center of the main g
var iss_scale = Math.min(window.innerWidth/2140, window.innerHeight/1080);
var margin = {left: 50, right: 50, top: 50, bottom: 50 }, 
    width = window.innerWidth - margin.left -margin.right,
    height = window.innerHeight - margin.top - margin.bottom;
var center = {x: width/2, y: height/2};
var iss_offset = {
    x: -30,
    y: 75
};

var module_centers = null;

//---------------------------------------------------- Functions ----------------------------------------------------//
function update_module_centers() {
    module_centers = null;
}

function resize_svg() {
    // resize svg
    d3.select("svg.iss")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
    
    // calculate new iss scale
    iss_scale = Math.min(window.innerWidth/2140, window.innerHeight/1080);

    // get main g
    var g = d3.select("g.main");
    
    // get old transform of the main g
    var t = get_transform(g.attr("transform"));
    
    // resize main g
    g.attr("transform", "translate(" +
           t.translateX + "," +
           t.translateY + ")" + " scale(" +
           iss_scale + ")");
    
    // resize sidebar
    rescale_sidebar();
}

function find_closest_module(data, point) {
    var d_arr = [];
    
    // calculate distances from mouse to image centers
    get_module_centers(data).forEach(p => {
        d_arr.push(distance(point, p));
    });
    
    // find and return the closest
    return d_arr.indexOf(Math.min(...d_arr));
}

function create_image(parent, image_name, w, h) {
    var new_g = parent
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

function transform_iss(g, dx, dy, duration = -1) {
    if (!duration || duration == -1)
        g.attr("transform", "translate(" +
           (margin.left + iss_offset.x + dx) + "," +
           (margin.top + iss_offset.y + dy) + ")" + " scale(" +
           iss_scale + ")");
    else {
        var done;
        var t_promise = new Promise(resolve => {
            done = resolve;
        });
        
        g.transition()
            .duration(duration)
            .ease(d3.easePoly)
            .attr("transform", "translate(" +
               (margin.left + iss_offset.x + dx) + "," +
               (margin.top + iss_offset.y + dy) + ")" + " scale(" +
               iss_scale + ")")
            .on("end", function() { done(); });
        
        return t_promise;
    }
}

function create_svg() {
    // create an empty svg
    var svg = d3.select("body")
        .append("svg")
        .attr("class", "iss")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
    var g_main = svg.append("g")
        .attr("class", "main")
    transform_iss(g_main, 0, 0);
}

function draw_modules(positions) {
    var g = d3.select("g.main");
    var images = [];
    
    // go over all modules
    for (let i = 38; i >= 0; i--) {
        // create image object for the module
        var m = create_image(g, "module_" + i + ".png", IMAGE_WIDTH, IMAGE_HEIGHT);

        // move the image to the correct place
        move_in_2d(m.select("image"), positions[i].x - IMAGE_HEIGHT/2, positions[i].y - IMAGE_WIDTH/2);

        // append image to the array
        images[i] = m;
    }
    
    // return the images
    return images;
}

function get_module_centers(data) {
    if (!module_centers) {
        module_centers = [];

        data.images.forEach((img, i) => {
            var raw_center = get_center(img.select("image"));
            module_centers.push({
                x: (raw_center.x + data.positions[i].x_offset)*iss_scale + margin.left + iss_offset.x,
                y: (raw_center.y + data.positions[i].y_offset)*iss_scale + margin.top + iss_offset.y
            });
        });
    }
    return module_centers;
}

//-------------------------------------------------------------------------------------------------------------------//
export {
    find_closest_module,
    create_svg,
    transform_iss,
    draw_modules,
    resize_svg,
    update_module_centers
}