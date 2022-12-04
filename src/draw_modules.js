/*eslint-env browser*/          // removes local errors in brackets


//--------------------------------------------------- Definitions ---------------------------------------------------//
// Constants
const IMAGE_WIDTH = 550;
const IMAGE_HEIGHT = 550;

// Data paths
path_positions = "../data/positions.json";
path_images = "../data/images/";

// Data vars
var images = [];
var positions = [];

// width/height/center of the main g
console.log(window.innerWidth, window.innerHeight);
var iss_scale = Math.min(window.innerWidth/2140, window.innerHeight/1080);
var margin = {left: 50, right: 50, top: 50, bottom: 50 }, 
    width = window.innerWidth - margin.left -margin.right,
    height = window.innerHeight - margin.top - margin.bottom;
var center = {x: width/2, y: height/2};
var iss_offset = {
    x: -30,
    y: 75*iss_scale
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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var g_main = svg.append("g")
        .attr("class", "main")
    transform_iss(g_main, 0, 0);
    return svg;
}

function draw_modules(g, dx=0) {
    // start parsing and get the promise
    var draw_promise = d3.json(path_positions);
    
    // draw modules once the promise is fulfilled
    draw_promise.then(function(data) {
        positions = data;
        for (let i = 38; i >= 0; i--) {
            if (data[i].x) {
                var m = create_image(g, "module_" + i + ".png", IMAGE_WIDTH, IMAGE_HEIGHT);
                move_in_2d(m, data[i].x, data[i].y);
                // preserves the order (so that id is the same as index)
                images[i] = m;   
            }
        }
    });
    
    // return the promise
    return draw_promise;
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