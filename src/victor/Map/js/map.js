//http://bl.ocks.org/lwhitaker3/9348e54d6d85d8e7a70d
//https://bl.ocks.org/ChumaA/385a269db46ae56444772b62f1ae82bf

//https://www.gps-coordinates.net/
var cities;
// var width = 800;
    // height = 535;

// var height = document.body.clientHeight;
// var width = document.body.clientWidth;

var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;


var zoom = d3.zoom()
    .scaleExtent([1, 100])
    .on("zoom.foo", zoomed2)
    .on("zoom.bar", zoomed);

// Mercator projection is sensible for this project.
var projection = d3.geoMercator()
    .rotate([5,-1])
    // .scale(950)
    .scale(500)
    // .center([29,62]) // X,Y or 21
    .center([15,58])
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

// Base SVG element
var svg = d3.select("svg")
    .attr("width", "100%")
    .attr("height", height)
    .call(zoom);


var g = svg.append("g");                              // The map itself
var cities_container = svg.append("g")                // All the black dot cities
          .attr("class","circle_box");
var projects = svg.append("g");                       // All the projects + cities


var cities_circles;                                   // All cities as objects.
var project_circles;                                  // All Projects as objects.
var mock_data = {};                                   // All data.
// An array of projects and their coordinates.
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
  }
};
// Stores # of projects in all cities.
var project_count_city = {};


// Tooltip for cities popup.
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_bubble")
    .style("opacity", 0);

// Tooltip for projects popup
var tooltip2 = d3.select("body").append("div")
    .attr("class", "tooltip_bubble2")
    .style("opacity", 0);

// Tooltip for multi-proj.
var tooltip3 = d3.select("body").append("div")
    .attr("class", "tooltip_bubble3")
    .attr("id","tooltip_bubble3")
    .style("opacity", 0);

var tooltip3_showed = 0;

// Geometric zoom for map.
function zoomed() {
  g.attr("transform",  d3.event.transform);
}

// Semantic zooming for projects/cities.
// Individual transformations depending on attribute.
function zoomed2(){
  cities_circles.attr("transform",circle_transform(d3.event.transform));
  project_circles.attr("transform",circle_transform(d3.event.transform));

  cities_circles.attr("r",circle_size_increase);
  project_circles.attr("r",project_size_increase);
}

function circle_size_increase(d){
  var i = d3.interpolateNumber(2, 20);
  var x = (d3.event.transform.y * -1)-2000;
  if(x > 0){
    var t = x/21776;
    return i(t);
  }
  return 2;
}

// Projects increase after zoom in factor X.
function project_size_increase(d){
  var city = d.survey_answers.location;
  var a = project_count_city[city];
  var i = d3.interpolateNumber(3+a, 30*a);
  var x = (d3.event.transform.y * -1)-1000;
  if(x > 0){
    var t = x/21776;
    return i(t);
  }
  return 3 + a;
}

// Semantic transformation
function circle_transform(t) {
  return function(d) {
    var c = [this.getAttribute('cx'), this.getAttribute('cy')];
    var r = t.apply(c);
    var x = [r[0] - c[0], r[1]-c[1]];
    return "translate(" + x + ")";
  };
}

// Loads the map
// 4 Different d3 json components are loaded.
// City Dots, Projects, Europe, Sweden.
function load_map_components(){

  d3.json("/data/cities.json", function(error,data){
      cities = data;
      cities_circles = cities_container.selectAll("circle")
         .data(cities).enter()
         .append("circle")
         .attr("id",function(d){return"circle-"+d.id})
         .attr("cx", function (d) { return projection([d.coordinates.x, d.coordinates.y])[0]; })
         .attr("cy", function (d) { return projection([d.coordinates.x, d.coordinates.y])[1]; })
         .attr("r", 2)
         .attr("fill","black")
         .on("mouseover",handleMouseOverCircle)
         .on("mouseout",handleMouseOutCircle);

         function handleMouseOverCircle(d){
           tooltip.transition("tooltip-1").style("opacity", .9);
           tooltip.html("<b>"+d.name + "</b>")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px")
             .style("max-width",  200 + "px");
         }

         function handleMouseOutCircle(d){
            tooltip.transition().style("opacity", 0);
          }
  });

  // Mock Data loading!
  d3.json("/data/mock-data-v7.json", function(error,data){
    mock_data = data.data;

    // Calculating # of projects per city.
    for(var i = 0; i < mock_data.length; i++){
      var city = mock_data[i].survey_answers.location;
      if(project_count_city[city] == undefined){
        project_count_city[city] = 1;
      } else {
        project_count_city[city] += 1;
      }
    }
    // I don't remember if this is still used.
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
         var city = d.survey_answers.location;
         var a = project_count_city[city];
         return 3 + a;
       })
       .classed("bubble","true")
       .style("stroke-width", 1)
       // .style("stroke","#d28a00")
       // .attr("fill", "#EA9A00")
       .style("stroke","#4ca4b2")
       .attr("fill","#007d91")
       .on('click',handleClick)
       .on('mouseover',handleMouseOverCircle)
       .on('mouseout',handleMouseOutCircle);

     function handleClick(d){
       console.log(d);
       console.log(this);
       var projects_in_city = [];
       var city = d.survey_answers.location;
       var old_cx_values = [];

       if(d.survey_answers.group == 0){
         $("#info_box_col").css("display","initial");
         // d3.select("#card_budget").enter()
         var proj_id = d.survey_answers.project_id;
         document.getElementById('project_title').innerHTML = d.survey_answers.project_title;
         document.getElementById('project_subtitle').innerHTML = d.survey_answers.project_type;
         document.getElementById('project_leader').innerHTML = d.survey_answers.project_organization;
         document.getElementById('project_contact').innerHTML = "<a href='mailto:"+d.survey_answers.project_manager_email+"'>"+d.survey_answers.project_manager+"</a>";

         document.getElementById('budget').innerHTML = d.survey_answers.budget.funded;
         document.getElementById('proj-pic').innerHTML = "<img src=\'resources/thumbnails/"+pic_name[proj_id]+"\' />";

         var dates = d.survey_answers.dates.start + " - "+ d.survey_answers.dates.end;
         document.getElementById('project_time').innerHTML = dates;

         var word_list = d.survey_answers.keywords;
         var words = "";
         for(var i = 0; i < word_list.length; i++){
           words += "#<u>" + word_list[i] + "</u> ";
         }
         // words+=""
         document.getElementById('project_keywords').innerHTML = words;
         document.getElementById('card_descriptive_text').innerHTML = d.survey_answers.description;
         if(d.survey_answers.website != undefined){
           document.getElementById('card_webesite_link').innerHTML = d.survey_answers.website;
         }
       }

       if(d.survey_answers.group == 1){
         var tx = "<b>Projects</b><button onclick=\"console.log(5);\">hello</button><br><ol type='1'>";

         for(var i = 0; i < mock_data.length; i++){
           if(mock_data[i].survey_answers.location.match(city)){
             tx +=  "<li onclick=\"crash();\">"+mock_data[i].survey_answers.project_title +"</li>";
           }
         }
        tx +="</ol>";
         tooltip3.transition().style("opacity", 1);
         tooltip3.html(tx)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
         tooltip3_showed = 1;
            // .style("max-width",  200 + "px");
       }
       // for(var i = 0; i < mock_data.length; i++){
       //   if(mock_data[i].survey_answers.location.match(city)){
       //     mock_data[i].survey_answers.group = 0;
       //   }
       // }
     }

     function handleMouseOverCircle(d){
       var tx = ""
       if(project_count_city[d.survey_answers.location]>1 && d.survey_answers.group == 1){
         tx = "<b>"+ d.survey_answers.location +"</b><br>Click to see projects"
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
        tooltip2.transition("check").style("opacity", 0);
      }
  });

  // used to ensure Sweden loads ontop of Europe.
  var q = d3.queue();
  q.defer(d3.json, '/data/europe.topo.json');
  q.defer(d3.json, '/data/sweden.topo.json');

  q.awaitAll(function(error, data_list){
    var europe = data_list[0];
    var sweden = data_list[1];
    // Europe
    g.selectAll(".continent_Europe_subunits")
      .data(topojson.feature(europe, europe.objects.europe).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill",'lightgrey');
    // Sweden
    g.selectAll('.continent_Sweden_subnits')
      .data(topojson.feature(sweden, sweden.objects.subunits).features)
      .enter().append("path")
      .attr("class", function(d) {return "country-" + d.id;})
      .attr("d", path)
      .attr("fill", 'grey');
  });
}


// These functions are defunct in final version.
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

// About box.
var about_showed = 0;
function toggle_about(a){
  if(a == 0){
    d3.select(".about_box")
      .style("display","initial");
    d3.select(".inner_content")
      .classed("blurredElement",true);
  } else if(a == 1) {
    d3.select(".about_box")
      .style("display","none");
    d3.select(".inner_content")
      .classed("blurredElement",false);
  }
  about_showed = a;
}


window.addEventListener('click', function(e){
  if( about_showed == 1){
    if (document.getElementById('about_box').contains(e.target)){
      // Clicked in box
    } else{
      // Clicked outside the box
      if(!document.getElementById('about_tog').contains(e.target) && about_showed == 0){
        toggle_about(1);
      }
    }
  }


  if (document.getElementById('tooltip_bubble3').contains(e.target)){
    // Clicked in box
  } else{
    // Clicked outside the box
      // toggle_about(1);
      // console.log(tooltip3_showed);
      if(tooltip3_showed == 2){
        tooltip3.transition("check2").style("opacity", 0);
        tooltip3_showed = 0;
      }
      if(tooltip3_showed == 1){
        tooltip3_showed = 2;
      }
    }
});
