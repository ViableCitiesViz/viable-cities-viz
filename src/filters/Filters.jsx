import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { range } from 'd3';
import { Multiselect } from 'react-widgets'
import MatrixLegend from '../matrix/MatrixLegend';
import MatrixScale from '../matrix/MatrixScale';
import { col2focus, row2theme, theme2row } from '../matrix/MatrixUtility';
import Matchmaking from './Matchmaking';
import isEqual from 'react-fast-compare';
import _intersection from 'lodash.intersection';
import './Filters.css';

// find the intersection of an arbitrary number of subsets of data
function intersection(...data) {
  return { data: _intersection(...data.map(d => d.data)) };
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
        keywords: props.data,
        matchmaking: props.data,
      },
      filterValues: {
        titles: [],
        locations: [],
        partners: [],
        keywords: [],
        matchmaking: []
      },
      filteredData: props.data
    };

    // used for optimizations
    this.prevFilteredData = null;

    // data used by filter components when rendering, e.g.
    // location names, partners, enabled matrix cells etc
    this.componentData = {
      titles: null,
      locations: null,
      partners: null,
      keywords: null,
      matchmaking: null
    };

    this.projectLocations = {};
    this.projectPartners = {};
    this.projectKeywords = {};

    props.data.data.forEach(d => {
      this.projectLocations[d.survey_answers.project_id] = new Set();
      d.survey_answers.locations.forEach(location => {
        this.projectLocations[d.survey_answers.project_id].add(location);
      });

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
        if (!titles.length) return this.props.data;

        return {
          data: this.props.data.data.filter((d) => {
            if (!titles.includes(d.survey_answers.project_title)) return false;
            return true;
          })
        };
      },
      locations: (locations) => {
        if (!locations.length) return this.props.data;

        return {
          data: this.props.data.data.filter((d) => {
            if (!locations.some(location => {
              return this.projectLocations[d.survey_answers.project_id].has(location.name);
            })) return false;
            return true;
          })
        };
      },
      partners: (partners) => {
        if (!partners.length) return this.props.data;

        return {
          data: this.props.data.data.filter((d) => {
            if (!partners.some(partner => {
              return this.projectPartners[d.survey_answers.project_id].has(partner.name);
            })) return false;
            return true;
          })
        }
      },
      keywords: (keywords) => {
        if (!keywords.length) return this.props.data;

        return {
          data: this.props.data.data.filter((d) => {
            if (!keywords.some(keyword => {
              return this.projectKeywords[d.survey_answers.project_id].has(keyword.name);
            })) return false;
            return true;
          })
        }
      },
      matchmaking: (matchmaking) => {
        if (!matchmaking.length) return this.props.data;

        return {
          data: this.props.data.data.filter((d) => {
            if (!matchmaking.every(position => {
              return d.survey_answers[col2focus[position.col]].includes(row2theme[position.row])
            })) return false;
            return true;
          })
        }
      }
    };
  }

  empty() {
    return Object.values(this.state.filterValues).every(value => value.length === 0);
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
      d.survey_answers.locations.forEach(location => {
        ret.has(location) ? ret.set(location, ret.get(location) + 1) : ret.set(location, 1);
      });
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

  buildMatchmakingList() {
    const data = this.state.filteredData;

    const ROWS = 5;
    const COLS = 4;

    const colRange = range(1, COLS + 1); 

    const nonEmpty = {};
    for (let row = 1; row <= ROWS; ++row) {
      nonEmpty[row] = {};
      for (let col = 1; col <= COLS; ++col) {
        nonEmpty[row][col] = false;
      }
    }

    data.data.forEach(d => {
      colRange.forEach(col => {
        d.survey_answers[col2focus[col]].forEach(theme => {
          const row = theme2row[theme];
          if (!nonEmpty[row][col]) nonEmpty[row][col] = true;
        })
      });
    });

    return nonEmpty;
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
      const filteredBy = {};
      Object.keys(this.filterBy).forEach(filter => {
        if (!isEqual(prevState.filterValues[filter], this.state.filterValues[filter])) {
          filteredBy[filter] = this.filterBy[filter](this.state.filterValues[filter]);
        }
      });
      if (Object.keys(filteredBy).length) {
        this.setState((state, props) => ({
          filteredBy: {
            ...state.filteredBy,
            ...filteredBy
          }
        }))
      }
    }

    if (!isEqual(prevState.filteredBy, this.state.filteredBy)) {
      const newFilteredData = intersection(...Object.values(this.state.filteredBy));
      this.setState({
        filteredData: newFilteredData
      });
      this.props.updateFilteredData(newFilteredData);
    }
  }

  render() {
    // load these here, otherwise lazy evaluation can cause some choppiness in the browser
    if (this.state.filteredData !== this.prevFilteredData) {
      this.prevFilteredData = this.state.filteredData;
      this.componentData = {
        titles: this.buildTitlesList(),
        locations: this.buildLocationList(),
        partners: this.buildPartnerList(),
        keywords: this.buildKeywordList(),
        matchmaking: this.buildMatchmakingList()
      }
    }
    
    return (
      <div className="filters">
        <div className="filters__top">
          <div className="filter-box">
            <span className="filter-box__title">
              Titel
            </span>
            <Multiselect
              data={this.componentData.titles}
              onChange={titles => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    titles
                  }
                });
              }}
              placeholder="Filtera efter titlar"
              filter="contains"
              value={this.state.filterValues.titles} />
          </div>
          <div className="filter-box">
            <span className="filter-box__title">
              Plats
            </span>
            <Multiselect
              data={this.componentData.locations}
              onChange={locations => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    locations
                  }
                });
              }}
              placeholder="Filtrera efter kommuner"
              valueField="name"
              textField="name"
              itemComponent={ListItem}
              value={this.state.filterValues.locations} />
          </div>
          <div className="filter-box">
            <span className="filter-box__title">
              Partner
            </span>
            <Multiselect
              data={this.componentData.partners}
              onChange={partners => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    partners
                  }
                });
              }}
              placeholder="Filtrera efter partners"
              filter="contains"
              valueField="name"
              textField="name"
              itemComponent={ListItem}
              value={this.state.filterValues.partners} />
          </div>
          <div className="filter-box">
            <span className="filter-box__title">
              Nyckelord
            </span>
            <Multiselect
              data={this.componentData.keywords}
              onChange={keywords => {
                this.setState({
                  filterValues: {
                    ...this.state.filterValues,
                    keywords
                  }
                });
              }}
              placeholder="Filtera efter nyckelord"
              filter="contains"
              valueField="name"
              textField="name"
              itemComponent={ListItem}
              value={this.state.filterValues.keywords} />
          </div>

          <Matchmaking
            value={this.state.filterValues.matchmaking}
            onChange={matchmaking => {
              this.setState({
                filterValues: {
                  ...this.state.filterValues,
                  matchmaking
                }
              });
            }}
            enabled={this.componentData.matchmaking} />

          <p className={`filter-results-text ${this.empty() ? 'filter-results-text--hidden' : ''}`}>
            Visar <span className="filter-results-text__number">{this.state.filteredData.data.length}</span>
            {' '} av <span className="filter-results-text__number">{this.props.data.data.length}</span> projekt.
          </p>

          <div className={`filter-button-box ${this.empty() ? 'filter-button-box--hidden' : ''}`}>
            <button
              className="filter-button"
              onClick={() => this.setState({
                filterValues: Object.entries(this.state.filterValues)
                  .reduce((obj, [k,_]) => ({...obj, [k]: []}), {})
              })}>
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
