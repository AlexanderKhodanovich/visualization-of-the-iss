/*eslint-env browser*/          // removes local errors in brackets


function main() {
    // create main svg and draw modules
    var svg = create_svg();
    var [draw_promise, images] = draw_modules(svg.select("g.main"));
    
    // wait until modules are rendered
    draw_promise.then(data => {
        // create tooltip
        init_tooltip();
        
        // animate
        var animation = new Animation(data, images);
        animation.animate_all(50);
    });
}

main();