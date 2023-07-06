export const handleChangeClinics = (event) => {

    setMapWidth('17vw');
    if (event.target.value !== "") {
      if (event.key === "Enter") {
        event.preventDefault();
        const nameOfClinicValue = getValues('nameOfClinic');

        let url = `${myProxy}https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinicValue}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;
        console.log('url', url)
        fetch(url)
          .then((nameOfClinicFetchResponse) => {
            return nameOfClinicFetchResponse.json();
          }).then((nameOfClinicFetchResponseJson) => {
            setClinicsToDisplay([])
            let data = nameOfClinicFetchResponseJson.candidates[0];
            let lat = data.geometry.location.lat;
            let lng = data.geometry.location.lng;
            let name = data.name;
            let openNow = data.opening_hours.open_now;
            let address = data.formatted_address;
            let rating = data.rating;
            let phone = 333444555;
            let photos = data.photos;
            let id = data.place_id || 1;
            let placeId = data.place_id;
            let clinicToDisplayObj = { lat, lng, name, openNow, address, rating, phone, photos, id, placeId, data }
            console.log('clinicToDisplayObj', clinicToDisplayObj)
            setClinicsToDisplay([clinicToDisplayObj]);
            reset({
              'country-selected': null,
              'city-selected': null
            });

          })
          .catch((error) => {
            console.error('Error en la solicitud fetch:', error);
          });
      }
    };
  };