import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Map extends Component {
  map = undefined
  markers = []

  constructor(props) {
    super(props)
    window.initMap = this.initMap
    window.populateInfoWindow = this.populateInfoWindow
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
      center: {lat: 31.308151, lng: 121.589481},
      zoom: 17,
      mapTypeControl: false
    })

    let largeInfowindow = new window.google.maps.InfoWindow()

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
      this.markers.push(marker)
      // Create an onclick event to open the large infowindow at each marker.
      marker.addListener('click', function() {
          window.populateInfoWindow(this, largeInfowindow)
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

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  populateInfoWindow = (marker, infowindow) => {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker !== marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('')
      infowindow.marker = marker
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null
      })
      let streetViewService = new window.google.maps.StreetViewService()
      let radius = 50
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status === window.google.maps.StreetViewStatus.OK) {
          let nearStreetViewLocation = data.location.latLng
          let heading = window.google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position)
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>')
            let panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            }
          let panorama = new window.google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions)
        } else {
          infowindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>')
        }
      }
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView)
      // Open the infowindow on the correct marker.
      infowindow.open(this.map, marker)
    }
  }

  showAllMarkers = () => {
    let bounds = new window.google.maps.LatLngBounds()
    // Extend the boundaries of the map for each marker and display the marker
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(this.map)
      bounds.extend(this.markers[i].position)
    }
    this.map.fitBounds(bounds)
  }

  // This function will loop through the listings and hide them all.
  hideAllMarkers = () => {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }

  // This function will loop through the filtered markers array and display them all.
  showFilteredMarkers = () => {
    this.hideAllMarkers();

    for (let station of this.props.filteredStations) {
      for (let i = 0; i < this.markers.length; i++) {
        if (station.title === this.markers[i].title) {
          this.markers[i].setMap(this.map)
        }
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

    return (
      <div id="map"></div>
    )
  }
}

export default Map