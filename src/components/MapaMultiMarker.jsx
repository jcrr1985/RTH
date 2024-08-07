import { createObjOfPlaces } from "../helpers/createObjOfPlaces.js";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";
const proxy = "https://rth-server.vercel.app";
// const proxy = "http://localhost:5000";

import { centrar } from "./centrar.js";

let infoPanel = document.getElementById("panel");
let userPosition = null;

const distanceBetween = (pos, marker_coords) => {
  let _coordinates = pos; //a google.maps.LatLng object
  var _pCord = marker_coords;
  let testDistance = google.maps.geometry.spherical.computeDistanceBetween(
    _pCord,
    _coordinates
  );

  testDistance = (testDistance / 1000).toFixed(0);
  return testDistance;
};

function creadorDeMarcadores(
  places,
  map,
  fillCardArray,
  userPosition,
  setPlacesDistancesToUserPosition
) {
  const markersCreator = (places, map) => {
    const bounds = new window.google.maps.LatLngBounds();
    const infowindow = new window.google.maps.InfoWindow();
    let placesCoords = [];
    fillCardArray(places);
    places.forEach((place) => {
      let distance = 0;
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: place.name,
        distance: distance,
        placeId: place.placeId,
      });
      let coord = new window.google.maps.LatLng(place.lat, place.lng);
      if (userPosition) {
        marker.distance = distanceBetween(userPosition, coord);
        placesCoords = [...new Set([...placesCoords, marker.distance])];
      }
      bounds.extend(marker.position);

      marker.addListener("mouseover", () => {
        infowindow.setContent(
          `<div><strong>${place.name}</strong><br>${place.address}</div>`
        );
        infowindow.open(map, marker);
      });

      marker.addListener("click", () => {
        showPanel(place);
      });

      map.fitBounds(bounds);
    });
    map.setZoom(8);
    setPlacesDistancesToUserPosition(placesCoords);
  };
  markersCreator(places, map);
}

function fetching(
  url,
  fillCardArray,
  setPlacesDistancesToUserPosition,
  pais,
  ciudad,
  selectedLanguage,
  setsetMapyMapy
) {
  Swal.showLoading();
  fetch(url, {
    mode: "cors",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.results && data.results.length > 0) {
        const places = createObjOfPlaces(data.results);

        const map = new window.google.maps.Map(document.getElementById("map"), {
          zoom: 10,
          center: data.results[0].geometry.location,
        });

        setsetMapyMapy(map);

        Swal.close();
        creadorDeMarcadores(
          places,
          map,
          fillCardArray,
          userPosition,
          setPlacesDistancesToUserPosition
        ); // Pasar userPosition como argumento
      } else {
        Swal.fire({
          title: "Results not found....",
          allowOutsideClick: true,
          showConfirmButton: true,
          willOpen: () => {
            console.log("error de fetching", error);
          },
        });
        console.error(
          "No se encontraron resultados para la búsqueda especificada"
        );

        centrarMapaEnPaisOCiudad(pais, ciudad);
      }
    })
    .catch((error) => {
      Swal.fire({
        title: "Server not reached....",
        allowOutsideClick: true,
        showConfirmButton: true,
        willOpen: () => {
          console.log("error de fetching", error);
        },
      });
    });
}

function centrarMapaEnPaisOCiudad(pais, ciudad) {
  let address = ciudad ? `${ciudad}, ${pais}` : pais;
  const geocoder = new window.google.maps.Geocoder();
  Swal.showLoading();
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom:
          pais && ciudad
            ? 11
            : pais == "Russia" || pais == "China"
            ? 4
            : pais == "Cyprus"
            ? 10
            : pais == "Chile"
            ? 10
            : 10,
        center: results[0].geometry.location,
      });
      Swal.close();
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Not results found!",
        html: "Could not find location:" + address,
        showCloseButton: true,
      });
    }
  });
}

function obtenerPaisYCiudadPorGeoLocalizacion(selectedLanguage) {
  Swal.showLoading();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const geocodingUrl = `${proxy}/https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${selectedLanguage}&key=${apiKey}`;

      const geocodingResponse = await fetch(geocodingUrl, {
        mode: "cors",
      });
      const geocodingData = await geocodingResponse.json();
      const cityComponent = geocodingData.results[0].address_components.find(
        (component) => component.types.includes("locality")
      );
      const countryComponent = geocodingData.results[0].address_components.find(
        (component) => component.types.includes("country")
      );
      const ciudad = cityComponent.long_name;
      const pais = countryComponent.short_name;

      const tipo1 = "hospital";
      const tipo2 = "clínica";
      const tipo5 = "clinic";

      const url = `${proxy}/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${especialidad}+in+${ciudad},${pais}&$keyword=-Clinics.&type=clinic|${tipo1}|${tipo2}|${tipo3}|${tipo4}|${tipo5}|${tipo6}|${especialidad}&radius=${radio}&language=${selectedLanguage}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      const places = createObjOfPlaces(data.results);
      creadorDeMarcadores(places, map);
      Swal.close();
    },
    (error) => {
      setUserCurrentPosition;
      centrar();
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Not results found!",
        html: error.message,
        showCloseButton: true,
      });
    }
  );
}

function showPanel(placeResult, marker) {
  if (infoPanel.classList.contains("open")) {
    infoPanel.classList.remove("open");
  }

  while (infoPanel.lastChild) {
    infoPanel.removeChild(infoPanel.lastChild);
  }
  if (placeResult.name) {
    let closeX = document.createElement("div");
    closeX.classList.add("closeX");
    closeX.textContent = "X";
    infoPanel.appendChild(closeX);
  }
  if (placeResult.photos && placeResult.photos.length > 1) {
    let container = document.createElement("div");
    container.classList.add("img-container");
    infoPanel.appendChild(container);

    let sliderC = document.createElement("div");
    sliderC.classList.add("slider");
    container.appendChild(sliderC);

    let menu = document.createElement("ul");
    menu.classList.add("menu");
    container.appendChild(menu);

    placeResult.photos.length > 1 ? console.log("no menu") : null;

    placeResult.photos.forEach((photo, index) => {
      let slider = document.createElement("div");
      slider.id = `slider${index + 1}`;
      sliderC.appendChild(slider);

      let img = document.createElement("img");
      img.src = photo.getUrl();
      slider.appendChild(img);

      let li = document.createElement("li");
      menu.appendChild(li);

      let button = document.createElement("a");
      button.href = `#slider${index + 1}`;
      button.innerText = `${index + 1}`;
      li.appendChild(button);
    });
  } else if (placeResult.photos) {
    let firstPhoto = placeResult.photos[0];
    let photo = document.createElement("img");

    firstPhoto
      ? (photo.src = firstPhoto.getUrl())
      : (photo.src = "../assets/images/svg/defaultMarketImage.svg");
    infoPanel.appendChild(photo);
  } else {
    let photo = document.createElement("img");
    photo.classList.add("img-container");
    photo.src = "https://i.ibb.co/YZ0JCjQ/default-Market-Image.jpg";
    infoPanel.appendChild(photo);
  }

  let name = document.createElement("h1");
  name.classList.add("place");
  name.textContent = placeResult.name;
  infoPanel.appendChild(name);
  if (placeResult.rating) {
    let rating = document.createElement("p");
    rating.classList.add("details");
    rating.textContent = `${placeResult.rating} \u272e`;
    infoPanel.appendChild(rating);
  }
  let address = document.createElement("p");
  address.classList.add("details");
  address.textContent = placeResult.formatted_address;
  infoPanel.appendChild(address);
  infoPanel.classList.add("open");
}

export function MapaMultiMarker(
  pais = null,
  ciudad = null,
  especialidad = null,
  fillCardArray,
  setPlacesDistancesToUserPosition,
  selectedLanguage,
  clinicsToDisplayObj,
  setUserCurrentPosition,
  setsetMapyMapy
) {
  // si pais, algun otro campo faltante

  if (
    (pais && !ciudad && !especialidad) ||
    (pais && ciudad && !especialidad) ||
    (pais && !ciudad && especialidad)
  ) {
    centrarMapaEnPaisOCiudad(pais, ciudad, selectedLanguage);
  }

  // si pais, si ciudad si especialidad

  if (pais && ciudad && ciudad.length > 0 && especialidad) {
    const url = `${proxy}/places?apiUrl=https://maps.googleapis.com/maps/api/place/textsearch/json?query=${especialidad}+in+${ciudad},${pais}&language=${selectedLanguage}&key=${apiKey}`;

    fetching(
      url,
      fillCardArray,
      setPlacesDistancesToUserPosition,
      pais,
      ciudad,
      selectedLanguage,
      setsetMapyMapy
    );
  }

  //--------------------------------------------------------------

  // no pais, no ciudad, no especialidad no clinicsToDisplayObj

  if (!pais && !ciudad && !especialidad && !clinicsToDisplayObj) {
    centrar(setUserCurrentPosition);
  }
  // no pais, si ciudad, si especialidad

  if (!pais && ciudad && especialidad) {
    obtenerPaisYCiudadPorGeoLocalizacion(selectedLanguage);
  }
}
