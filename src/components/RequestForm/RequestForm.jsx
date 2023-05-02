/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react"
import '../App.css'
import 'normalize.css'
import React, { useEffect, useState, useReducer, createContext } from 'react'
import { useForm } from "react-hook-form"
import * as countriesAndCities from '../assets/countries-cities.json'

import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField'


import searchIcon from '../assets/images/svg/search.svg'

import dayjs, { Dayjs } from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import FilterFinding from './FilterFinding'
import { logicFilterFinder } from '../assets/js/LogicFilterFinder'
import { FinderFilterContext } from '../helpers/FinderFilterContext.js'
//import Header from "./Header"

import theme from '../theme'

// import initMapyarn
import { initMap } from './Map'
import { MapaMultiMarker } from './MapaMultiMarker'
import MediaCard from '../mui-components/card'
import { reducer_requestForm, initState_requestForm } from "../helpers/reducers"
import DatePicker_requestForm from './datePicker'

let isFormEmpty = true;



export const RequestForm = () => {
  const [state, dispatch] = useReducer(reducer_requestForm, initState_requestForm)
  const [date, setDate] = useState(dayjs('2014-08-18T21:11:54')); // change to today
  const [open, setOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('low price')
  const [displayCards, setDisplayCards] = useState(false)
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [speciality, setSpeciality] = useState('Surgery')


  useEffect(() => {

    if (state.clinicsToDisplay) () => { logicFilterFinder(state.clinicsToDisplay, filterMode) }
    //console.log(clinicsValues)
    if (state.ciudades) () => MapaMultiMarker(speciality, displayCards, city, country)
  }, [filterMode, state.ciudades, state.clinicsToDisplay, state.countries])


  let zIndex = '';
  if (state.specialitySelected) {
    zIndex = '12';
  }

  const handleOpen = () => {
    console.log('Iḿ in', open)
    setOpen(true)
  }
  const handleClose = () => {
    console.log('Iḿ out', open)
    setOpen(false)
  }

  //import muiComponents
  const { register, handleSubmit, watch, getValues, resetField,
    formState: { isDirty, isValid } } = useForm();

  useEffect(() => {
    // set string array of countries
    let paises = Object.keys(countriesAndCities)
    console.log('paises', paises)
    paises = paises.filter(pais => pais !== 'default');

    // enviando array de paises para el select de .... paises
    dispatch({ type: 'setCountries', payload: paises })

    //obteniendo todas las propiedades del objeto correspondiente al pais seleccionado
    let countryPropiedades = Object.values(countriesAndCities);
    countryPropiedades = countryPropiedades.filter(countryPropiedad => typeof (countryPropiedad.name) === "string")
    dispatch({ type: 'setCountryProps', payload: countryPropiedades })
    // initMap(latLng); umcomment this to see the map
    const values = getValues();
    if (!values.cities && !values.countries && !values.nameOfClinic && !values.specialities) {
      isFormEmpty === true;
    } else {
      isFormEmpty === false;
    }
    let inputs = document.querySelectorAll('.not-specialities-dropdown')

    inputs.forEach(input => {
      if (input.classList.contains('not-specialities-dropdown')) {
        input.style.pointerEvents = 'none';
      }
    })

    console.log('state.showTooltip', state.showTooltip)
  }, []);

  //fin del UseEffect

  //desbloquear inputs
  const unblockFields = () => {
    let fields = document.querySelectorAll('.not-specialities-dropdown')
    console.log('fields fields fields fields', fields);
    fields.forEach(field => {
      field.style.pointerEvents = 'auto';
    })
    dispatch({ type: 'showTooltip', payload: '' })
  }


  //lanzar Mapa MultiMarker
  const launchMapMultiMarker = (ev) => {
    setSpeciality(ev.target.innerText)
    let specialitySelected = ev.target.innerText;
    console.log('specialitySelected', specialitySelected)
    dispatch({ type: 'specialitySelected', payload: true })
    MapaMultiMarker(country, city, speciality)

  }

  //managing the change of the country

  const onChangeCountry = (ev) => {
    setCountry(ev.target.innerText)
    let cities = [];
    dispatch({ type: 'setCiudades', payload: [] })
    resetField('cities')
    dispatch({ type: 'setClinicsToDisplay', payload: [] }) // clear the displayed cards
    let paisSeleccionado = ev.target.innerText;
    dispatch({ type: 'setSelectedCountry', payload: paisSeleccionado })

    let elpropio = state.countryProps.filter(objectoActual => {
      return (objectoActual.name).toLowerCase() == paisSeleccionado;
    })

    console.log('elpropio', elpropio)
    let ciudadesObj = elpropio[0].cities;
    //set the cities (strings) of the selected country
    ciudadesObj.forEach(ciudadObj => {
      let ciudad = Object.keys(ciudadObj)[0];
      cities.push(ciudad)
    })
    dispatch({ type: 'setCiudades', payload: cities })

    //set the cities (objects) of the selected country
    dispatch({ type: 'setAllCitiesProps', payload: ciudadesObj })
    setDisplayCards(false); // update the displayCards state
  }
  //width map-container
  const [mapWidth, setMapWidth] = useState('100%')

  const onChangeCity = (ev) => {
    setCity(ev.target.innerText)
    let ciudadSeleccionada = ev.target.innerText;
    state.allCitiesProps.forEach((cityObj) => {
      let cityName = Object.keys(cityObj)[0];
      if (cityName.toLowerCase() === ciudadSeleccionada?.toLowerCase()) {
        let clinicsToDisplay = cityObj[cityName].clinics;
        console.log('clinicsToDisplay', clinicsToDisplay)
        dispatch({ type: 'setClinicsToDisplay', payload: clinicsToDisplay })
      }
    })
  }

  //setting date picker value onChange event
  const handleChange = (newValue) => {
    setDate(newValue);
  };

  const nameOfClinic = watch('nameOfClinic');

  let urlForMap = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinic}&inputtype=textquery&locationbias=circle%3A2000%4047.6918452%2C-122.2226413&fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry%2Cplace_id%2Cphoto&key=AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k`

  return (
    <div onClick={() => handleClose()}>

      {/* <Header/> */}

      <div className='filters__first-page-selected' style={{
        paddingTop: '3vw',
      }}>
        <div className="search-and-results-container" css={{
          width: 'calc(100% - 20.625rem)',
          minHeight: '40vh',
          margin: '0 auto',
        }}>
          <form onSubmit={handleSubmit((data) => {
            console.log('data', data);
          })}>
            <Accordion
              sx={{
                backgroundColor: "#3A89F4",
                marginBottom: '25px',
                margin: '0 auto!important'
              }}
            >
              <AccordionSummary
                marginbottom={{ md: 0 }}
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <div onClick={
                  (event) => {
                    handleClose()
                    event.stopPropagation()
                  }
                }>
                  <Stack direction={{ md: 'row' }} margintop={{ md: 5 }} spacing={2}>

                    {/* SPECIALITIES */}

                    <Autocomplete
                      onChange={(event) => {
                        unblockFields();
                        launchMapMultiMarker(event)
                      }}
                      disablePortal
                      id="specialities"
                      options={['Surgery', 'yoga', 'Audiology', 'Allergy']}
                      sx={{ width: '-webkit-fill-available', borderRadius: '14px', border: 'none', height: 'min-content' }}
                      renderInput={(params) => <TextField {...params} label="specialities"
                        {...register("specialities")}
                        css={
                          {
                            backgroundColor: 'white!important', borderRadius: '14px', border: 'none'
                          }
                        }
                      />}
                    />

                    {/*DATE PICKER */}
                    <DatePicker_requestForm showTooltip = {state.showTooltip}/>

                    {/* SEARCH ICON */}
                    <img src={searchIcon} width={39} height={41} alt="Magnifying glass icon"
                      onClick={handleSubmit((data) => {
                        console.log('data', data)
                      })} />
                  </Stack>
                </div>
                <FinderFilterContext.Provider value={{ open, filterMode, setOpen, setFilterMode }}>
                  <FilterFinding />
                </FinderFilterContext.Provider>
              </AccordionSummary >


              {/* second row of inputs */}
              <AccordionDetails margintop={{ md: 0 }}>
                <div onClick={(event) => { event.stopPropagation() }}>
                  <Stack direction={{ md: 'row' }} margintop={{ md: 5 }} spacing={2}>

                    {/* COUNTRIES */}

                    <Tooltip title={state.showTooltip}>
                      <div className="tooltip-shower">
                        <div className="not-specialities-dropdown">
                          <Autocomplete
                            onChange={(event) => {
                              onChangeCountry(event)
                            }}
                            disablePortal
                            options={state.countries}
                            sx={{ width: 300, backgroundColor: 'white', borderRadius: '14px', border: 'none' }}
                            renderInput={(params) => <TextField {...params} label="Countries"
                              {...register("countries")} />}
                          />
                        </div>
                      </div>
                    </Tooltip>

                    {/* CITIES */}

                    <Tooltip title={state.showTooltip}>
                      <div className="tooltip-shower">
                        <div className="not-specialities-dropdown">
                          <Autocomplete
                            onChange={(event) => {
                              onChangeCity(event)
                              setMapWidth('60%')
                              setDisplayCards(true)
                            }}
                            disablePortal
                            options={state.ciudades}
                            sx={{ width: 200, backgroundColor: 'white', borderRadius: '14px', border: 'none' }}
                            renderInput={(params) => <TextField {...params} label="Cities"
                              {...register("cities")}
                            />
                            }
                          />
                        </div>
                      </div>
                    </Tooltip>
                  </Stack>

                  {/* last stack for last item  */}
                  <Stack direction={{ md: 'row' }} marginTop={{ md: 3 }} spacing={2}>

                    {/* NAME OF CLINIC */}
                    <Tooltip title={state.showTooltip}>
                      <div className="tooltip-shower">
                        <div className="not-specialities-dropdown">
                          <TextField variant="standard" label="Clinic's name"
                            {...register("nameOfClinic")}
                            sx={{ width: '-webkit-fill-available', backgroundColor: 'white', borderRadius: '14px', border: 'none' }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                console.log('enter!', nameOfClinic)
                                fetch(urlForMap).then((nameOfClinicFetchResponse) => {
                                  return nameOfClinicFetchResponse.json()
                                }).then((nameOfClinicFetchResponseJson) => {
                                  dispatch({ type: 'setClinicsToDisplay', payload: [] })
                                  console.log('nameOfClinicFetchResponseJson', nameOfClinicFetchResponseJson.candidates[0])
                                  let data = nameOfClinicFetchResponseJson.candidates[0];
                                  let lat = data.geometry.location.lat;
                                  let lng = data.geometry.location.lng;
                                  let name = data.name;
                                  // renderizar condicionalmente en el template el "open now"
                                  let openNow = data.opening_hours.open_now || 3;
                                  let address = data.formatted_address;
                                  let rating = data.rating;
                                  let phone = 333444555;
                                  let photos = data.photos;
                                  let id = data.place_id || 1;
                                  let placeId = data.place_id;
                                  let clinicToDisplayObj = { lat, lng, name, openNow, address, rating, phone, photos, id, placeId }
                                  dispatch({ type: 'setLatLng', payload: { lat, lng } })
                                  console.log('state.latLng', state.latLng)
                                  dispatch({ type: 'setClinicsToDisplay', payload: [clinicToDisplayObj] })
                                })
                              }
                            }}
                          />
                        </div>
                      </div>
                    </Tooltip>
                  </Stack>
                </div>
              </AccordionDetails>
            </Accordion>
          </form>

          <div onClick={() => handleClose()} className="results-and-map-wrapper" css={{
            display: 'flex', gap: '8.5rem',
            minHeight: '80vh', marginTop: '5px'
          }}>

            {state.specialitySelected &&
              !nameOfClinic && displayCards && <div className="clinic-cards-container" css={{
                gap: '1rem',
                marginTop: '1rem!important',
                width: '30%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {state.specialitySelected && !nameOfClinic && <div id="panel"></div>}
                {state.specialitySelected && displayCards && logicFilterFinder(state.clinicsToDisplay, filterMode)}
                {state.specialitySelected && displayCards && state.clinicsToDisplay.map((clinic) => {
                  //capturar datos globales
                  return (
                    <MediaCard
                      name={clinic.name}
                      phone={clinic.distance}
                      address={clinic.address}
                      rating={clinic.rating}
                      openNow={clinic.openNow ? 'Open now' : 'Closed'}
                      key={clinic.id}
                      component="img"
                      height="140"
                      //photo={clinic.photos ? clinic.photos[0].getUrl({ 'maxWidth': 40, 'maxHeight': 140 }) : void(0)}
                      photo={clinic.photos ? clinic.photos[0] : 'no-clinic.webp'}
                      alt="No image found"
                    />
                  )
                })}
              </div>}
            <div css={{ width: `${mapWidth}`, maxHeight: '70vh' }}>
              {/* <CircularProgress /> */}

              <div id="panel" style={{ position: 'absolute', width: '20vw', height: 'auto', background: '-moz-linear-gradient(top, #000, #33FF66)', left: '68vw', borderRadius: '1vw', top: '28vh', zIndex: '14', }}></div>
              {state.specialitySelected &&
                nameOfClinic && <div className="map loader-spinner"
                  id="map" style={{ zIndex: zIndex }} css={{ width: 'auto', maxHeight: '70vh', marginTop: '4vh', borderRadius: '1vw' }}></div>}

              {state.specialitySelected &&
                !nameOfClinic && <div className="container-map loader-spinner"
                  id="container-map" style={{ zIndex: zIndex }} css={{ width: 'auto', maxHeight: '70vh', marginTop: '4vh', borderRadius: '1vw' }}></div>}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
