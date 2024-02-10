function createObjOfPlaces(places) {
  let clinicToDisplayObj = [];

  places.map((place) => {
    let lat = place.geometry.location.lat;
    let lng = place.geometry.location.lng;
    let name = place.name;
    let address = place.formatted_address || null;
    let rating = place.rating || null;
    let phone = place.phone || null;
    let website = place.website || null;
    let opening_hours = place.opening_hours || null;
    let id = place.place_id || null;
    let placeId = place.place_id;
    let distance = null;

    clinicToDisplayObj = [
      ...clinicToDisplayObj,
      {
        lat,
        lng,
        name,
        address,
        rating,
        distance,
        phone,
        id,
        website,
        placeId,
        opening_hours,
      },
    ];
  });
  return clinicToDisplayObj;
}

export { createObjOfPlaces };
