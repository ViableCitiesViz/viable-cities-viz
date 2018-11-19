//https://bl.ocks.org/maybelinot/5552606564ef37b5de7e47ed2b7dc099
var width = 480/12,
    height = 350/12,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

function create_sunburst(svga, city, projection){
  var coords = [];

  for(var i = 0; i < cities.length; i++){
    if(cities[i].name.match(city.location)){
      coords = [cities[i].coordinates.x, cities[i].coordinates.y];
    }
  }
  var _x = projection(coords)[0];
  var _y = projection(coords)[1];

  //
  d3.json("/data/projects/"+city.project_id+"_flare.json", function(error, root) {
    if (error) throw error;

   root = d3.hierarchy(root);
   root.sum(function(d) { return d.size; });
   var g = svga.append('g')
    .attr("id", city.name + "_projects")
    .attr("class","flare_module")
    g.append("g")
    .attr("transform","translate("+_x+", " + _y +")")
    .selectAll("path")
       .data(partition(root).descendants())
     .enter().append("path")
       .attr("d", arc)
       // .attr("stroke","#fff")
       .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
       .on("click", clicked)
     .append("title")
       .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });

        // function click(d) {
        //   svg.transition()
        //       .duration(750)
        //       .tween("scale", function() {
        //         var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        //             yd = d3.interpolate(y.domain(), [d.y, 1]),
        //             yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        //         return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
        //       })
        //     .selectAll("path")
        //       .attrTween("d", function(d) { return function() { return arc(d); }; });
        // }


      function clicked(){
        $("#info_box_col").css("display","initial");
      }
  });
}


d3.select(self.frameElement).style("height", height + "px");
