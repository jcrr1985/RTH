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

    // let photos = place.photos || "src/assets/images/svg/defaultMarketImage.svg";
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
        // photos,
        id,
        website,
        placeId,
      },
    ];
  });
  return clinicToDisplayObj;
}

export { createObjOfPlaces };
