/*eslint-env browser*/          // removes local errors in brackets


function main() {
        
    // create main svg and draw modules
    var svg = create_svg();
    var [draw_promise, images] = draw_modules(svg.select("g.main"));
    
    // wait until modules are rendered
    draw_promise.then(data => {
        d3.select("button")
            .on("click", function() {
                var header = document.getElementsByClassName("header")
                // Fade Out Header
                d3.select(".header")
                    .transition().duration(1000)
                    .ease(d3.easeLinear)
                    .style("opacity", 0)
                    // Once Faded Out...
                    .on("end", function() {
                            // Remove Header
                            header[0].remove()
                            // animate ISS
                            var animation = new Animation(data, images);
                            animation.animate_all(50); 
                            
                            // create tooltip
                            init_tooltip()
                            // Create sidebar
                            init_sidebar()
                        })

            });
        })

}

main();