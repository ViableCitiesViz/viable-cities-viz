import React, { Component} from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import europe from '../assets/data/europe.topo.json';
import sweden from '../assets/data/sweden.topo.json';
import cities from '../assets/data/cities.json';
import mockData from '../assets/data/mock-data-v7.json';
import project_coordinates from '../assets/data/project-coordinates.json';
import './Map.css';

class Map extends Component {

  constructor(props){
    super(props);
    this.margin = { top: 130, right: 20, bottom: 20, left: 160 };
    this.offset = { x: 0,  y: 0 };
  }


  // Render före compMount
  componentDidMount(){

    this.height = +this.svgWrapperRef.clientHeight - this.margin.top - this.margin.bottom;
    this.width = +this.svgWrapperRef.clientWidth - this.margin.left - this.margin.right;

    this.zoom = d3.zoom()
        .scaleExtent([1, 100])
        .on("zoom.foo", this.zoomed2.bind(this))
        .on("zoom.bar", () => {this.g.attr("transform",  d3.event.transform);});

    this.projection = d3.geoMercator()
        .rotate([5,-1])
        .scale(500)
        .center([15,58])
        .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath()
        .projection(this.projection);

    this.svg = d3.select(this.svgRef)
            .attr("width", this.width)
            .attr("height", this.height)
            .call(this.zoom);

    this.g = this.svg.append("g");                              // The map itself

    this.cities_container = this.svg.append("g")                // All the black dot cities
                          .classed("circle_box",true);

    this.projects = this.svg.append("g");                       // All the projects + cities

    // Tooltip for cities popup.
    this.tooltip = d3.select(this.svgWrapperRef).append("div")
        .attr("class", "tooltip_bubble")
        .style("opacity", 0);

    // Tooltip for projects popup
    this.tooltip2 = d3.select(this.svgWrapperRef).append("div")
        .attr("class", "tooltip_bubble2")
        .style("opacity", 0);

    // Tooltip for multi-proj.
    this.tooltip3 = d3.select(this.svgWrapperRef).append("div")
        .attr("class", "tooltip_bubble3")
        .attr("id","tooltip_bubble3")
        .style("opacity", 0);

    this.tooltip3_showed = 0;
    this.project_count_city = {};


    this.cities_circles = this.cities_container.selectAll("circle")
       .data(cities).enter()
       .append("circle")
       .attr("id",function(d){return"circle-"+d.id})
       .attr("cx", d => {return this.projection([d.coordinates.x, d.coordinates.y])[0]; })
       .attr("cy", d => { return this.projection([d.coordinates.x, d.coordinates.y])[1]; })
       .attr("r", 2)
       .attr("fill","black")
       .on("mouseover", d => {
         this.tooltip.transition("tooltip-1").style("opacity", .9);
         this.tooltip.html("<b>"+d.name + "</b>")
            .style("left", (d3.event.offsetX) + "px")
            .style("top", (d3.event.offsetY - 18) + "px")
            .style("max-width",  200 + "px");
       })
       .on("mouseout", d => { this.tooltip.transition().style("opacity", 0); });

      // Calculating # of projects per city.
      let length = mockData.data.length;
      for(var i = 0; i < length; i++){
        let city = mockData.data[i].survey_answers.location;
        if(this.project_count_city[city] === undefined){
          this.project_count_city[city] = 1;
        } else {
          this.project_count_city[city] += 1;
        }
      }

      for(var i = 0; i < length; i ++){
        if(this.project_count_city[mockData.data[i].survey_answers.location]>1){
          mockData.data[i].survey_answers.group = 1;
        } else {
          mockData.data[i].survey_answers.group = 0;
        }
      }

      this.project_circles = this.projects.selectAll("circle")
         .data(mockData.data)
         .enter()
         .append("circle");


      this.project_circles
         .attr("id",function(d){return"project-"+d.survey_answers.project_id})
         .attr("cx", d => { let c = project_coordinates[d.survey_answers.location]; return this.projection([c.x,c.y])[0];})
         .attr("cy", d => { let c = project_coordinates[d.survey_answers.location]; return this.projection([c.x,c.y])[1];})
         .attr("r", d => {
           let city = d.survey_answers.location;
           let a = this.project_count_city[city];
           return 3 + a;
         })
         .classed("bubble","true")
         .style("stroke-width", 1)
         .style("stroke","#4ca4b2")
         .attr("fill","#007d91")
         .on('mouseover', d => {
           let tx = ""
             if(this.project_count_city[d.survey_answers.location]>1 && d.survey_answers.group == 1){
               tx = "<b>"+ d.survey_answers.location +"</b><br>Multiple Projects"
             } else{
               tx = "<b>" + d.survey_answers.location +"</b>\n<br>" + d.survey_answers.project_title;
             }
             this.tooltip2.transition().style("opacity", .9);
             this.tooltip2.html(tx)
                .style("left", (d3.event.offsetX) + "px")
                .style("top", (d3.event.offsetY - 18) + "px")
                .style("max-width",  200 + "px");
              })
         .on('mouseout', d => { this.tooltip2.transition("check").style("opacity", 0);});

        //Europe
        this.g.selectAll(".continent_Europe_subunits")
          .data(topojson.feature(europe, europe.objects.europe).features)
            .enter().append("path")
            .attr("d", this.path)
            .attr("fill",'lightgrey');
        // Sweden
        this.g.selectAll('.continent_Sweden_subnits')
          .data(topojson.feature(sweden, sweden.objects.subunits).features)
          .enter().append("path")
          .attr("class", function(d) {return "country-" + d.id;})
          .attr("d", this.path)
          .attr("fill", 'grey');
  }

  componentDidUpdate() {

  }

  zoomed2(){
    this.cities_circles.attr("transform",this.circle_transform(d3.event.transform));
    this.project_circles.attr("transform",this.circle_transform(d3.event.transform));

    this.cities_circles.attr("r",this.circle_size_increase.bind(this));
    this.project_circles.attr("r",this.project_size_increase.bind(this));
  }

  circle_size_increase(d){
    let i = d3.interpolateNumber(2, 20);
    let x = (d3.event.transform.y * -1)-2000;
    if(x > 0){
      let t = x/21776;
      return i(t);
    }
    return 2;
  }

  // Projects increase after zoom in factor X.
  project_size_increase(d){
    let city = d.survey_answers.location;
    let a = this.project_count_city[city];
    let i = d3.interpolateNumber(3+a, 30*a);
    let x = (d3.event.transform.y * -1)-1000;
    if(x > 0){
      let t = x/21776;
      return i(t);
    }
    return 3 + a;
  }

  // Semantic transformation
  circle_transform(t) {
    return function(d) {
      let c = [this.getAttribute('cx'), this.getAttribute('cy')];
      let r = t.apply(c);
      let x = [r[0] - c[0], r[1]-c[1]];
      return "translate(" + x + ")";
    };
  }

  // Efter constructor
  render() {
    return (
      <div className="mapWrap" ref={svgWrapper => this.svgWrapperRef = svgWrapper}>
        <svg className="bubbles_svg_area" id="bubbles_svg_area" ref={svg => { this.svgRef = svg;}}></svg>
      </div>
    );
  }
}
export default Map;
