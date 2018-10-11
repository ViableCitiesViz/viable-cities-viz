
var format = d3.format(",d");

var color = d3.scaleSequential(d3.interpolateMagma)
    .domain([-4, 4]);

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });


function create_circle_pack(svg, city, filename, location, p, w, h){
  // svg.attr("class","bubble");
  svg.append("g").attr("id",city+"_circles");
  d3.csv(filename,function(error, data) {
    if (error) throw error;

    var root = stratify(data)
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.value - a.value; });

    var pack = d3.pack()
        .size([w - 2, h - 2]);
        // .padding(.5);

    pack(root);
    // console.log(p);
    var node = svg.select("#" + city + "_circles")
      .selectAll("g")
      .data(root.descendants())
      .enter().append("g")
        .attr("transform", function(d) {; return "translate(" + d.x + "," + d.y + ")"; })
        // .attr("transform", function(d) { console.log(p.centreturn "translate(" + p.centroid(d) + ")"; })
        .attr("class", function(d) { return "node" + " node--" + (d.depth) + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
        // .attr("")
        .each(function(d) { d.node = this; })
        .on("mouseover", hovered(true))
        .on("mouseout", hovered(false))
        .on("click", clicked_bubble);

        // node.selectAll("node--2")

    node.append("circle")
        .attr("id", function(d) { return "node-" + d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.depth); });

    var leaf = node.filter(function(d) { return !d.children; });

    leaf.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.id; })
      .append("use")
        .attr("xlink:href", function(d) { return "#node-" + d.id + ""; });

    leaf.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
      .selectAll("tspan")
      .data(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g); })
      .enter().append("tspan")
        .attr("x", 0)
        .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
        .text(function(d) { return d; });

    node.append("title")
        .text(function(d) { return d.id + "\n" + format(d.value); });
    // $("#node-project").css("fill","green");
    svg.select("#" + city + "_circles")
      .attr("opacity","0.9")
      .attr("transform","translate("+(p[0]-(w/2))+","+(p[1]-(h/2))+")");

    function clicked_bubble(){
      $("#info_box_col").css("display","initial");
    }
  });

  function hovered(hover) {
    return function(d) {
      d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed("node--hover", hover);
    };
  }
}

function hide_text(){
  $("#info_box_col").css("display","none");
}
