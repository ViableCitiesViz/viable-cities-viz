import React, { Component} from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import { withRouter } from 'react-router-dom';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import europe from '../assets/data/europe.topo.json';
import sweden from '../assets/data/sweden.topo.json';
import cities from '../assets/data/cities-v2.json';
import mockData from '../assets/data/mock-data-v8.json';
import project_coordinates from '../assets/data/project-coordinates.json';
import './Map.css';
import ProjectNavigator from '../ProjectNavigator';
import debounce from 'lodash.debounce';


class Map extends Component {

  constructor(props){
    super(props);
    this.margin = { top: 130, right: 20, bottom: 20, left: 160 };
    this.offset = { x: 0,  y: 0 };
    this.projectNavigator = new ProjectNavigator('/map');

  }


  // Render före compMount
  componentDidMount(){

    this.height = +this.svgWrapperRef.clientHeight - this.margin.top - this.margin.bottom;
    this.width = +this.svgWrapperRef.clientWidth - this.margin.left - this.margin.right;

    this.scaleLegendDebounce = debounce(() => this.updateScaleLegend(), 200);
    this.zoom = d3.zoom()
        .scaleExtent([1, 100])
        .on("zoom.foo", this.zoomed2.bind(this))
        .on("zoom.bar", () => {this.g.attr("transform",  d3.event.transform);})
        .on("zoom.legend", this.scaleLegendDebounce);
        // .on(this.updateData, this.zoomed2.bind(this));
        // console.log(this.zoom);
    this.projection = d3.geoMercator()
        .rotate([5,-1])
        // .scale(500)
        // .center([15,58])
        .scale(900)
        .center([20,63])
        .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath()
        .projection(this.projection);

    this.multiple_projects_box = d3.select(this.svgWrapperRef).append("div")
        .classed("multiple_projects_box",true)
        .style("opacity", 0);
    this.svg = d3.select(this.svgRef)
            .attr("width", this.width)
            .attr("height", this.height)
            .call(this.zoom);

    this.svg.on('click', () => {
      if (d3.event.target.tagName !== 'circle') {
        this.projectNavigator.goToRoot(this.props.history, this.props.location);
        this.multiple_projects_box.transition().style('opacity',0);
        this.multiple_projects_box.text("");
      }
    });

    this.updateScaleLegend();

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
       .attr("r", 1.2)
       .attr("fill","black")
       .on("mouseover", d => {
         this.tooltip.transition("tooltip-1").style("opacity", .9);
         this.tooltip.html("<b>"+d.name + "</b>")
            .style("left", (d3.event.offsetX) + "px")
            .style("top", (d3.event.offsetY - 18) + "px")
            .style("max-width",  200 + "px");
       })
       .on("mouseout", d => { this.tooltip.transition().style("opacity", 0); });

       this.updateData(this.props.filteredData);
        //Europe
        this.g.selectAll(".continent_Europe_subunits")
          .data(topojson.feature(europe, europe.objects.europe).features)
            .enter().append("path")
            .attr("d", this.path)
            .attr("fill",'#e4e4e4');
        // Sweden
        this.g.selectAll('.continent_Sweden_subnits')
          .data(topojson.feature(sweden, sweden.objects.subunits).features)
          .enter().append("path")
          .attr("class", function(d) {return "country-" + d.id;})
          .attr("d", this.path)
          .attr("fill", '#bdbdbd'); //https://www.color-hex.com/color/d3d3d3#shades-tints
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(prevProps);
    // console.log(prevState);
    // console.log(this.props.filteredData);
    // this.updateHovered(this.state.hoveredProject, prevState.hoveredProject);
    this.updateClicked(this.props, prevProps);

    if (!isEqual(this.props.filteredData, prevProps.filteredData)) {
      this.updateData(this.props.filteredData);
      // this.setState({
        // hoveredProject: null
      // });
      this.projectNavigator.goToRoot(this.props.history, this.props.location);
    }
  }

  updateClicked(props, prevProps){
    let projectId = ProjectNavigator.GetProjectId(props.location);
    let prevProjectId = ProjectNavigator.GetProjectId(prevProps.location);

    // if we just started, (i.e. navigated to the site via a permalink with a project id)
    // the projectId and prevProjectId will be identical because of how prevProps.location works
    // so change it to -1.
    if (!this.projectNavigator.hasChangedSinceInit()) {
      prevProjectId = -1;
      this.projectNavigator.change();
    }

    if (projectId === prevProjectId) return;

    // necessary only if clicking a project changes svgWrapper size (i.e. infobox takes up more or less space than before)
    // if ((projectId === -1 && prevProjectId !== -1) || (projectId !== -1 && prevProjectId === -1))
      // this.draw();

    // if no project in path, we done
    if (projectId === -1) return;

    // if the project from the url doesn't exist in filteredData, redirect to root
    if (!this.projectNavigator.projectExists(props.location, props.filteredData)) {
      this.projectNavigator.redirectToRoot(props.history);
      return;
    }
  }

  updateData(dat){

    var mockData_real = [];
    let tetra = dat.data.length;
    for(var i = 0; i < tetra; i++){
      var da = dat.data[i].survey_answers;
      var leng = da.locations.length;
      for(var j = 0; j < leng; j++){
        var obj = {};
        //https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
        obj.survey_answers = JSON.parse(JSON.stringify(da));
        obj.survey_answers.location = da.locations[j];
        mockData_real.push(obj);
      }
    }
    var loc_circles = [];
    let tetr = mockData_real.length;
    for(var i = 0; i < tetr; i ++){
      var ob = {};
      ob.name =  mockData_real[i].survey_answers.location;
      ob.data = mockData_real[i];
      loc_circles.push(ob);
    }

    // My variable names are awful here.
    this.xx_loc = [];
    for(var i = 0; i < tetr; i++){
      var ab = loc_circles[i].name;
      var xx = false;
      for(var j = 0; j < this.xx_loc.length; j++){
        var k = this.xx_loc[j].name;
        if(ab.match(k)){
          var tt = this.xx_loc[j].data;
          tt.push(loc_circles[i].data);
          this.xx_loc[j].data = tt;
          xx = true;
        }
      }
      if(xx == false){
        var obj = {};
        obj.name = ab;
        var xxx = loc_circles[i].data;
        obj.data = [];
        obj.data.push(xxx);
        this.xx_loc.push(obj);
      }
    }

    this.project_circles = this.projects
      .selectAll('circle')
      .data(this.xx_loc, d => { return d.name;});
    this.project_circles.exit()
      .transition()
      .attr('r',0)
      .remove();

      this.project_circles.transition()
             .attr("r", d => {
               let a = d.data.length;
               let i = d3.interpolateNumber(3+a, 30*a);
               let x = ((d3.zoomTransform(this.svg.node()).y)*-1) -1000;
               if(x > 0){
                 let t = x/21776;
                 return i(t);
               }
               return 3 + a;
             });

      this.project_circles.enter().append('circle')
         .attr("id",function(d,i){return"project-"+d.name;})
         .attr("cx", d => { let c = project_coordinates[d.name]; return this.projection([c.x,c.y])[0];})
         .attr("cy", d => { let c = project_coordinates[d.name]; return this.projection([c.x,c.y])[1];})
         .attr('transform', d => {
           // I hate projections.
           let c = project_coordinates[d.name];
           let cx = this.projection([c.x,c.y]);
           var trans = d3.zoomTransform(this.svg.node());
           var t = trans.apply(cx);
           let x = [t[0] - cx[0], t[1]-cx[1]];
           return "translate(" + x + ")";
         })
         .classed("bubble","true")
         .style("stroke-width", .7)
         .style("stroke","#007082")
         // .attr("fill","#007d91")
         .attr('fill','hsl(173, 100%, 37%)')  // Temporary
         .on('mouseover', d => {
           let tx = ""
           if(d.data.length > 1){
             tx = "<b>"+ d.name +"</b><br>" + d.data.length+ " Projects"
           } else {
             tx = "<b>" + d.name +"</b>\n<br>" + d.data[0].survey_answers.project_title;
           }
             this.tooltip2.transition().style("opacity", .9);
             this.tooltip2.html(tx)
                .style("left", (d3.event.offsetX) + "px")
                .style("top", (d3.event.offsetY - 18) + "px")
                .style("max-width",  200 + "px");
              })
         .on('mouseout', d => { this.tooltip2.transition("check").style("opacity", 0);})
         .on('click',d => {
           if(d.data.length == 1) {
             this.projectNavigator.goToProject(this.props.history, this.props.location, d.data[0].survey_answers.project_id);
           } else {
             this.multiple_projects_box.text('');
             this.multiple_projects_box.transition().style("opacity", .9);
             var header = d3.select('.multiple_projects_box').append('h4')
                  .style('margin-top','2px')
                  .text(d.name + " has "+ d.data.length +" projects");

            var projects_listed = d3.select('.multiple_projects_box').append('ul').classed('mp_inner_list',true);
            projects_listed.exit().remove();
            projects_listed.selectAll('li').data(d.data, d => {return d.survey_answers.project_id;})
              .enter().append('li')
              .style('cursor','pointer')
              .on('click', d=>{
                this.projectNavigator.goToProject(this.props.history, this.props.location, d.survey_answers.project_id);
              })
              .text(function(d){return d.survey_answers.project_title;});
           }
         })
        .transition()
         .attr("r", d => {
           let a = d.data.length;
           let i = d3.interpolateNumber(3+a, 30*a);
           let x = ((d3.zoomTransform(this.svg.node()).y)*-1) -1000;
           if(x > 0){
             let t = x/21776;
             return i(t);
           }
           return 3 + a;
         });
  }


  zoomed2(){
    let afa = this.projects
      .selectAll('circle')
      .data(this.xx_loc, d => { return d.name;});

      this.cities_circles.attr("transform",this.circle_transform(d3.event.transform));
      afa.attr("transform",this.circle_transform(d3.event.transform));

      this.cities_circles.attr("r",this.circle_size_increase.bind(this));
      afa.attr("r",this.project_size_increase.bind(this));

  }

  circle_size_increase(d){
    let i = d3.interpolateNumber(2, 20);
    let x = (d3.event.transform.y * -1)-2000;
    if(x > 0){
      let t = x/21776;
      return i(t);
    }
    return 1.3;
  }

  // Projects increase after zoom in factor X.
  project_size_increase(d){
    let a = d.data.length;
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

  updateScaleLegend() {
    // Just copied this from the lines following "this.project_circles.transition()..."
    // (lines 193-200) at the time of writing this.
    const radius = (a) => {
      let i = d3.interpolateNumber(3+a, 30*a);
      // console.log(d3.zoomTransform(this.svg.node()));
      let x = ((d3.zoomTransform(this.svg.node()).y)*-1) -1000;
      if(x > 0){
        let t = x/21776;
        return i(t);
      }
      return 3 + a;
    }

    this.props.updateScaleData([
      { r: radius(7), label: '7 projekt' },
      { r: radius(4), label: '4 projekt' },
      { r: radius(1), label: '1 projekt' }
    ]);
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

Map.propTypes = {
  data: PropTypes.object.isRequired,
  filteredData: PropTypes.object.isRequired
};

export default withRouter(Map);
