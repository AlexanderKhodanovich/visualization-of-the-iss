path_modules = "../data/modules.json";
module_data = null;

function on_mousemove_tt(e) {
    p_mouse = {x: (e.clientX - margin.left), y: (e.clientY - margin.top)};
    d_arr = [];
    
    // calculate distances from mouse to image centers
    get_module_centers().forEach(p => {
        d_arr.push(distance(p_mouse, p));
    });
    
    // find the closest
    var id = d_arr.indexOf(Math.min(...d_arr));
    
    // update title
    var tt = d3.select("g.tooltip");
    tt.select("text.title")
        .text(module_data[id].name);
}

function init_tooltip(scale=1) {
    var tooltip = d3.select("svg").append("g")
        .attr("class", "tooltip")
        .attr("transform", ("scale(" + scale + ")"));
    
    tooltip.append("polygon")
        .attr("points", ("0,0 " + "0,577 " + "1000,0"));
        
    tooltip.append("text")
        .attr("class", "title")
        .attr("x", 40)
        .attr("y", 60)
        .text("Zvezda (Service Module)");
    
    d3.json(path_modules).then(function(data) {
        module_data = data;
        var g = document.querySelector("g.main");
        g.addEventListener("mousemove", function(event) { on_mousemove_tt(event); });
    });
}