/*eslint-env browser*/          // removes local errors in brackets


function main() {
    // create main svg and draw modules
    var svg = create_svg();

    addEventListener('resize', (event) => {
//        svg.attr("width", window.innerWidth);
//        svg.attr("height", window.innerHeight);
    });

    var [draw_promise, images] = draw_modules(svg.select("g.main"));

    // wait until modules are rendered
    draw_promise.then(data => {
        var animation = new Animation(data, images);

        animation.animate([18], 50);
        animation.animate_all(50);
        //animation.animate_all(50);

        animation.animate_reverse();
        animation.animate_reverse();
        //animation.animate_reverse();
    });
}

main();