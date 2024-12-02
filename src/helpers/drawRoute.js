let directionsRenderer = null;

export default function trazarRuta(map, modo, userPosition, destination) {
  const directionsService = new window.google.maps.DirectionsService();

  if (directionsRenderer) {
    directionsRenderer.setMap(null);
    directionsRenderer = null;
  }

  directionsRenderer = new window.google.maps.DirectionsRenderer();

  const request = {
    origin: userPosition,
    destination: destination,
    travelMode: modo,
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(result);
    } else {
      console.error("Error al trazar la ruta:", status);
    }
  });
}
