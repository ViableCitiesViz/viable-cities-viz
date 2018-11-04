import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Multiselect } from 'react-widgets'
import MatrixLegend from '../matrix/MatrixLegend';
import MatrixScale from '../matrix/MatrixScale';
import isEqual from 'react-fast-compare';
import './Filters.css';

// find the intersection of an arbitrary number of subsets of data
function intersection(datum, ...moreData) {
  return moreData.reduce((previous, current) => (
    {data: previous.data.filter(x => current.data.includes(x))}
  ), datum)
}

// presentation of the multiselect options
const ListItem = ({ item }) => (
  <div className="filter-item">
    <span className="filter-item__name">{item.name}</span>
    <span className="filter-item__count">{item.count}</span>
  </div>
);

class Filters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filteredBy: {
        titles: props.data,
        locations: props.data,
        partners: props.data,
        keywords: props.data
      },
      filterValues: {
        titles: [],
        locations: [],
        partners: [],
        keywords: []
      }
    };

    this.projectPartners = {};
    this.projectKeywords = {};

    props.data.data.forEach(d => {
      this.projectPartners[d.survey_answers.project_id] = new Set();
      d.survey_answers.other_financiers.forEach(financier => {
        this.projectPartners[d.survey_answers.project_id].add(financier);
      });
      d.survey_answers.other_recipients.forEach(recipient => {
        this.projectPartners[d.survey_answers.project_id].add(recipient);
      });

      this.projectKeywords[d.survey_answers.project_id] = new Set();
      d.survey_answers.keywords.forEach(keyword => {
        this.projectKeywords[d.survey_answers.project_id].add(keyword);
      });
    });

    this.filterBy = {
      titles: (titles) => {
        this.setState((state, props) => ({
          filteredBy: {
            ...state.filteredBy,
            titles: { 
              data: props.data.data.filter((d) => {
                if (titles.length && !titles.includes(d.survey_answers.project_title)) return false;
                return true;
              })
            }
          }
        }))
      },
      locations: (locations) => {
        const locationsList = locations.map(locationObj => locationObj.name);
        this.setState((state, props) => ({
          filteredBy: {
            ...state.filteredBy,
            locations: { 
              data: props.data.data.filter((d) => {
                if (locations.length && !locationsList.includes(d.survey_answers.location)) return false;
                return true;
              })
            }
          }
        }))
      },
      partners: (partners) => {
        this.setState((state, props) => ({
          filteredBy: {
            ...state.filteredBy,
            partners: {
              data: props.data.data.filter((d) => {
                if (partners.length && !partners.some(partner => {
                  return this.projectPartners[d.survey_answers.project_id].has(partner.name);
                })) return false;
                return true;
              })
            }
          }
        }))
      },
      keywords: (keywords) => {
        this.setState((state, props) => ({
          filteredBy: {
            ...state.filteredBy,
            keywords: {
              data: props.data.data.filter((d) => {
                if (keywords.length && !keywords.some(keyword => {
                  return this.projectKeywords[d.survey_answers.project_id].has(keyword.name);
                })) return false;
                return true;
              })
            }
          }
        }))
      }
    };
  }

  filteredByAllExcept(filter) {
    return intersection(...Object.entries(this.state.filteredBy)
      .filter(([key, value]) => key !== filter)
      .map(([key, value]) => value))
  }

  buildTitlesList() {
    const data = this.filteredByAllExcept('titles');
    return data.data.map(d => d.survey_answers.project_title)
  }

  buildLocationList() {
    const data = this.filteredByAllExcept('locations');
    
    const ret = new Map();
    data.data.forEach(d => {
      const location = d.survey_answers.location;
      ret.has(location) ? ret.set(location, ret.get(location) + 1) : ret.set(location, 1);
    });

    return [...ret]
      .sort()
      .reduce((arr, [key, value]) => [...arr, {name: key, count: value}], [])
  }

  buildPartnerList() {
    const data = this.filteredByAllExcept('partners');

    const ret = new Map();
    data.data.forEach(d => {
      this.projectPartners[d.survey_answers.project_id].forEach(partner => {
        ret.has(partner) ? ret.set(partner, ret.get(partner) + 1) : ret.set(partner, 1);
      });
    });

    return [...ret]
      .sort()
      .reduce((arr, [key, value]) => [...arr, {name: key, count: value}], [])
  }

  buildKeywordList() {
    const data = this.filteredByAllExcept('keywords');

    const ret = new Map();
    data.data.forEach(d => {
      d.survey_answers.keywords.forEach(keyword => {
        ret.has(keyword) ? ret.set(keyword, ret.get(keyword) + 1) : ret.set(keyword, 1);
      });
    });

    return [...ret]
      .sort()
      .reduce((arr, [key, value]) => [...arr, {name: key, count: value}], [])
  }

  // only render if state changed, ignore props (except for scaleData) since they shouldn't change anyway
  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState, this.state)) return true;
    if (!isEqual(nextProps.scaleData, this.props.scaleData)) return true;
    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState === this.state) return;

    if (!isEqual(prevState.filterValues, this.state.filterValues)) {
      Object.keys(this.filterBy).forEach(filter => {
        if (!isEqual(prevState.filterValues[filter], this.state.filterValues[filter])) {
          this.filterBy[filter](this.state.filterValues[filter]);
        }
      });
    }

    if (!isEqual(prevState.filteredBy, this.state.filteredBy)) {
      const newFilteredData = intersection(...Object.values(this.state.filteredBy));
      this.props.updateFilteredData(newFilteredData);
    }
  }

  render() {
    // load these here, otherwise lazy evaluation can cause some choppiness in the browser
    const titlesList = this.buildTitlesList();
    const locationsList = this.buildLocationList();
    const partnersList = this.buildPartnerList();
    const keywordsList = this.buildKeywordList();

    return (
      <div className="filters">
        <div className="filters__top">
          <div className="filter-box">
            <span className="filter-box__title">
              Titel
            </span>
            <Multiselect
              data={titlesList}
              onChange={titles => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    titles
                  }
                });
              }}
              placeholder="Filtera efter projekttitel"
              filter="contains"
              value={this.state.filterValues.titles}
            />
          </div>
          <div className="filter-box">
            <span className="filter-box__title">
              Plats
            </span>
            <Multiselect
              data={locationsList}
              onChange={locations => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    locations
                  }
                });
              }}
              placeholder="Filtrera efter kommun"
              valueField="name"
              textField="name"
              itemComponent={ListItem}
              value={this.state.filterValues.locations}
            />
          </div>
          <div className="filter-box">
            <span className="filter-box__title">
              Partner
            </span>
            <Multiselect
              data={partnersList}
              onChange={partners => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    partners
                  }
                });
              }}
              placeholder="Filtera efter partner"
              valueField="name"
              textField="name"
              itemComponent={ListItem}
              value={this.state.filterValues.partners}
            />
          </div>
          <div className="filter-box">
            <span className="filter-box__title">
              Nyckelord
            </span>
            <Multiselect
              data={keywordsList}
              onChange={keywords => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    keywords
                  }
                });
              }}
              placeholder="Filtrera efter nyckelord"
              filter="contains"
              valueField="name"
              textField="name"
              itemComponent={ListItem}
              value={this.state.filterValues.keywords}
            />
          </div>
          <div className="filter-button-box">
            <button
              className="filter-button"
              onClick={() => this.setState({
                filterValues: Object.entries(this.state.filterValues)
                  .reduce((obj, [k,_]) => ({...obj, [k]: []}), {})
              })}
            >
              Rensa filter
            </button>
          </div>
        </div>
        <div className="filter__bottom">
          <MatrixScale scaleData={this.props.scaleData} />
          <MatrixLegend />
        </div>
      </div>
    );
  }
}

Filters.propTypes = {
  data: PropTypes.object.isRequired,
  updateFilteredData: PropTypes.func.isRequired,
  scaleData: PropTypes.shape({
    rScale: PropTypes.number,
    minBudget: PropTypes.number,
    maxBudget: PropTypes.number
  })
};

export default Filters;
