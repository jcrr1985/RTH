function createObjOfPlaces(places) {
  return places.map((place) => ({
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    name: place.name,
    address: place.formatted_address || null,
    rating: place.rating || null,
    distance: null,
    phone: place.phone || null,
    id: place.place_id || null,
    website: place.website || null,
    placeId: place.place_id,
    opening_hours: place.opening_hours || null,
  }));
}

export { createObjOfPlaces };
