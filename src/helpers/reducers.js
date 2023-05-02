import dayjs, { Dayjs } from 'dayjs'


export function reducer_requestForm(state, action) {
    switch (action.type) {
      case 'setCountries':
        return { ...state, countries: action.payload }
      case 'setCountryProps':
        return { ...state, countryProps: action.payload }
      case 'setDate':
        return { ...state, date: action.payload }
      case 'setCiudades':
        console.log('action.payload', action.payload)
        return { ...state, ciudades: [...action.payload] }
      case 'setSelectedCountry':
        return { ...state, selectedCountry: action.payload }
      case 'setClinicsToDisplay':
        return { ...state, clinicsToDisplay: action.payload }
      case 'setPayloadCountry':
        return { ...state, payloadCountry: action.payload }
      case 'setCurrentCityprops':
        return { ...state, currentCityprops: action.payload }
      case 'setAllCitiesProps':
        return { ...state, allCitiesProps: action.payload }
      case 'setClinicasInSelectedCountry':
        return { ...state, clinicasInSelectedCountry: action.payload }
      case 'setShowMap':
        return { ...state, showMap: action.payload }
      case 'setLatLng':
        let newState = { ...state, latLng: action.payload }
        isFormEmpty ? initMap(newState.latLng) : null;
        return newState;
      case 'showTooltip':
        return { ...state, showTooltip: "" }
      case 'specialitySelected':
        return { ...state, specialitySelected: true }

      default:
        return state
    }
  }

  export const initState_requestForm = { specialitySelected: false, showTooltip: "You must select any specialization first", countries: [], countryProps: [], date: dayjs('2014-08-18T21:11:54'), ciudades: [], selectedCountry: '', clinicsToDisplay: [], availableCLinicsPayload: { country: '', city: '' }, payloadCountry: '', currentCityprops: [], allCitiesProps: [], clinicasInSelectedCountry: [], showMap: false, latLng: { lat: 0, lng: 0 } }
