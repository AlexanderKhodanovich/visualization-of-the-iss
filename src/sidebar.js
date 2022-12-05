path_modules = "../data/modules.json";
module_data = null;

var is_selecting_on = false;

function hide_sidebar() {
    d3.select(".module_selected")
        .attr("class", "module_normal");

    var done;
    var hide_promise = new Promise(resolve => {
        done = resolve;
    });

    d3.select("g.sidebar").transition()
        .duration(200)
        .attr("opacity", 0)
        .on("end", function() { done(); });

    // bring back live feed
    d3.select("iframe")
        .style("display", "none")
        .transition()
        .duration(200)
        .style("opacity", 1);

    return hide_promise;
}

function on_click_sidebar(e) {
    if (is_selecting_on) {
        var id = find_closest_module({x: e.clientX, y: e.clientY});

        if (images[id].attr("class") == "module_highlighted"){
            // deselect previous module
            d3.select("g.module_selected")
                .attr("class", "module_normal");

            // select new module
            images[id].attr("class", "module_selected");

            var sidebar = d3.select("g.sidebar");

            // update title
            sidebar.select("text.title")
                .text(module_data[id].name);

            // show sidebar
            sidebar.transition()
                .duration(200)
                .attr("opacity", 1);

            // hide live feed
            d3.select("iframe")
                .style("display", "none")
                .transition()
                .duration(200)
                .style("opacity", 0);
        }
    }
}

function rescale_sidebar() {
    var scale = window.innerWidth / 1920;
    var w = 400*scale;

    var sidebar = d3.select("g.sidebar")
    .attr("transform", ("translate(" + (window.innerWidth - w) + "," + 0 + ")"));

    sidebar.select("rect")
        .attr("width", w)
        .attr("height", window.innerHeight);

    sidebar.select("text.title")
        .attr("x", w/2)
        .attr("y", 60*scale);
}

function init_sidebar() {
    var scale = window.innerWidth / 1920;
    var w = 400*scale;

    console.log(scale);
    var sidebar = d3.select("#iss").append("g")
    .attr("class", "sidebar")
    .attr("transform", ("translate(" + (window.innerWidth - w) + "," + 0 + ")"))
    .attr("opacity", "0");

    sidebar.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", w)
        .attr("height", window.innerHeight);

    sidebar.append("text")
        .attr("class", "title")
        .attr("x", w/2)
        .attr("y", 60*scale)
        .text("Zvezda (Service Module)");

    d3.json(path_modules).then(function(data) {
        module_data = data;
        var svg = document.querySelector("#iss");
        var g = document.querySelector("g.main");
        svg.addEventListener("click", function(event) { on_click_sidebar(event); });
    });
}