// Google Maps is expensive to (re)initialize: a fresh `new google.maps.Map`
// reloads tiles and rebinds every listener. Every part of the app that
// needs the map shares this single instance instead of creating a new one
// per search, and markers from a previous search are explicitly cleared
// instead of being silently leaked.

let mapInstance = null;
let markers = [];

export function getMap(center, zoom) {
  const mapDiv = document.getElementById("map");
  if (!mapInstance) {
    mapInstance = new google.maps.Map(mapDiv, { center, zoom });
  } else {
    mapInstance.setCenter(center);
    mapInstance.setZoom(zoom);
  }
  return mapInstance;
}

export function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

export function addMarker(marker) {
  markers.push(marker);
}
