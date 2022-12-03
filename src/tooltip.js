path_modules = "../data/modules.json";
module_data = null;

var is_selecting_on = false;
var is_tooltip_on = false;

function on_click_sidebar(e) {
    if (is_selecting_on) {
        var id = find_closest_module({x: (e.clientX - margin.left), y: (e.clientY - margin.top)});

        if (images[id].attr("class") == "module_normal") {
            // deselect current module
            d3.select("g.module_selected")
                      .attr("class", "module_normal");

            // hide sidebar
            d3.select("g.sidebar").transition()
                .duration(200)
                .attr("opacity", 0);
        } else if (images[id].attr("class") == "module_highlighted"){
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

function on_mousemove_tt(e) {
    if (is_tooltip_on) {
        var id = find_closest_module({x: (e.clientX - margin.left), y: (e.clientY - margin.top)});
        var center = get_center(images[id].select("image"));

        var tt = d3.select("g.tooltip"),
            tt_dx = 100,
            tt_dy = -50;

        tt.select("text")
            .attr("dx", center.x + tt_dx)
            .attr("dy", center.y + tt_dy)
            .text(module_data[id].name);

        var w = tt.select("text").node().getComputedTextLength();

        tt.select("rect")
            .attr("x", center.x + tt_dx)
            .attr("y", center.y + tt_dy)
            .attr("width", w + 30);



        tt.transition()
            .duration(200)
            .attr("opacity", 1);
    }
}

function on_mouseout_tt(e) {
    var tt = d3.select("g.tooltip");
    tt.transition()
        .duration(200)
        .attr("opacity", 0);
}

function init_sidebar(scale=1) {
    var sidebar = d3.select("svg").append("g")
        .attr("class", "sidebar")
        .attr("transform", ("scale(" + scale + ")"))
        .attr("opacity", "0");
    
    sidebar.append("polygon")
        .attr("points", ("0,0 " + "0,577 " + "1000,0"));
        
    sidebar.append("text")
        .attr("class", "title")
        .attr("x", 40)
        .attr("y", 60)
        .text("Zvezda (Service Module)");
    
    d3.json(path_modules).then(function(data) {
        module_data = data;
        var svg = document.querySelector("svg");
        var g = document.querySelector("g.main");
        svg.addEventListener("click", function(event) { on_click_sidebar(event); });
        g.addEventListener("mousemove", function(event) { on_mousemove_tt(event); });
        g.addEventListener("mouseout", function(event) { on_mouseout_tt(event); });
    });
}

function init_tooltip() {
    var tt = d3.select("svg").append("g")
        .attr("class", "tooltip")
        .attr("opacity", 0);
    
    tt.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 100)
        .attr("height", 30);
    
    tt.append("text")
        .attr("x", 15)
        .attr("y", 22)
        .attr("dx", 0)
        .attr("dy", 0)
        .text("Name");
}