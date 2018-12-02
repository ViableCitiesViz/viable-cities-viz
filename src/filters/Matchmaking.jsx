import React, { Component } from 'react';
import { range } from 'd3';
import isEqual from 'react-fast-compare';
import PropTypes from 'prop-types';
import './Matchmaking.css';

const ROWS = 5;
const COLS = 4;

// input is '[ROW,COL]' where ROW and COL are numbers.
const parsePosition = (name) => {
  const split = name.substring(1, name.length - 1).split(',');
  return { row: Number.parseInt(split[0]), col: Number.parseInt(split[1]) };
};

class Matchmaking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const position = parsePosition(event.target.name);
    const valueCopy = [...this.props.value];

    const index = this.props.value.findIndex(item => isEqual(position, item));
    if (index !== -1) valueCopy.splice(index, 1);
    if (event.target.checked) valueCopy.push(position);

    if (this.props.onChange) this.props.onChange(valueCopy);
  }

  isChecked(row, col) {
    return this.props.value.findIndex(item => isEqual(item, { row, col })) !== -1;
  }

  render() {
    const columns = (row) => {
      return range(1, COLS + 1).map(col => (
        <td key={(row - 1) * COLS + col}>
          <input
            type="checkbox"
            name={`[${row},${col}]`}
            checked={this.isChecked(row, col)}
            onChange={this.handleChange}
            disabled={this.props.enabled && !this.props.enabled[row][col]} />
        </td>
      ));
    };

    const rows = range(1, ROWS + 1).map(row => (
      <tr key={row}>
        {columns(row)}
      </tr>
    ));

    return (
      <div className="filters-box filters-box--matchmaking">
        <span className="filters-box__title">
          Teman och fokusområden
        </span>
        <div className="matchmaking-table-container">
          <table className="matchmaking-table">
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

Matchmaking.defaultProps = {
  value: []
};

Matchmaking.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.arrayOf(PropTypes.shape({
    row: PropTypes.number,
    col: PropTypes.number
  })).isRequired,
  enabled: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool))
};

export default Matchmaking;
