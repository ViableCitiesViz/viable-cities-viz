
// Matching ID/location
var states = {
  "null" : "-99",
  "GV" : "Gävleborg",
  "JO" : "Jönköping",
  "KA" : "Kalmar",
  "KO" : "Dalarna",
  "KR" : "Kronoberg",
  "OR" : "Örebro",
  "OG" : "Östergötland",
  "SD" : "Södermanland",
  "VM" : "Västermanland",
  "HA" : "Halland",
  "VR" : "Värmland",
  "JA" : "Jämtland",
  "NB" : "Norrbotten",
  "VN" : "Västernorrland",
  "VB" : "Västerbotten",
  "GT" : "Gotland",
  "ST" : "Stockholm",
  "UP" : "Uppsala",
  "BL" : "Blekinge",
  "VG" : "Västra Götaland",
  "SN" : "Skåne"
}

var width = 800,
    height = 535;

var zoom = d3.zoom()
    .scaleExtent([.8, 24])
    .on("zoom", zoomed);

var projection = d3.geoMercator()
    .rotate([5,-1])
    .scale(950)
    .center([29,62]) // X,Y or 21
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("svg")
    .attr("width", "100%")
    .attr("height", height);

var g = svg.append("g");                              // The map itself
var ga = svg.append("g").attr("class","circle_box");  // All corresponding circle_packings
// var ga = g.append("g");

svg.call(zoom);

// The g/ga can probably be combined a bit "better" into one g element.
function zoomed() {
  g.attr("transform", d3.event.transform);
  ga.attr("transform",d3.event.transform);
}

function load_map(){
  d3.json("/data/sweden.topo.json", function(error, sweden) {

    g.selectAll(".subunit")
        .data(topojson.feature(sweden, sweden.objects.subunits).features)
        .enter().append("path")
          .attr("class", function(d) {return "subunit " + d.id;})
          .attr("d", path)
          // .attr("fill", "#98FB98")
          .attr("fill","#cdc")
          // .attr("border","1px solid black")
          .each(function(d,i){
            if(d.id=="ST"){
              create_circle_pack(ga,"stockholm","/data/stockholm.csv",topojson.feature(sweden, sweden.objects.subunits).features,path.centroid(d),25,25);
            }
            if(d.id=="SN"){
              create_circle_pack(ga,"malmo","/data/malmo.csv",topojson.feature(sweden, sweden.objects.subunits).features,path.centroid(d),25,25);
            }
            if(d.id=="HA"){
              create_circle_pack(ga,"goteborg","/data/goteborg.csv",topojson.feature(sweden, sweden.objects.subunits).features,path.centroid(d),25,25);
            }
            if(d.id=="NB"){
              create_circle_pack(ga,"kiruna","/data/kiruna.csv",topojson.feature(sweden, sweden.objects.subunits).features,path.centroid(d),25,25);
            }
          });

    g.append("path")
     .attr("stroke", "black")
     .attr("fill","#cdc")
     .attr("stroke-width", 0.2)
     .attr("d", path(topojson.mesh(sweden, sweden.objects.subunits, border("ST", "UP"))));

     function border(id0, id1) {

      return function(a, b) {
        // return a.id === id0 && b.id === id1
        //     || a.id === id1 && b.id === id0;
        return true;
      };
      }
  });
}
