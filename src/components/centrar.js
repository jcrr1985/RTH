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

    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: userLatLng,
    });
  }

  function error() {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Not results found!",
      html: "Geolocation is not supported by this browser.",
      showCloseButton: true,
    });
  }
}
