/*eslint-env browser*/          // removes local errors in brackets


function main() {
    // create main svg and draw modules
    var svg = create_svg();
    var [draw_promise, images] = draw_modules(svg.select("g.main"));
    
    // wait until modules are rendered
    draw_promise.then(data => {
        var animation = new Animation(data, images);
        
        //animation.init_leaves(10);
        
        // animate
        animation.animate();
        animation.animate();
        
        animation.animate(true);
        animation.animate(true);
    });
}

main();