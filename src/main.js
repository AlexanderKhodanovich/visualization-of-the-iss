import {init_sidebar} from "./sidebar.js";
import {init_tooltip} from "./tooltip.js";
import {create_svg, resize_svg, draw_modules, transform_iss} from "./draw_modules.js";
import {Animation} from "./animate_modules.js";
import {on_start_click, on_back_click} from "./page_control.js";
import {init_stars, resize_stars} from "./animate_stars.js";
import {init_globe} from "./globe.js";

const path_positions = "../data/positions.json";
const path_modules = "../data/modules.json";

function main(positions, modules) {
    // create main svg
    create_svg();
    
    // draw iss
    var images = draw_modules(positions);
    
    // create animation object
    var animation = new Animation(positions, images, 500);
    
    // put iss off screen
    transform_iss(d3.select("g.main"), -window.innerWidth*2, 0);
    
    // put data together
    var data = {
        positions: positions,
        modules: modules,
        images: images,
        animation: animation
    }

    // init svg components
    init_tooltip(data);
    init_sidebar(data);

    // set on_click listeners
    d3.select(".header button").on("click", function() { on_start_click(data); });
    d3.select(".back button").on("click", function() { on_back_click(data); });
}

// init star background
init_stars();

// init globe
init_globe();

// add listeners
document.addEventListener("click", function (event) {
    console.log("x : " + event.clientX + ", y : " + event.clientY);
});
addEventListener('resize', (event) => {
    resize_stars();
    resize_svg(event);
});

// parse positions and modules
Promise.all([d3.json(path_positions), d3.json(path_modules)]).then(([positions, modules]) => {
    // call main
    main(positions, modules);
});