import { getMap } from "../helpers/mapInstance.js";

// Auto-centering the map on the user's location is a convenience, not a
// requirement: the app is fully usable via manual country/city selection
// either way. So a denied/unavailable/timed-out location request is not an
// error worth interrupting the user over — it's logged and otherwise
// ignored rather than shown as a blocking "Oops" dialog.
export function centrar(setUserCurrentPosition) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  function success(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const userLatLng = new google.maps.LatLng(userLat, userLng);

    if (setUserCurrentPosition) {
      setUserCurrentPosition({ lat: userLat, lng: userLng });
    }

    getMap(userLatLng, 6);
  }

  function error(geolocationError) {
    console.warn(
      "Could not get the user's location:",
      geolocationError.message
    );
  }
}
