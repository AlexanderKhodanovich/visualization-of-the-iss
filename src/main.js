/*eslint-env browser*/          // removes local errors in brackets

function on_start_click() {
    var svg = d3.select("svg");
    var header = d3.select(".header");
    // Fade Out Header
    header.transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .style("opacity", 0)
        // Once Faded Out...
        .on("end", function() {
            // Hide Header
            header.style("display", "none");

            // Start interactive mode
            start_interactive(svg);
        })
}

function start_normal() {
    
}

function start_interactive() {
    var g = d3.select("g.main");
    
    // turn off scrolling
    document.body.classList.add("stop-scrolling");
    
    // draw modules and shift them off the screen (for future animation)
    var [draw_promise, images] = draw_modules(g);
    transform_iss(g, -window.innerWidth*2, 0);
    
    // wait until modules are rendered
    draw_promise.then(data => {
        // bring tooltip to front
        d3.select("g.tooltip").raise();
        
        // show ISS
        transform_iss(g, 0, 0, 2000).then(function() {
            is_highlighting_on = true;
            is_tooltip_on = true;
            is_selecting_on = true;

            // animate ISS
            var animation = new Animation(positions, images);
            animation.animate_all(50);
        });
    });
}

function main() {
        
    // create main svg
    create_svg();
    
    // init svg components
    init_tooltip()
    init_sidebar()
    
    // set on_click listener for start button
    d3.select("button").on("click", function() { on_start_click(); });
}

main();