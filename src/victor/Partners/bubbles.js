var width = 1300;
var height = 400;


// Titles displayed
var omrade_titles = {
  0: "Civilsamhälle",
  1: "Forskning",
  2: "Näringsliv",
  3: "Offentlig verksamhet"
};

// Convertion of title to id.
var q_o = {
   "Civilsamhälle" : 0,
   "Forskning" : 1,
   "Näringsliv": 2,
   "Offentlig verksamhet": 3
}

// Hover title.
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_bubble")
    .style("opacity", 0);

// Locations of sections on screen
var omradeCenters = {
  0: { x: width / 3, y: height / 2 },
  1: { x: width / 2, y: height / 2 },
  2: { x: 2 * width / 3, y: height / 2 },
  3: { x:250, y:0}
};
// Center of screen
var center = { x: width / 2, y: height / 2 };

// Hardcoded section titles
var omrade_titles_x = {
    3: 210,
    0: 415,
    1: 630,
    2: 890
};
var omrade_titles_y = {
  3: 100,
  0: 100,
  1: 100,
  2:50
};

// Location on screen
var projectSpace = {
  0 : 415,
  1 : 730
};

var projspace_title_x = {
  0: 410,
  1: 800
};

var projspace_title_y = {
  0: 35,
  1: 100
};

// Names of all projects in one object.
var projspace_title = {};

// Currently selected project
var project_no = -1;
var bubbles = null;   // Bubbles in object.
var nodes;            // Bubbles as nodes.
var zoom = d3.zoom()
    .scaleExtent([.2, 20])
    .on("zoom", zoomed);

var svg = d3.select("svg")
      .attr("width",width)
      .attr("height",height);

var g = svg.append("g");

var view_option = 0;

svg.call(zoom);

function zoomed() {
  g.attr("transform", d3.event.transform);
}

// sim
var forceStrength = 0.025;
var simulation = d3.forceSimulation()
  .velocityDecay(0.2)
  .force('x', d3.forceX().strength(forceStrength).x(center.x))
  .force('y', d3.forceY().strength(forceStrength).y(center.y))
  .force('charge', d3.forceManyBody().strength(charge))
  .on('tick', ticked);

simulation.stop();

// Moving
function charge(d) {
  // 2.15 works well
  return -Math.pow(d.radius, 2.0) * forceStrength;
}

function ticked() {
bubbles
  .attr('cx', function (d) { return d.x; })
  .attr('cy', function (d) { return d.y; });
}


// Node remapping and creation
function createNewNodes(rawData){
  var myNodes = rawData.map(function (d,i){
    return {
      id: (i),
      radius : 15,
      organisation: d.Organisation,
      value: Math.random() * 10,
      projects : d.Projects,
      kategori:convert_omrade(d.Kategori),
      x: Math.random() * 900,
      y: Math.random() * 800
    };
  });
  myNodes.sort(function (a,b){ return b.value - a.value; });
  return myNodes;
}

// Draws the chart.
function chart(rawData) {
  var maxAmount = d3.max(rawData, function (d) { return +d.total_amount; });

  var radiusScale = d3.scalePow()
    .exponent(0.5)
    .range([2, 85])
    .domain([0, maxAmount]);
  nodes = createNewNodes(rawData);
  bubbles = g.selectAll('.bubble')
    .data(nodes, function (d) { return d.id; });

  var bubblesE = bubbles.enter().append('circle')
    .classed('bubble', true)
    .attr('r', 0)
    // .style("stroke","black")
    .style("fill",function(d){ return mote_color(d);})
    // .attr
    .attr('stroke-width', .5)
    .attr('stroke',function(d){return helix_colors_borders[d.kategori]})
    // .attr('box-shadow','2px 2px')
    .on("mouseover",handleMouseOverCircle)
    .on("mouseout",handleMouseOutCircle);


  bubbles = bubbles.merge(bubblesE);

  bubbles.transition()
    .duration(2000)
    .attr('r', function (d) { return d.radius; });

  // Start simulation
  simulation.nodes(nodes);
  move_bubbles(0);

  create_omrade_titles();
  create_project_titles();


  // Move legedn elsewhere.
  create_legend();

  function handleMouseOverCircle(d){
    var id = d.id;
    this.parentNode.appendChild(this);
    d3.selectAll(".bubble")
      .filter(function(d){if(d.id==id){return false;}return true;})
      .transition()
        .style("opacity","0.3");

    tooltip.transition().style("opacity", .9);
    tooltip.html(d.organisation) //+ " " + omrade_titles[d.kategori])
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
      .style("max-width",  200 + "px");
  }

  function handleMouseOutCircle(d){
    tooltip.transition().style("opacity", 0);
    d3.selectAll(".bubble")
      .transition()
        .style("opacity","1");
  }
};

function move_bubbles(opt){
  if(opt == 0){
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
  } else if (opt == 1){
    simulation.force('x', d3.forceX().strength(forceStrength).x(omrade_view));
  } else if (opt == 2){
    simulation.force('x', d3.forceX().strength(forceStrength).x(project_view));
  }
  simulation.alpha(1).restart();
  toggle_title();
}

//TODO: Jquery
function change_view(option){
  $("#view_"+view_option).removeClass("active");
  $("#view_"+option).addClass("active");
  view_option = option;
  move_bubbles(option);
}

function convert_omrade(q_id){
  return q_o[q_id];
}
function omrade_view(d){
  return omradeCenters[d.kategori].x;
}

function project_view(d){
  var projs = d.projects;
  for(var i = 0; i< projs.length; i++){
    if(projs[i] == project_no){
      return projectSpace[1];
    }
  }
  return projectSpace[0];
}

function start_program(){
  var q = d3.queue();
  q.defer(d3.json, "data.json");
  q.defer(d3.json, "../data/mock-data-v7.json");

  q.awaitAll(function(error, data_list){
    if(error) throw error;
    var str = ""
    // console.log(data_list[1].data);
    projspace_title[0] = "Partners";
    for(var i = 0; i < data_list[1].data.length; i++){
      projspace_title[data_list[1].data[i].survey_answers.project_id] = data_list[1].data[i].survey_answers.project_title;
      str += "<a class=\"dropdown-item\" onclick=\"change_view_spec(2,"+data_list[1].data[i].survey_answers.project_id+")\" href=\"#\">" + data_list[1].data[i].survey_answers.project_title  + "</a>\n";
    }
    $("#dropdown_menu").html(str);
    chart(data_list[0]);
  });
}

function change_view_spec(opt, proj_opt){
  $("#view_"+view_option).removeClass("active");
  $("#view_"+opt).addClass("active");
  view_option = opt;
  project_no = proj_opt;
  d3.select("#proj_text_change").text(projspace_title[project_no]);
  move_bubbles(opt);
}

// function combine_data(comp, dat){
//   $("#texta").text(JSON.stringify(comp));
// }

function create_omrade_titles(){
  var omradeData = d3.keys(omrade_titles);
  var years = g.selectAll('.omradeTitles')
  .data(omradeData);

years.enter().append('text')
  .attr('class', 'omradeTitles')
  .attr('display','none')
  .attr('font-size','20px')
  .attr('x', function (d) { return omrade_titles_x[d]; })
  .attr('y', function(d){  return omrade_titles_y[d];})
  .attr('text-anchor', 'middle')
  .text(function (d) { return omrade_titles[d]; });
}

function create_project_titles(){
  var temp_str = {0 : "Partners", 1: "temp"};
  var projData = d3.keys(temp_str);
  var years = g.selectAll('.projTitles')
  .data(projData);

years.enter().append('text')
  .attr('class', 'projTitles')
  .attr('display','none')
  .attr('font-size','20px')
  .attr('x', function (d) { return projspace_title_x[d]; })
  .attr('y', function(d){  return projspace_title_y[d];})
  .attr('text-anchor', 'middle')
  .text(function (d) { return temp_str[d]; })
  .filter(function (d){
    if(d == 1){
      return true;
    }
    return false;
  })
  .attr('font-size','12px')
  .attr("id","proj_text_change");
}

function toggle_title(){
  if(view_option == 1){
    // console.log(view_option);
    $(".omradeTitles").css("display","initial");
  } else {
    $(".omradeTitles").css("display","none");
  }
  if(view_option == 2){
    $(".projTitles").css("display","initial");
  } else {
    $(".projTitles").css("display","none");
  }
}

var helix_colors = {
  0 : "#007d91",
  1 : "#EA9A00",
  2 : "#00A389",
  3 : "#97C28E"
}

var helix_colors_borders = {
  0 : "#007082",
  1 : "#d28a00",
  2 : "#00927b",
  3 : "#87ae7f"
}

function mote_color(d){
  if(1 == 1) {
    return helix_colors[d.kategori];
  }
}

function legend_color(d){
  if(1 == 1) {
    return helix_colors[d];
  }
}

function create_legend(){

  var t = svg.append("g")
  .classed('legend','true')
  // .attr('x',50);
  var spec_height = height + 100;
  var width_s = 80
  var extra_width = 30;
  var xt = t.selectAll('.legend')
    .data(d3.keys(omrade_titles));

  xt.enter().append('rect')
    .attr('width','10')
    .attr('height','10')
    .attr('x', function(d){
      return  (d*width_s) + extra_width + 50;
    })
    .attr('y',spec_height)
    .attr('fill',function(d){
      return legend_color(q_o[omrade_titles[d]]);
    })
    .classed('legend_rect','true');
    // .text("hello");
    xt.enter().append('text')
    // This is gross.
    .attr('x', function(d){
      if(d == 0){
        return (d*width_s) + extra_width + 92;
      }
      if(d == 1){
        return d*width_s+extra_width +86;
      }
      if(d == 2){
        return d*width_s+extra_width + 86;
      }
      return  d*width_s+extra_width + 110;
    })
    .attr('y',spec_height + 8)
    .text(function(d){
      return omrade_titles[d];
    });
}

start_program();
