import React, { Component } from 'react'
import PropTypes from 'prop-types'
import sortBy from 'sort-by'

class ListStations extends Component {
  static propTypes = {
    filteredStations: PropTypes.array.isRequired,
    query: PropTypes.string.isRequired,
    onFilterStations: PropTypes.func.isRequired,
    onSelectStation: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.props.onFilterStations('')
  }

  render() {
    if (this.props.filteredStations) {
      this.props.filteredStations.sort(sortBy('title'))
    }

    return (
      <div id="list-stations">
        <h1 tabIndex="0">Jindiwei District</h1>
        <div className="filter-box">
          <input id="station-location-filter" type="text" placeholder="Station location" aria-label="station-location-filter" onChange={(event) => this.props.onFilterStations(event.target.value)}/>
        </div>
        <div aria-label="location-list">
          <ul id="location-list" tabIndex="0">
            {this.props.filteredStations && this.props.filteredStations.map((station) => (
              <li key={station.title} tabIndex="0" onClick={() => this.props.onSelectStation(station.title)}>{station.title}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default ListStations