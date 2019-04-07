import React, { Component } from 'react'
import PropTypes from 'prop-types'
import sortBy from 'sort-by'

class ListStations extends Component {
  componentDidMount() {
      this.props.onFilterStations('')
  }

  render() {
    if (this.props.filteredStations) {
      this.props.filteredStations.sort(sortBy('title'))
    }

    return (
      <div className="list-stations">
        <h1>Jindiwei District</h1>
        <div className="filter-box">
          <input id="station-location" type="text" placeholder="Station location" onChange={(event) => this.props.onFilterStations(event.target.value)}/>
          <input id="filter-location" type="button" value="Filter"/>
        </div>
        <div>
          <ul id="location-list">
            {this.props.filteredStations && this.props.filteredStations.map((station) => (
              <li key={station.title} onClick={() => this.props.onSelectStation(station.title)}>{station.title}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default ListStations