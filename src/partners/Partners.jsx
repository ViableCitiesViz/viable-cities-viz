import React, { Component } from "react";
import * as d3 from "d3";
import "./Bubbles.css";
import mockData from "../assets/data/mock-data-v10.json";
import partners from "../assets/data/partners.json";
import debounce from "lodash.debounce";

class Partners extends Component {
  constructor(props) {
    super(props);
    this.omrade_titles = {
      0: "Civilsamhälle",
      1: "Forskning",
      2: "Näringsliv",
      3: "Offentlig verksamhet"
    };

    this.helix_colors = {
      0: "#007d91",
      1: "#EA9A00",
      2: "#00A389",
      3: "#97C28E"
    };

    this.helix_colors_borders = {
      0: "#007082",
      1: "#d28a00",
      2: "#00927b",
      3: "#87ae7f"
    };

    this.margin = { top: 130, right: 20, bottom: 20, left: 160 };
    this.offset = { x: 0, y: 0 };
    // Hardcoded section titles
    this.omrade_titles_x = {
      3: 70,
      0: 255,
      1: 400,
      2: 570
    };
    this.omrade_titles_y = {
      3: 70,
      0: 70,
      1: 70,
      2: 50
    };

    // Location on screen
    this.projectSpace = {
      0: 415,
      1: 730
    };
    this.projspace_title_x = {
      0: 410,
      1: 800
    };
    this.projspace_title_y = {
      0: 10,
      1: 80
    };

    this.project_no = "-1"; // Changed to string because project_id is now string!
    this.bubbles = null; // Bubbles in object.
    this.nodes = {}; // Bubbles as nodes.
    this.view_option = 0;

    this.forceStrength = 0.025;

    this.createNewNodes = this.createNewNodes.bind(this);
  }

  componentDidMount() {
    // console.log("heck");
    this.height =
      +this.svgWrapperRef.clientHeight - this.margin.top - this.margin.bottom;
    this.width =
      +this.svgWrapperRef.clientWidth - this.margin.left - this.margin.right;
    // console.log(this.svgWrapperRef.clientHeight);
    this.tooltip = d3
      .select(this.svgWrapperRef)
      .append("div")
      .attr("class", "tooltip_bubble_partners")
      .style("opacity", 0);

    // $("#dropdown_menu").html(str);

    this.button_collection = d3
      .select(this.svgWrapperRef)
      .append("div")
      .classed("button_collection", true);

    this.normal_button = this.button_collection
      .append("div")
      .classed("button", true)
      .classed("overview_button", true)
      .classed("button_selected", true)
      .on("click", () => {
        d3.selectAll(".button").classed("button_selected", false);
        this.normal_button.classed("button_selected", true);
        this.move_bubbles(0);
      })
      .text("Översikt");
    this.helix_button = this.button_collection
      .append("div")
      .classed("button", true)
      .classed("helix_button", true)
      .on("click", () => {
        d3.selectAll(".button").classed("button_selected", false);
        this.helix_button.classed("button_selected", true);
        this.move_bubbles(1);
      })
      .text("Quadruple Helix");

    this.expand_button = this.button_collection
      .append("div")
      .classed("button", true)
      .classed("expand_button", true)
      .on("click", () => {
        d3.selectAll(".button_collections").style("display", "initial");
      })
      .text("Projekt ↓ ");

    this.nodes = this.createNewNodes(partners);

    this.projspace_title = {};
    this.projspace_title[0] = "Partners";
    for (var i = 0; i < mockData.data.length; i++) {
      this.projspace_title[mockData.data[i].survey_answers.project_id] =
        mockData.data[i].survey_answers.project_title;
    }

    // !!!!!!!!!!
    // This is good code. Just needs to be placed elsewhere.
    this.button_collections = d3
      .select(this.svgWrapperRef)
      .append("div")
      .classed("button_collections", true)
      // .style('width','100%')
      .style("background-color", "lightgrey");
    this.button_collections
      .append("h2")
      .text("Projekt")
      .style("margin-top", "2px");
    this.project_buttons = this.button_collections
      .append("div")
      .selectAll("div")
      .data(mockData.data);
    this.project_buttons
      .enter()
      .append("div")
      // .text('hey')
      .classed("buttons", true)
      .classed("project_button", true)
      // .text( d => {console.log(d); return "gaga"});
      .on("click", d => {
        this.change_view_spec(2, d.survey_answers.project_id);
        d3.selectAll(".button_collections").style("display", "none");
        d3.selectAll(".button").classed("button_selected", false);
        this.expand_button.classed("button_selected", true);
      })
      .on("mouseover", function(d) {
        d3.select(this).style("background-color", "white");
      })
      .on("mouseout", function(d) {
        d3.select(this).style("background-color", "lightgrey");
      })
      .html(d => {
        return d.survey_answers.project_title + "<br>";
      });
    // !!!!!!!!!!

    this.omradeCenters = {
      0: { x: 255, y: 0 },
      1: { x: 400, y: 0 },
      2: { x: 570, y: 0 },
      3: { x: 70, y: 0 }
    };

    this.center = { x: this.width / 2, y: this.height / 2 };

    // this.projspace_title = {};
    this.scaleLegendDebounce = debounce(() => this.updateScaleLegend(), 200);
    this.zoom = d3
      .zoom()
      .scaleExtent([0.2, 20])
      .on("zoom.transform", () => {
        this.g.attr("transform", d3.event.transform);
      })
      .on("zoom.legend", this.scaleLegendDebounce);

    this.svg = d3
      .select(this.svgRef)
      .attr("width", this.width)
      .attr("height", this.height)
      .call(this.zoom);
    this.updateScaleLegend();
    this.svg.on("click", () => {
      if (d3.event.target.class !== "project_button") {
        // this.projectNavigator.goToRoot(this.props.history, this.props.location);
        d3.selectAll(".button_collections").style("display", "none");
      }
    });
    this.g = this.svg.append("g");

    this.simulation = d3
      .forceSimulation()
      .velocityDecay(0.2)
      .force(
        "x",
        d3
          .forceX()
          .strength(this.forceStrength)
          .x(this.center.x)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(this.forceStrength)
          .y(this.center.y)
      )
      .force("charge", d3.forceManyBody().strength(this.charge.bind(this)))
      .on("tick", this.ticked.bind(this));

    this.simulation.stop();
    this.maxAmount = d3.max(mockData, d => {
      return +d.total_amount;
    });

    this.radiusScale = d3
      .scalePow()
      .exponent(0.5)
      .range([2, 85])
      .domain([0, this.maxAmount]);

    // console.log(mockData);
    this.bubbles = this.g.selectAll(".bubble").data(this.nodes, d => {
      return d.id;
    });

    this.bubblesE = this.bubbles
      .enter()
      .append("circle")
      .classed("bubble", true)
      .attr("r", 0)
      .style("fill", d => {
        return this.helix_colors[d.kategori];
      })
      .attr("stroke-width", 0.5)
      .attr("stroke", d => {
        return this.helix_colors_borders[d.kategori];
      })
      .on("mouseover", d => {
        let id = d.id;
        // this.parentNode.appendChild(this);
        d3.selectAll(".bubble")
          .filter(function(d) {
            if (d.id === id) {
              return false;
            }
            return true;
          })
          .transition()
          .style("opacity", "0.3");

        this.tooltip.transition().style("opacity", 0.9);
        this.tooltip
          .html(d.organisation) //+ " " + omrade_titles[d.kategori])
          .style("left", d3.event.offsetX + "px")
          .style("top", d3.event.offsetY - 28 + "px")
          .style("max-width", 200 + "px");
      })
      .on("mouseout", d => {
        this.tooltip.transition().style("opacity", 0);
        d3.selectAll(".bubble")
          .transition()
          .style("opacity", "1");
      });

    this.bubbles = this.bubbles.merge(this.bubblesE);

    this.bubbles
      .transition("start")
      .duration(2000)
      .attr("r", d => {
        return d.radius;
      });

    // Start simulation
    this.simulation.nodes(this.nodes);
    this.move_bubbles(0);

    let omradeData = d3.keys(this.omrade_titles);
    this.years = this.g.selectAll(".omradeTitles").data(omradeData);

    this.years
      .enter()
      .append("text")
      .attr("class", "omradeTitles")
      .attr("display", "none")
      .attr("font-size", "20px")
      .attr("x", d => {
        return this.omrade_titles_x[d];
      })
      .attr("y", d => {
        return this.omrade_titles_y[d];
      })
      .attr("text-anchor", "middle")
      .text(d => {
        return this.omrade_titles[d];
      });

    this.temp_str = { 0: "Partners", 1: "temp" };
    let projData2 = d3.keys(this.temp_str);
    this.projTitlesObj = this.g.selectAll(".projTitles").data(projData2);

    this.projTitlesObj
      .enter()
      .append("text")
      .attr("class", "projTitles")
      .attr("display", "none")
      .attr("font-size", "20px")
      .attr("x", d => {
        return this.projspace_title_x[d];
      })
      .attr("y", d => {
        return this.projspace_title_y[d];
      })
      .attr("text-anchor", "middle")
      .text(d => {
        return this.temp_str[d];
      })
      .filter(function(d) {
        if (d === 1) {
          return true;
        }
        return false;
      })
      .attr("font-size", "12px")
      .attr("id", "proj_text_change");

    // Move legedn elsewhere.
    // create_legend();
  }

  move_bubbles(opt) {
    if (opt === 0) {
      this.simulation.force(
        "x",
        d3
          .forceX()
          .strength(this.forceStrength)
          .x(this.center.x)
      );
    } else if (opt === 1) {
      this.simulation.force(
        "x",
        d3
          .forceX()
          .strength(this.forceStrength)
          .x(this.omrade_view.bind(this))
      );
    } else if (opt === 2) {
      this.simulation.force(
        "x",
        d3
          .forceX()
          .strength(this.forceStrength)
          .x(this.project_view.bind(this))
      );
    }
    this.view_option = opt;
    this.simulation.alpha(1).restart();
    this.toggle_title(opt);
  }

  toggle_title(opt) {
    if (opt === 1) {
      d3.selectAll(".omradeTitles").attr("display", "initial");
    } else {
      d3.selectAll(".omradeTitles").attr("display", "none");
    }
    if (opt === 2) {
      d3.selectAll(".projTitles").attr("display", "initial");
    } else {
      d3.selectAll(".projTitles").attr("display", "none");
    }
  }
  omrade_view(d) {
    return this.omradeCenters[d.kategori].x;
  }

  project_view(d) {
    let projs = d.projects;
    for (var i = 0; i < projs.length; i++) {
      if (projs[i] === this.project_no) {
        return this.projectSpace[1];
      }
    }
    return this.projectSpace[0];
  }
  charge(d) {
    return -Math.pow(d.radius, 2.0) * this.forceStrength;
  }

  ticked() {
    this.bubbles
      .attr("cx", d => {
        return d.x;
      })
      .attr("cy", d => {
        return d.y;
      });
  }

  change_view_spec(opt, proj_opt) {
    this.view_option = opt;
    this.project_no = proj_opt;
    d3.select("#proj_text_change").text(this.projspace_title[proj_opt]);
    this.move_bubbles(opt);
  }

  componentDidUpdate() {}

  createNewNodes(rawData) {
    let q_o = {
      Civilsamhälle: 0,
      Forskning: 1,
      Näringsliv: 2,
      "Offentlig verksamhet": 3
    };
    let myNodes = rawData.map(function(d, i) {
      return {
        id: i,
        radius: 15,
        organisation: d.Organisation,
        value: Math.random() * 10,
        projects: d.Projects,
        kategori: q_o[d.Kategori],
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });
    myNodes.sort(function(a, b) {
      return b.value - a.value;
    });
    return myNodes;
  }

  updateScaleLegend() {
    const scaleFactor = d3.zoomTransform(this.svg.node()).k;
    this.props.updateScaleData([{ r: 15 * scaleFactor, label: "1 partner" }]);
  }

  render() {
    return (
      <div
        className="partnerWrap"
        ref={svgWrapper => (this.svgWrapperRef = svgWrapper)}
      >
        <svg
          className="partner_svg_area"
          id="partner_svg_area"
          ref={svg => {
            this.svgRef = svg;
          }}
        ></svg>
      </div>
    );
  }
}

export default Partners;
