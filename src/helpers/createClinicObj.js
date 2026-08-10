const createClinicObj = (nameOfClinicFetchResponseJson) => {
  const data = nameOfClinicFetchResponseJson.candidates[0];
  return {
    data,
    lat: data.geometry.location.lat,
    lng: data.geometry.location.lng,
    name: data.name,
    openNow: data.opening_hours ? data.opening_hours.open_now : null,
    address: data.formatted_address,
    rating: data.rating,
    id: data.place_id,
    placeId: data.place_id,
  };
};

export default createClinicObj;
