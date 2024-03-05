function createObjOfPlaces(places) {
  let clinicToDisplayObj = [];

  places.map((place) => {
    clinicToDisplayObj = [
      ...clinicToDisplayObj,
      {
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
      },
    ];
  });

  return clinicToDisplayObj;
}

export { createObjOfPlaces };
