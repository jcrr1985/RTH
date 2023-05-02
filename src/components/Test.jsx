import data from '../models/cities_coords.json';
import { useEffect, useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, TextField, Autocomplete } from '@mui/material';
import { Slider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RoomSharpIcon from '@mui/icons-material/RoomSharp';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

import specialities from './RequestForm/specialities.js';
import DatePicker_requestForm from './datePicker';
import Back from '../assets/images/svg/Back.svg';
import { MediaCard } from "./MediaCard";

import { MapaMultiMarker } from './MapaMultiMarker';
import './../App.css'

export default function Test() {
  // const apiKey = import.meta.env.REACT_APP_GOOGLE_API_KEY;
  const apiKey = 'AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k';
  const myProxy = 'https://juliocorsproxy.herokuapp.com/'

  const infoPane = document.getElementById('panel');

  const [selectedCountry, setSelectedCountry] = useState('');
  const [cityValue, setCityValue] = useState('');
  const { register, handleSubmit } = useForm();
  const [speciality, setSpeciality] = useState('');
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [mapWidth, setMapWidth] = useState('80vw');
  const [clinicsToDisplay, setClinicsToDisplay] = useState(null);
  const [clinicSelected, setClinicSelected] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const onSubmit = (data) => {
  };

  const handleChangeEspecialitation = (event) => {
    if (event.target.innerText !== "" && event.target.innerText !== "Specialization") {
      setSpeciality(event.target.innerText);
      setMapWidth('57vw');
    } else {
      launchMapMultiMarker(selectedCountry, selectedCity, speciality)
    }
  };

  const handleChangeClinics = (event) => {
    setMapWidth('17vw');
    if (event.target.value !== "") {
      if (event.key === "Enter") {
        setClinicSelected(true);
        event.preventDefault();
        let urlForMap = `${myProxy}https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinic.value}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;
        fetch(urlForMap)
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
            let clinicToDisplayObj = { lat, lng, name, openNow, address, rating, phone, photos, id, placeId }
            setClinicsToDisplay([clinicToDisplayObj])
          })
      }
    };
  }

  const handleChangeCities = (event) => {
    if (event.target.innerText !== "" && event.target.innerText !== "City") {
      const ciudadSeleccionada = event.target.innerText;
      setCityValue(ciudadSeleccionada);
      setMapWidth('57vw');
    }
  };

  const handleCountryChange = (event) => {
    if (event.target.innerText !== "" && event.target.innerText !== "Country") {
      const paisSeleccionado = event.target.innerText;
      setSelectedCountry(paisSeleccionado);
      setCityValue('');
      let cityInput = document.getElementById('city-selected');
      console.log('cityInput', cityInput)
      cityInput.value = '';
    }
  };

  const marks = [
    { value: 0, label: '0' },
    { value: 200, label: '~' }
  ]

  const getValue = (e, val) => {
    console.warn(val);
    setSliderValue(val);
  }

  const countriesArray = useMemo(() => {
    return data.paises.map((country) => country.name);
  }, [data.paises]);

  const selectedCountryData = useMemo(() => {
    return data.paises.find((country) => country.name === selectedCountry) || {};
  }, [data.paises, selectedCountry]);

  const selectedCountryCities = useMemo(() => {
    return Object.keys(selectedCountryData.cities || {});
  }, [selectedCountryData]);

  useEffect(() => {
    // fetch countries from json file
    setCountries(countriesArray);
  }, []);


  useEffect(() => {
    setCityValue('');
    nameOfClinic.value = '';
    setMapWidth('100%');
    MapaMultiMarker(selectedCountry, cityValue, speciality);

    if (selectedCountry) {
      const countryData = data.paises.find((country) => country.name === selectedCountry);
      setCities(selectedCountryCities);
      setMapWidth('57vw');
    }
  }, [selectedCountry]);

  useEffect(() => {
    nameOfClinic.value = '';
    setMapWidth('100%');
    setClinicsToDisplay(null);
    MapaMultiMarker(selectedCountry, cityValue, speciality);
  }, [selectedCountry, cityValue, speciality]);

  useEffect(() => {
    setMapWidth('60%')
    MapaMultiMarker(selectedCountry, cityValue, speciality);
  }, [clinicsToDisplay]);

  return (
    <>
      <Box className="back-arrow">
        <Link to='../' style={{ textDecoration: 'none' }}>
          <img src={Back} alt="home-page" />
        </Link>
      </Box>
      <Box className="form-wrapper" id="formParentBox">

        {/* First row */}
        <form className="h2 top-form-inputs" onSubmit={handleSubmit(onSubmit)}>

          {/* SPECIALITIES */}
          <Autocomplete className="h2 req-form-input "
            id="specialization"
            {...register('specialization')}
            onChange={(ev) => {
              setSpeciality(ev.target.innerText);
              handleChangeEspecialitation(ev)
            }}
            style={{
              width: '33%', height: '56px'
            }}
            options={specialities}
            renderInput={(params) => <TextField {...params} label="Specialization"
              sx={{ backgroundColor: 'theme.palette.background.default', }} />}
          />
          {/* Date */}
          <DatePicker_requestForm register={register} />
          {/* Search Button */}
          <SearchIcon className='search-icon' fontSize="large" />
        </form>
        {/* second row */}

        <form className="h2 top-form-inputs">
          {/* countries */}
          <Autocomplete className='req-form-input'
            id="country-selected"
            {...register('country-selected')}
            onChange={(ev) => handleCountryChange(ev)}
            options={countries}
            renderInput={(params) => <TextField {...params} label="Country" />}
          />
          {/* cities */}
          <Autocomplete className='req-form-input' id="city-selected"
            inputValue={cityValue} {...register('city-selected')}
            onChange={(ev) => handleChangeCities(ev)}
            options={cities} renderInput={(params) => <TextField {...params} label="City" />}
          />
        </form>
        {/* third row */}

        <form className="h2 top-form-inputs" onSubmit={handleSubmit(onSubmit)}>
          {/* Name Of Clinics */}
          <TextField label="Clinic Name" variant="outlined"
            id="nameOfClinic" className='req-form-input'
            {...register('nameOfClinic')}
            onKeyDown={(ev) => handleChangeClinics(ev)
            } sx={{ width: '100%' }}
          />
          {/* PROCEDURES */}
          {/* <Autocomplete className='req-form-input' id="procedures" {...register('procedures')}
            onChange={(ev) => handleChangeProcedure(ev)}
            options={filter} renderInput={(params) => <TextField {...params} label="Procedures" />} /> */}

        </form>
        {/* cuarta fila */}
        <form className='filters' onSubmit={handleSubmit(onSubmit)}>
          <div className="icons_wrapper">
            <div>
              <RoomSharpIcon className='search-icon' />
              <span>Destination</span>
            </div>
            <div>
              <TranslateRoundedIcon className='search-icon' />
              <span>Translator</span>
            </div>
            <div>
              <DescriptionRoundedIcon className='search-icon' />
              <span className='int-acc'>International Accreditation</span>
            </div>
          </div>
          <div className="slider_wrapper">
            <div className="slider_leyent_top">
              <span className="T4"> Average service cost </span>
              <span className="T4"> {sliderValue} </span>
            </div>
            <div className="slider_bar">
              <Slider color="bar" defaultValue={0} max={10000} step={25} mark={marks}
                onChange={getValue} valueLabelDisplay="auto" />
            </div>
            <div className="slider_leyent_button">
              <span className="T4">0</span>
              <span className="T4">~</span>
            </div>
          </div>
        </form>

      </Box >
      <div className="search-and-results-container">
        <div className="results-and-map-wrapper">
          {<div className="clinic-cards-container">
            {clinicsToDisplay && clinicsToDisplay.map((clinic) => {
              return (
                <MediaCard
                  name={clinic.name}
                  phone={clinic.distance}
                  address={clinic.address}
                  rating={clinic.rating}
                  openNow={clinic.openNow ? 'Open now' : 'Closed'}
                  key={clinic.id}
                  component="img"
                  photo={clinic.photos ? clinic.photos[0] : 'no-clinic.webp'}
                />
              )
            })}
          </div>}
          <div css={{
            width: `${mapWidth}`,
            maxHeight: '70vh',
          }}>
            <div id="panel"></div>
            <div className="map" id="map"></div>
          </div>
        </div>
      </div>
    </>
  )
}