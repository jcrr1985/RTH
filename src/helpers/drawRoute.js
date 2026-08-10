import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

let directionsRenderer = null;

export default function trazarRuta(map, modo, userPosition, destination) {
  if (!userPosition) {
    Swal.fire({
      icon: "info",
      title: "Ubicación necesaria",
      text: "Para trazar la ruta necesitamos saber tu ubicación. Permite el acceso a tu ubicación en el navegador e inténtalo de nuevo.",
      showCloseButton: true,
    });
    return;
  }

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
      Swal.fire({
        icon: "warning",
        title: "No se pudo trazar la ruta",
        text: "No encontramos una ruta disponible hacia esta clínica.",
        showCloseButton: true,
      });
    }
  });
}
