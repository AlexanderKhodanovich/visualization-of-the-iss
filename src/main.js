/*eslint-env browser*/          // removes local errors in brackets

function start_interactive(svg, data) {
    // turn off scrolling
    document.body.classList.add("stop-scrolling");
    
    // create tooltip
    init_tooltip()
    // create sidebar
    init_sidebar()

    // show ISS
    transform_iss(svg.select("g.main"), 0, 0, 2000).then(function() {
        is_highlighting_on = true;
        is_tooltip_on = true;
        is_selecting_on = true;

        // animate ISS
        var animation = new Animation(data, images);
        animation.animate_all(50);
    });
}

function main() {
        
    // create main svg and draw modules
    var svg = create_svg();
    var g = svg.select("g.main");
    
    // draw modules and shift them off the screen (for future animation)
    var [draw_promise, images] = draw_modules(g);
    transform_iss(g, -window.innerWidth*2, 0);
    
    // wait until modules are rendered
    draw_promise.then(data => {
        d3.select("button")
            .on("click", function() {
                var header = d3.select(".header");
                // Fade Out Header
                header.transition()
                    .duration(1000)
                    .ease(d3.easeLinear)
                    .style("opacity", 0)
                    // Once Faded Out...
                    .on("end", function() {
                        // Remove Header
                        header.remove();
                    
                        // Start interactive mode
                        start_interactive(svg, data);
                    })

            });
        })

}

main();