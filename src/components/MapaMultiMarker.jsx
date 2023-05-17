import { createObjOfPlaces } from '../helpers/createObjOfPlaces.js'
import '../assets/css/MapaMultiMarker.css'

const apiKey = 'AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k';
const myProxy = 'https://juliocorsproxy.herokuapp.com/'
let infoPanel = document.getElementById('panel');

//funciones reutilizables

// Perform a Places Nearby Search Request: realizamos busqyeda de lugares asociados con especialidad
function getNearbyPlaces(position) {
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: spec,
  };
  //console.log(request.keyword)
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);

}

// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status, testCoord) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results, testCoord);

  }
}

function creadorDeMarcadores(places, map, fillCardArray) { //AQUI ENVIE LA FUNCION RESCATADORA DE PLACES <-----------------------------
  console.log('places', places)
  const markersCreator = (places, map) => {
    const bounds = new window.google.maps.LatLngBounds();
    const infowindow = new window.google.maps.InfoWindow();

    places.forEach((place) => {
      console.log('place', place)

      fillCardArray(places) // Y DENTRO DEL FOREACH LA LLAMO POR CADA MARCADOR <----------------> ESTA FUNCION ESTA DEFINIDA EN TEST.JS
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: place.name,
      });

      bounds.extend(marker.position);

      marker.addListener("mouseover", () => {
        infowindow.setContent(`<div><strong>${place.name}</strong><br>${place.address}<br>${place.phone}</div>`);
        infowindow.open(map, marker);
      });

      marker.addListener('click', () => {
        showPanel(place);
      });

      map.fitBounds(bounds);
    });
    // establecer el nivel de zoom deseado
    map.setZoom(8);
  }
  markersCreator(places, map);
}


function fetching(url, fillCardArray) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('data desde fetching: ', data)

      if (data.results && data.results.length > 0) {
        const places = createObjOfPlaces(data.results);
        console.log('places', places)

        const map = new window.google.maps.Map(document.getElementById("map"), {
          zoom: 10,
          center: data.results[0].geometry.location,
        });
        creadorDeMarcadores(places, map, fillCardArray);
        getNearbyPlaces(map.center)

      } else {
        console.error("No se encontraron resultados para la búsqueda especificada");
      }
    })
    .catch(error => console.error(error));
}

function centrarMapaEnPaisOCiudad(pais, ciudad) {
  let address = ciudad ? `${ciudad}, ${pais}` : pais;
  console.log('address por parametro en centrarMapaEnPaisOCiudad: ', address)
  const geocoder = new window.google.maps.Geocoder();
  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK") {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: pais && ciudad ? 10 : (pais == "russia") ? 4 :
          (pais == "cyprus") ? 10 :
            (pais == "chile") ? 10 : 10
        ,
        center: results[0].geometry.location,
      });
      getNearbyPlaces(map.center)
    } else {
      console.error("No se ha podido encontrar la ciudad especificada");
    }
  });
}

function centrarSinDatosConGeoLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    alert("La geolocalización no es compatible con este navegador.");
  }

  function success(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const userLatLng = new google.maps.LatLng(userLat, userLng);
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 6,
      center: userLatLng,
    });
    getNearbyPlaces(map.center)
    const marker = new google.maps.Marker({
      position: userLatLng,
      map: map,
    });
  }

  function error() {
    alert("No se pudo obtener la ubicación del usuario.");
  }
}

function obtenerPaisYCiudadPorGeoLocalizacion() {
  console.log('obtenerPaisYCiudadPorGeoLocalizacion')
  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const geocodingUrl = `${myProxy}https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();
    const cityComponent = geocodingData.results[0].address_components.find(
      component => component.types.includes("locality")
    );
    const countryComponent = geocodingData.results[0].address_components.find(
      component => component.types.includes("country")
    );
    const ciudad = cityComponent.long_name;
    const pais = countryComponent.short_name;
    const url = `${myProxy}https://maps.googleapis.com/maps/api/place/textsearch/json?query=${especialidad}+in+${ciudad},${pais}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const places = createObjOfPlaces(data.results);
    creadorDeMarcadores(places, map)
    getNearbyPlaces(map.center)
  }, error => {
    centrarSinDatosConGeoLocation();
    console.error(error);
  });

}

function showPanel(placeResult, marker) {
  if (infoPanel.classList.contains("open")) {
    infoPanel.classList.remove("open");
  }

  while (infoPanel.lastChild) {
    infoPanel.removeChild(infoPanel.lastChild);
  }
  if (placeResult.name) {
    let closeX = document.createElement('div');
    closeX.classList.add('closeX');
    closeX.textContent = 'X';
    infoPanel.appendChild(closeX);
  }
  if (placeResult.photos && placeResult.photos.length > 1) {
    let container = document.createElement('div');
    container.classList.add("img-container");
    infoPanel.appendChild(container);

    let sliderC = document.createElement('div');
    sliderC.classList.add("slider");
    container.appendChild(sliderC);

    let menu = document.createElement('ul');
    menu.classList.add("menu");
    container.appendChild(menu);

    (placeResult.photos.length > 1) ? console.log('no menu') : null;

    placeResult.photos.forEach((photo, index) => {
      let slider = document.createElement('div');
      slider.id = `slider${index + 1}`;
      sliderC.appendChild(slider);

      let img = document.createElement('img');
      img.src = photo.getUrl();
      slider.appendChild(img);

      let li = document.createElement('li');
      menu.appendChild(li);

      let button = document.createElement('a');
      button.href = `#slider${index + 1}`;
      button.innerText = `${(index + 1)}`;
      li.appendChild(button);
    })
  } else if (placeResult.photos) {
    let firstPhoto = placeResult.photos[0];
    let photo = document.createElement('img');

    (firstPhoto) ? photo.src = firstPhoto.getUrl() : photo.src = '../assets/images/svg/defaultMarketImage.svg';
    infoPanel.appendChild(photo);
  } else {
    let photo = document.createElement('img');
    photo.classList.add('img-container');
    photo.src = 'https://i.ibb.co/YZ0JCjQ/default-Market-Image.jpg';
    infoPanel.appendChild(photo);
  }

  let name = document.createElement('h1');
  name.classList.add('place');
  name.textContent = placeResult.name;
  infoPanel.appendChild(name);
  if (placeResult.rating) {
    let rating = document.createElement('p');
    rating.classList.add('details');
    rating.textContent = `${placeResult.rating} \u272e`;
    infoPanel.appendChild(rating);
  }
  let address = document.createElement('p');
  address.classList.add('details');
  address.textContent = placeResult.formatted_address;
  infoPanel.appendChild(address);
  infoPanel.classList.add("open");
}

export function MapaMultiMarker(pais, ciudad, especialidad, fillCardArray)  { // AQUI PASO POR PARAMETRO LA FUNCION RESCATA - PLACES

  // si pais no ciudad, no especialidad

  if (pais && !ciudad && !especialidad) {
    console.log('si no no')
    centrarMapaEnPaisOCiudad(pais, ciudad);
  }

  // si pais si ciudad no especialidad

  if (pais && ciudad && !especialidad) {
    console.log('si si no')
    centrarMapaEnPaisOCiudad(pais, ciudad);

  }

  // si pais no ciudad si especialidad

  if (pais && !ciudad && especialidad) {
    console.log('si no si')
    centrarMapaEnPaisOCiudad(pais, ciudad);

  }

  // si pais, si ciudad si especialidad

  if (pais && (ciudad && ciudad.length > 0) && especialidad) {
    console.log('ciudad && ciudad.length > 0', ciudad && ciudad.length > 0, ciudad)
    console.log('si si si')
    const url = `${myProxy}https://maps.googleapis.com/maps/api/place/textsearch/json?query=${especialidad}+in+${ciudad},${pais}&key=${apiKey}`;
    fetching(url, fillCardArray)
  }

  //--------------------------------------------------------------

  // no pais, no ciudad, no especialidad

  if (!pais && !ciudad && !especialidad) {
    centrarSinDatosConGeoLocation();
  }

  // no pais, si ciudad, si especialidad

  if (!pais && ciudad && especialidad) {
    console.log('no si si')
    obtenerPaisYCiudadPorGeoLocalizacion();
  }

  // no pais, no ciudad, si especialidad

  if (!pais && !ciudad && especialidad) {
    console.log('no no si')
    obtenerPaisYCiudadPorGeoLocalizacion();
  }

  // no pais, si ciudad, no especialidad

  if (!pais && !ciudad && !especialidad) {
    console.log('no no no')
    centrarSinDatosConGeoLocation();

  }

}