var width = 1300;
var height = 400;

//TODO: Jquery
function change_view(option) {
  $("#view_" + view_option).removeClass("active");
  $("#view_" + option).addClass("active");
  view_option = option;
  move_bubbles(option);
}

function omrade_view(d) {
  return omradeCenters[d.kategori].x;
}

function project_view(d) {
  var projs = d.projects;
  for (var i = 0; i < projs.length; i++) {
    if (projs[i] === project_no) {
      return projectSpace[1];
    }
  }
  return projectSpace[0];
}

function start_program() {
  var q = d3.queue();
  q.defer(d3.json, "../assets/data/partners.json");
  q.defer(d3.json, "../assets/data/mock-data-v10.json");

  q.awaitAll(function(error, data_list) {
    if (error) throw error;
    var str = "";
    // console.log(data_list[1].data);
    projspace_title[0] = "Partners";
    for (var i = 0; i < data_list[1].data.length; i++) {
      projspace_title[data_list[1].data[i].survey_answers.project_id] =
        data_list[1].data[i].survey_answers.project_title;
      str +=
        '<a class="dropdown-item" onclick="change_view_spec(2,' +
        data_list[1].data[i].survey_answers.project_id +
        ')" href="#">' +
        data_list[1].data[i].survey_answers.project_title +
        "</a>\n";
    }
    $("#dropdown_menu").html(str);
    chart(data_list[0]);
  });
}

function change_view_spec(opt, proj_opt) {
  $("#view_" + view_option).removeClass("active");
  $("#view_" + opt).addClass("active");
  view_option = opt;
  project_no = proj_opt;
  d3.select("#proj_text_change").text(projspace_title[project_no]);
  move_bubbles(opt);
}

// function combine_data(comp, dat){
//   $("#texta").text(JSON.stringify(comp));
// }

function create_omrade_titles() {
  var omradeData = d3.keys(omrade_titles);
  var years = g.selectAll(".omradeTitles").data(omradeData);

  years
    .enter()
    .append("text")
    .attr("class", "omradeTitles")
    .attr("display", "none")
    .attr("font-size", "20px")
    .attr("x", function(d) {
      return omrade_titles_x[d];
    })
    .attr("y", function(d) {
      return omrade_titles_y[d];
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      return omrade_titles[d];
    });
}

function create_project_titles() {
  var temp_str = { 0: "Partners", 1: "temp" };
  var projData = d3.keys(temp_str);
  var years = g.selectAll(".projTitles").data(projData);

  years
    .enter()
    .append("text")
    .attr("class", "projTitles")
    .attr("display", "none")
    .attr("font-size", "20px")
    .attr("x", function(d) {
      return projspace_title_x[d];
    })
    .attr("y", function(d) {
      return projspace_title_y[d];
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      return temp_str[d];
    })
    .filter(function(d) {
      if (d === 1) {
        return true;
      }
      return false;
    })
    .attr("font-size", "12px")
    .attr("id", "proj_text_change");
}

function toggle_title() {
  if (view_option === 1) {
    // console.log(view_option);
    $(".omradeTitles").css("display", "initial");
  } else {
    $(".omradeTitles").css("display", "none");
  }
  if (view_option === 2) {
    $(".projTitles").css("display", "initial");
  } else {
    $(".projTitles").css("display", "none");
  }
}

function legend_color(d) {
  if (1 == 1) {
    return helix_colors[d];
  }
}

function create_legend() {
  var t = svg.append("g").classed("legend", "true");
  // .attr('x',50);
  var spec_height = height + 100;
  var width_s = 80;
  var extra_width = 30;
  var xt = t.selectAll(".legend").data(d3.keys(omrade_titles));

  xt.enter()
    .append("rect")
    .attr("width", "10")
    .attr("height", "10")
    .attr("x", function(d) {
      return d * width_s + extra_width + 50;
    })
    .attr("y", spec_height)
    .attr("fill", function(d) {
      return legend_color(q_o[omrade_titles[d]]);
    })
    .classed("legend_rect", "true");
  // .text("hello");
  xt.enter()
    .append("text")
    // This is gross.
    .attr("x", function(d) {
      if (d === 0) {
        return d * width_s + extra_width + 92;
      }
      if (d === 1) {
        return d * width_s + extra_width + 86;
      }
      if (d === 2) {
        return d * width_s + extra_width + 86;
      }
      return d * width_s + extra_width + 110;
    })
    .attr("y", spec_height + 8)
    .text(function(d) {
      return omrade_titles[d];
    });
}

start_program();
