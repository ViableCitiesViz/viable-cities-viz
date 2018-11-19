//http://bl.ocks.org/lwhitaker3/9348e54d6d85d8e7a70d
//https://bl.ocks.org/ChumaA/385a269db46ae56444772b62f1ae82bf

//https://www.gps-coordinates.net/
var cities;
var width = 800,
    height = 535;

var zoom = d3.zoom()
    .scaleExtent([1, 100])
    .on("zoom.foo", zoomed2)
    .on("zoom.bar", zoomed);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_bubble")
    .style("opacity", 0);

var projection = d3.geoMercator()
    .rotate([5,-1])
    // .scale(950)
    .scale(500)
    // .center([29,62]) // X,Y or 21
    .center([15,58])
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("svg")
    .attr("width", "100%")
    .attr("height", height)
    // .append("rect")
    // .attr("width", "100%")
    // .attr("height", "100%")
    // .attr("fill", "pink")
    // .attr("fill","lightblue")
    .call(zoom);
    // .append("g")


var g = svg.append("g");                              // The map itself
var cities_container = svg.append("g")
          // .attr('width',"100%")
          // .attr("height","100%")
          .attr("class","circle_box");  // All corresponding circle_packings
var projects = svg.append("g");
var path_g = svg.append("g");

var cities_circles;
var project_circles;
var mock_data = {};
var project_coordinates = {
  "Stockholm" : {
    "x" : 18.068580800000063,
    "y" : 59.32932349999999
  },
  "Karlstad" : {
    "x" : 13.51149780000003,
    "y" : 59.4021806
  },
  "Borlänge" : {
    "x":15.433969,
    "y":60.484304
  },
  "Upplands Väsby" : {
    "x":17.92834,
    "y":59.51961
  },
  "Herrljunga" : {
    "x":13.0188387,
    "y":58.0780287
  },
  "Svalöv" : {
    "x":13.1018168,
    "y":55.9129296
  },
  "Mörbylånga" : {
    "x":16.3869163,
    "y":56.5237566
  },
  "Kiruna" : {
    "x" : 20.225282,
    "y" : 67.8558
  },
  "Umeå" : {
    "x" : 20.263035,
    "y" : 63.825847
  },
  "Göteborg" : {
    "x" : 11.97456,
    "y" : 57.70887
  },
  "Uppsala" : {
    "x" : 17.638926699999956,
    "y" : 59.85856380000001
  },
  "Lund" : {
    "x" : 13.191007300000024,
    "y" : 55.70466010000001
  },
  "Kungälv" : {
    "x" : 11.974031700000069,
    "y" : 57.86975400000001
  },
  "Kalmar" : {
    "x" : 16.35677910000004,
    "y" : 56.6634447
  },
  "Röstånga" : {
    "x" : 13.29325689999996,
    "y" : 56.0024903
  },
  "Malmö" : {
    "x":13.003822,
    "y":55.604981
  },
  "N/A" : {
    "x":18.068580800000063,
    "y":59.32932349999999
  }
};
var project_count_city = {};

var tooltip2 = d3.select("body").append("div")
    .attr("class", "tooltip_bubble2")
    .style("opacity", 0);


function zoomed() {
  g.attr("transform",  d3.event.transform);
}

function zoomed2(){
  // cities_circles.attr("transform",circle_transform(d3.event.transform));
  project_circles.attr("transform",project_transform(d3.event.transform));
  // cities_circles.attr("r",circle_size_increase);
  project_circles.attr("r",project_size_increase);
}

function circle_size_increase(d){
  // console.log(d3.event.transform);
  // console.log(this);
  // use THIS
  //-21776
  var i = d3.interpolateNumber(1, 20);
  var x = (d3.event.transform.y * -1)-2000;
  // console.log(x);
  if(x > 0){
    var t = x/21776;
    // console.log(i(t));
    return i(t);
    // console.log(d);
    // return
  }
  return 1;
}

function project_size_increase(d){
  //-21776
  var i = d3.interpolateNumber(4, 70);
  var x = (d3.event.transform.y * -1)-1000;
  if(x > 0){
    var t = x/21776;
    return i(t);
  }
  return 3;
}

function circle_transform(t) {
  return function(d) {
    // console.log(this.transform);
    var c = [this.getAttribute('cx'), this.getAttribute('cy')];
    var r = t.apply(c);
    var x = [r[0] - c[0], r[1]-c[1]];

    return "translate(" + x + ")";
  };
}

function project_transform(t) {
  return function(d) {
    // console.log(d);
    // console.log(this);
    // var c = project_coordinates[d.survey_answers.location];
    // var r = projection([c.x, c.y]);
    var r = [this.getAttribute('cx'), this.getAttribute('cy')];
    var x = t.apply(r);
    var a = [x[0] - r[0], x[1] - r[1]];

    // console.log(d);

    // console.log(this.classList);
    // if(this.classList.contains("open")){
    //   // console.log("H");
    //   return d3.event.transform;
    // }

    // console.log(this);
    // console.log(this.classList);

    // console.log(c);
    return "translate(" + a + ")";
  };
}

function load_map_components(){
  // var q = d3.queue();
  // d3.json("data/cities_updated2.json", function(error,data){
  //   var up_d = [];
  //   var t = 0;
  //   for(var i = 0; i < data.length; i++){
  //     if(data[i] != undefined){
  //       up_d[t] = data[i];
  //       t++;
  //     }
  //   }
  //   cities = up_d;
  //   cities_circles = cities_container.selectAll("circle")
  //      .data(cities).enter()
  //      .append("circle")
  //      .attr("id",function(d){return"circle-"+d.id})
  //      .attr("cx", function (d) { return projection([d.coordinates.x, d.coordinates.y])[0]; })
  //      .attr("cy", function (d) { return projection([d.coordinates.x, d.coordinates.y])[1]; })
  //      // .attr("cy","0")
  //      // .attr("cx","0")
  //      .attr("r", "1")
  //      .style("stroke-width", .2)
  //      .style("stroke", "#000")
  //      .attr("fill", function(d){
  //        // return "rgb(0,125,145)";
  //        return "black";
  //        // return "white";
  //      })
  //      .on("mouseover",handleMouseOverCircle)
  //      .on("mouseout",handleMouseOutCircle);
  //
  //
  //      function handleMouseOverCircle(d){
  //        tooltip.transition().style("opacity", .9);
  //        tooltip.html("<b>"+d.name + "</b>")
  //          .style("left", (d3.event.pageX) + "px")
  //          .style("top", (d3.event.pageY - 28) + "px")
  //          .style("max-width",  200 + "px");
  //      }
  //
  //      function handleMouseOutCircle(d){
  //         tooltip.transition().style("opacity", 0);
  //       }
  // });
  d3.json("data/mock-data-v5.json", function(error,data){
    mock_data = data.data;
    console.log(data.data);


    for(var i = 0; i < mock_data.length; i++){
      var city = mock_data[i].survey_answers.location;
      if(project_count_city[city] == undefined){
        project_count_city[city] = 1;
      } else {
        project_count_city[city] += 1;
      }
    }
    for(var i = 0; i < mock_data.length; i ++){
      if(project_count_city[mock_data[i].survey_answers.location]>1){
        mock_data[i].survey_answers.group = 1;
      } else {
        mock_data[i].survey_answers.group = 0;
      }
    }
    project_circles = projects.selectAll("circle")
       .data(data.data).enter()
       .append("circle");
    project_circles
       .attr("id",function(d){return"project-"+d.survey_answers.project_id})
       .attr("cx", function (d) { var c = project_coordinates[d.survey_answers.location]; return projection([c.x,c.y])[0];})
       .attr("cy", function (d) { var c = project_coordinates[d.survey_answers.location]; return projection([c.x,c.y])[1];})
       .attr("r", function(d){
         // if(d.survey_answers.group)
         return 3;
       })
       .classed("bubble","true")
       .style("stroke-width", .5)
       .style("stroke", "#000")
       .attr("fill", function(d){
        if(project_count_city[d.survey_answers.location]>1){
          return "purple";
        }
         return "#EA9A00";
       })
       .on('click',handleClick)
       .on('mouseover',handleMouseOverCircle)
       .on('mouseout',handleMouseOutCircle);

     function handleClick(d){
       console.log(d);
       console.log(this);
       var projects_in_city = [];
       var city = d.survey_answers.location;
       var old_cx_values = [];


      var siblings = project_circles.filter(function(d, i){
        if(d.survey_answers.location.match(city)){
          d3.select(this)
            .classed("open","true");
          return true;
        }
        return false;
      })
      .transition()
      .attr("cx",function(d,i){
        var c = 2*i;
        var cf = project_coordinates[d.survey_answers.location];
        cf =  projection([cf.x,cf.y])[0];
        return cf+c;
      })
      .attr("fill","#EA9A00");

       if(d.survey_answers.group == 0){
         $("#info_box_col").css("display","initial");
         // d3.select("#card_budget").enter()
         document.getElementById('project_title').innerHTML = d.survey_answers.project_title;
         document.getElementById('project_subtitle').innerHTML = d.survey_answers.project_type;
         document.getElementById('project_leader').innerHTML = d.survey_answers.project_organization;
         document.getElementById('budget').innerHTML = d.survey_answers.budget.funded;
         var dates = d.survey_answers.dates.start + " - "+ d.survey_answers.dates.end;
         document.getElementById('project_time').innerHTML = dates;

         var word_list = d.survey_answers.keywords;
         var words = "";
         for(var i = 0; i < word_list.length; i++){
           words += "<u>#" + word_list[i] + "</u> ";
         }
         // words+=""
         document.getElementById('project_keywords').innerHTML = words;
         document.getElementById('card_descriptive_text').innerHTML = d.survey_answers.description;
         if(d.survey_answers.website != undefined){
           document.getElementById('card_webesite_link').innerHTML = d.survey_answers.website;
         }
       }
       for(var i = 0; i < mock_data.length; i++){
         if(mock_data[i].survey_answers.location.match(city)){
           mock_data[i].survey_answers.group = 0;
         }
       }
     }

     function handleMouseOverCircle(d){
       var tx = ""
       if(project_count_city[d.survey_answers.location]>1 && d.survey_answers.group == 1){
         tx = "Click to see projects"
       } else{
         tx = "<b>" + d.survey_answers.location +"</b>\n<br>" + d.survey_answers.project_title;
       }
       tooltip2.transition().style("opacity", .9);
       tooltip2.html(tx)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
          .style("max-width",  200 + "px");
     }

     function handleMouseOutCircle(d){
        tooltip2.transition().style("opacity", 0);
      }
  });
  d3.json('data/europe.topo.json', function(error, europe){
    g.selectAll(".continent_Europe_subunits")
      .data(topojson.feature(europe, europe.objects.continent_Europe_subunits).features)
        .enter().append("path")
        .attr("class", function(d) {return "country-" + d.id;})
        .attr("d", path)
        .attr("fill",function(d){
          if(d.properties.geounit.match("Sweden")){
            return "#00A389";
            // return "#669966";
          }
          // return "#cdc";
          return "#97C28E"
        });

    g.append("path")
        .attr("stroke", "black")
        // .attr("fill","#cdc")
        // .attr("fill","#cdc")
        .attr("fill","#97C28E")
        .attr("stroke-width", 0.2)
        .attr("d", path(topojson.mesh(europe, europe.objects.continent_Europe_subunits, border)));
     function border(id0, id1) {
       if(id0.properties.geounit.match("Sweden")){
         return;
       }
      return function(a, b) {
        return a.id === id0 && b.id === id1
            || a.id === id1 && b.id === id0;
        return true;
      };
      }
  });
  d3.json("data/sweden.topo.json", function(error, sweden) {
    g.selectAll(".subunit")
        .data(topojson.feature(sweden, sweden.objects.subunits).features)
        .enter().append("path")
          .attr("class", function(d) {return "subunit-" + d.geounit;})
          .attr("d", path)
          // .attr("fill","#669966");
          .attr("fill","#00A389");
          // .attr("fill","#97C28E");
          // return "#97C28E";

       g.append("path")
           // .attr("stroke", "#404040")
           // .attr("stroke", "#669966")
           .attr("stroke","#00A389")
           // .attr("fill"," #669966")
           .attr("fill","#00A389")
           // .attr("fill","#97C28E")
           .attr("stroke-width", 0.2)
           .attr("d", path(topojson.mesh(sweden, sweden.objects.subunits, borders)));

     function borders(id0, id1) {
       // console.log(id0);
       // console.log(id1);
      return function(a, b) {
        // console.log(a);
        return a.id === id0 && b.id === id1
            || a.id === id1 && b.id === id0;
      };
    }
  });
}

function hide_text(r){
  if(r==1){
    document.getElementById('multi-proj').style.display = "none";
  } else if (r == 0){
    document.getElementById('info_box_col').style.display = "none";
  }
}

function show_project(proj_id){
  hide_text(1);
  $("#info_box_col").css("display","initial");
  // d3.select("#card_budget").enter()
  var d;
  for(var i = 0; i < mock_data.length; i++){
    if(mock_data[i].survey_answers.project_id == proj_id){
      d = mock_data[i];
    }
  }
  document.getElementById('project_title').innerHTML = d.survey_answers.project_title + "<span onclick=\"hide_text(0)\"style=\"float:right;cursor:pointer;\"><h1>X</h1></span>";
  document.getElementById('project_subtitle').innerHTML = d.survey_answers.project_type;
  document.getElementById('project_leader').innerHTML = d.survey_answers.project_organization;
  document.getElementById('budget').innerHTML = d.survey_answers.budget.funded;

}
