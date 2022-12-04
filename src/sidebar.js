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
    
    return hide_promise;
}

function on_click_sidebar(e) {
    console.log("clicked");
    if (is_selecting_on) {
        var id = find_closest_module({x: (e.clientX - margin.left - iss_offset.x), y: (e.clientY - margin.top - iss_offset.y)});

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
        }
    }
}

function init_sidebar() {
    var scale = window.innerWidth / 1920;
    var w = 400*scale;
    
    console.log(scale);
    var sidebar = d3.select("svg").append("g")
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
        var svg = document.querySelector("svg");
        var g = document.querySelector("g.main");
        svg.addEventListener("click", function(event) { on_click_sidebar(event); });
    });
}