/*eslint-env browser*/          // removes local errors in brackets

var animation = null;

function on_start_click() {
    // get objects
    var svg = d3.select("svg");
    var header = d3.select(".header");
    var footer = d3.select(".footer");
    
    // fade out header
    header.transition()
        .duration(1000)
        .style("opacity", 0)
        // once faded out
        .on("end", function() {
            // hide Header
            header.style("display", "none");

            // start interactive mode
            start_interactive(svg);
        });
    
    // fade out footer
    footer.transition()
        .duration(1000)
        .style("opacity", 0)
        .on("end", function() { footer.style("display", "none"); });
}

function on_back_click() {
    // get objects
    var svg = d3.select("svg");
    var g = d3.select("g.main")
    var bb = d3.select(".back");
    
    // hide back button
    bb.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() { bb.style("display", "none"); });
    
    // lock interactions
    is_highlighting_on = false;
    is_tooltip_on = false;
    is_selecting_on = false;
    
    // hide tooltip
    hide_tooltip();
    
    // fade out sidebar
    hide_sidebar().then(function() {
        // then reverse animate
        animation.animate_reverse();
        
        animation.finished().then(function() {
            // then move iss off screen
            transform_iss(g, -window.innerWidth*2, 0, 2000).then(function() {
                // then hide svg
                svg.style("display", "none");
                
                // and finally start normal mode
                start_normal();
            });
        });
    });
}

function start_normal() {
    // get objects
    var header = d3.select(".header");
    var footer = d3.select(".footer");
    
    // fade in header
    header.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1)
    
    // fade in footer
    footer.style("display", "block").transition()
        .duration(1000)
        .style("opacity", 1);
}

function start_interactive() {
    // get objects
    var svg = d3.select("svg");
    var g = d3.select("g.main");
    
    // show svg
    svg.style("display", "block");
    
    // bring tooltip to front
    d3.select("g.tooltip").raise();

    // show ISS
    transform_iss(g, 0, 0, 2000).then(function() {
        is_highlighting_on = true;
        is_tooltip_on = true;
        is_selecting_on = true;

        // animate ISS
        animation.animate_all(50);
        
        animation.finished().then(function() {
            d3.select(".back")
                .style("display", "block")
                .transition()
                    .duration(500)
                    .style("opacity", 1);
        });
    });
}

function main() {
    // create main svg
    create_svg();
    
    // get main g
    var g = d3.select("g.main");
    
    // init svg components
    init_tooltip()
    init_sidebar()
    
    // init iss and put it off screen
    var draw_promise = draw_modules(g);
    transform_iss(g, -window.innerWidth*2, 0);
    
    // after iss is rendered
    draw_promise.then(function(data) {
        positions = data;
        
        // init animation object
        animation = new Animation(500);
        
        // set on_click listeners
        d3.select(".header button").on("click", function() { on_start_click(); });
        d3.select(".back button").on("click", function() { on_back_click(); });
    });
}

main();