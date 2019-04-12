import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Map extends Component {
  constructor(props) {
    super(props)
    this.map = undefined
    this.largeInfoWindow = undefined
    this.markerAndAddressInfo = []
    window.initMap = this.initMap
    window.showMarkerAnimationAndInfoWindow = this.showMarkerAnimationAndInfoWindow
  }

  componentDidMount() {
    this.props.onFilterStations('')

    const script = document.createElement("script")
    script.src = "https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyAeKGPiBJwS5PAVGQOwZD4mvrOqkVehGZ0&v=3&callback=initMap"
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }

  initMap = () => {
    // Constructor creates a new map - only center and zoom are required.
    this.map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: 31.306923, lng: 121.587774},
      zoom: 17,
      mapTypeControl: false
    })

    let infoWindow = new window.google.maps.InfoWindow()
    this.largeInfoWindow = infoWindow

    // Style the markers a bit. This will be our listing marker icon.
    let defaultIcon = this.makeMarkerIcon('0091ff')

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    let highlightedIcon = this.makeMarkerIcon('FFFF24')

    // The following group uses the location array to create an array of markers on initialize.
    for (let i = 0; i < this.props.filteredStations.length; i++) {
      // Get the position from the location array.
      let position = this.props.filteredStations[i].location
      let title = this.props.filteredStations[i].title
      // Create a marker per location, and put into markers array.
      let marker = new window.google.maps.Marker({
        position: position,
        title: title,
        animation: window.google.maps.Animation.DROP,
        icon: defaultIcon,
        id: i
      })
      // Push the marker to our array of markers.
      this.markerAndAddressInfo.push({
        marker : marker,
        address : undefined
      })
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
        window.showMarkerAnimationAndInfoWindow(infoWindow, this)
      })
      // Two event listeners - one for mouseover, one for mouseout,
      // to change the colors back and forth.
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon)
      })
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon)
      })
    }

    this.showAllMarkers()
  }

  showInfoWindow = (stationTitle) => {
    for (let markerAndAddress of this.markerAndAddressInfo) {
      if (markerAndAddress.marker.title === stationTitle) {
        this.showMarkerAnimationAndInfoWindow(this.largeInfoWindow, markerAndAddress.marker)
        return;
      }
    }
  }

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  showMarkerAnimationAndInfoWindow = (infoWindow, marker) => {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infoWindow.marker !== marker) {
      // Clear the infowindow content to give the streetview time to load.
      if (infoWindow.marker && infoWindow.marker.getAnimation() !== null) {
        infoWindow.marker.setAnimation(null)
      }
      infoWindow.setContent('')

      infoWindow.marker = marker
      infoWindow.marker.setAnimation(window.google.maps.Animation.BOUNCE)
      // Make sure the marker property is cleared if the infowindow is closed.
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null
      })

      let cachedAddress = this.getCachedAddress(marker)
      if (cachedAddress) {
        this.openInfoWindow(infoWindow, cachedAddress)
      }
      else {
        let url = 'https://api.foursquare.com/v2/venues/search?client_id=WHAPC3YKHLCZXP4ICDPTFTGJWTEGBBD4DZJ3J4UBTMO0I5DG&client_secret=CP0PE1PDGJZUNQYSNS54CFS2ODMQNP5HOLWTSZK2ZAMKG4VW&v=20180323&ll=' +
          marker.position.lat() + ',' + marker.position.lng() + '&limit=1'
        fetch(url).then(response => {
          if (response.status === 200) {
            response.json().then(data => {
              let addressContent
              let venue = data.response.venues[0]
              if (venue.location && venue.location.address) {
                addressContent = venue.location.address
                if (venue.location.crossStreet) {
                  addressContent += ', ' + venue.location.crossStreet
                }
                this.saveFetchedAddress(marker, addressContent)
              }
              else {
                addressContent = 'Failed to get address from the location.'
              }

              this.openInfoWindow(infoWindow, addressContent)
            })
          }
          else {
            this.openInfoWindow(infoWindow, 'Failed to load content from the location.')
          }
        })
        .catch(e => {
          console.log(e)
          this.openInfoWindow(infoWindow, 'Failed to fetch data from the Foursquare.')
        })
      }
    }
  }

  getCachedAddress = (marker) => {
    for (let markerAndAddress of this.markerAndAddressInfo) {
      if (markerAndAddress.marker === marker) {
        return markerAndAddress.address
      }
    }

    return undefined
  }

  saveFetchedAddress = (marker, address) => {
    for (let markerAndAddress of this.markerAndAddressInfo) {
      if (markerAndAddress.marker === marker) {
        markerAndAddress.address = address
      }
    }
  }

  openInfoWindow = (infoWindow, address) => {
    infoWindow.setContent('<div>' + infoWindow.marker.title +'</div><br><div>' + address + '</div>')
    // Open the infowindow on the correct marker.
    infoWindow.open(this.map, infoWindow.marker)

    this.props.onSelectStation(infoWindow.marker.title)
  }

  showAllMarkers = () => {
    let bounds = new window.google.maps.LatLngBounds()
    // Extend the boundaries of the map for each marker and display the marker
    for (let markerAndAddress of this.markerAndAddressInfo) {
      markerAndAddress.marker.setMap(this.map)
      bounds.extend(markerAndAddress.marker.position)
    }
    this.map.fitBounds(bounds)
  }

  // This function will loop through the filtered markers array and display them all.
  showFilteredMarkers = () => {
    for (let markerAndAddress of this.markerAndAddressInfo) {
      let found = false
      for (let station of this.props.filteredStations) {
        if (station.title === markerAndAddress.marker.title) {
          found = true
        }
      }

      if (found) {
        markerAndAddress.marker.setMap(this.map)
      }
      else {
        markerAndAddress.marker.setMap(null)
      }
    }
  }

  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21 px wide by 34 high, have an origin
  // of 0, 0 and be anchored at 10, 34).
  makeMarkerIcon = (markerColor) => {
    let markerImage = new window.google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new window.google.maps.Size(21, 34),
      new window.google.maps.Point(0, 0),
      new window.google.maps.Point(10, 34),
      new window.google.maps.Size(21,34));
    return markerImage
  }

  render() {
    this.showFilteredMarkers()
    this.showInfoWindow(this.props.selectedStationTitle)

    return (
      <div id="map"></div>
    )
  }
}

export default Map