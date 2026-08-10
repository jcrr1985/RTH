// Enriches clinic search results with phone/website details and travel
// times. These come from separate Google Maps API calls (Places Details +
// Directions) that are relatively slow, so callers should only request
// enrichment for the clinics currently visible on screen, not the whole
// result set.

let placesService = null;
function getPlacesService() {
  if (!placesService) {
    placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
  }
  return placesService;
}

let directionsService = null;
function getDirectionsService() {
  if (!directionsService) {
    directionsService = new google.maps.DirectionsService();
  }
  return directionsService;
}

function getPlaceDetails(placeId) {
  return new Promise((resolve) => {
    getPlacesService().getDetails(
      { placeId, fields: ["formatted_phone_number", "website"] },
      (details, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(details);
        } else {
          resolve({});
        }
      }
    );
  });
}

function getTravelTime(origin, destination, mode) {
  const request = {
    origin,
    destination,
    travelMode: google.maps.TravelMode[mode],
  };

  return new Promise((resolve, reject) => {
    getDirectionsService().route(request, (result, status) => {
      if (status === "OK") {
        resolve(result.routes[0].legs[0].duration.text);
      } else {
        reject(new Error(`Directions request failed due to ${status}`));
      }
    });
  });
}

// Cached by placeId so revisiting a page, or a clinic reappearing in a
// different search, never re-triggers the same API calls.
const enrichmentCache = new Map();

async function enrichOneClinic(clinic, userPosition) {
  if (enrichmentCache.has(clinic.placeId)) {
    return enrichmentCache.get(clinic.placeId);
  }

  const details = await getPlaceDetails(clinic.placeId);
  const enriched = {
    placeId: clinic.placeId,
    formatted_phone_number: details.formatted_phone_number || null,
    website: details.website || null,
    enriched: true,
  };

  if (userPosition) {
    const [timeByCar, timeByFoot] = await Promise.allSettled([
      getTravelTime(
        userPosition,
        { lat: clinic.lat, lng: clinic.lng },
        "DRIVING"
      ),
      getTravelTime(
        userPosition,
        { lat: clinic.lat, lng: clinic.lng },
        "WALKING"
      ),
    ]);

    // A rejection here means Google itself couldn't compute that route
    // (e.g. ZERO_RESULTS for a destination unreachable by road/on foot,
    // such as a different continent) -- not a transient error, so it's
    // safe to treat as "this mode is unavailable for this clinic" and
    // reflect that in the UI instead of leaving the icon silently clickable.
    enriched.carRouteAvailable = timeByCar.status === "fulfilled";
    enriched.footRouteAvailable = timeByFoot.status === "fulfilled";
    if (timeByCar.status === "fulfilled") enriched.timeByCar = timeByCar.value;
    if (timeByFoot.status === "fulfilled")
      enriched.timeByFoot = timeByFoot.value;
  }

  enrichmentCache.set(clinic.placeId, enriched);
  return enriched;
}

// Enriches the given clinics in parallel and returns the results, keyed by
// placeId, in the same order as the input.
export function enrichClinics(clinics, userPosition) {
  return Promise.all(
    clinics.map((clinic) => enrichOneClinic(clinic, userPosition))
  );
}
