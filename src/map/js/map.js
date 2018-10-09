
var width = 400,
    height = 500;

var zoom = d3.zoom()
    .scaleExtent([.5, 8])
    .on("zoom", zoomed);

var projection = d3.geoMercator()
    .rotate([5,-1])
    .scale(950)
    .center([21,62]) // X,Y
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

function zoomed() {
  // g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
  // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
  g.attr("transform", d3.event.transform); // updated for d3 v4
}

svg.call(zoom);

d3.json("data/sweden.topo.json", function(error, sweden) {
  // console.log(error);
  // console.log(uk.objects);
  // svg.append("path")
  //     .datum(topojson.feature(uk, uk.objects.subunits))
  //     .attr("d", path);

  g.selectAll(".subunit")
      .data(topojson.feature(sweden, sweden.objects.subunits).features)
      .enter().append("path")
        .attr("class", function(d) {return "subunit " + d.id;})
        .attr("d", path)
        .each(function(d,i){
          if(d.id=="ST"){
            create_circle_pack(g,"data/test.csv",topojson.feature(sweden, sweden.objects.subunits).features,path.centroid(d),25,25);
          }
        });

        // console.log(topojson.feature(sweden, sweden.objects.subunits).features);
  g.append("g")
    .attr("class", "bubble");
  // .selectAll("circle")
  //   .data(topojson.feature(sweden, sweden.objects.subunits).features)
  // .enter().append("circle")
  //   .attr("class", "project_collection")
  //   .attr("id", function(d){return d.id})
  //   .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
  //   .attr("r", 1.5);

});
