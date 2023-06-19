// import data from '../models/cities_coords.json';
import React, { useEffect, useState, useMemo, useContext } from "react";
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, TextField, Autocomplete, Pagination } from '@mui/material';
import { Slider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RoomSharpIcon from '@mui/icons-material/RoomSharp';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import ChangeLanguage from './ChangeLanguage';
import specialities from '../assets/specialities.js';
import DatePicker_requestForm from './datePicker';
import Back from '../assets/images/svg/Back.svg';
import { MediaCard } from "./MediaCard";

// Import JSON files as necessary to each translation

import citiesEn from '../models/cities_en.json';
import citiesRu from '../models/cities_ru.json';
// import citiesEs from '../models/cities_es.json';
// import citiesFr from '../models/cities_fr.json';
// import citiesEl from '../models/cities_el.json';
// import citiesPt from '../models/cities_pt.json';
// import citiesIt from '../models/cities_it.json';
// import citiesHi from '../models/cities_hi.json';
// import citiesAr from '../models/cities_ar.json';
// import citiesZh from '../models/cities_zh.json';
// import citiesJa from '../models/cities_ja.json';

import { MapaMultiMarker } from './MapaMultiMarker';
import LanguageContext from '../contexts/LanguageContext';

import { useTranslation } from 'react-i18next';

import './../App.css'


export default function Test() {
  // const apiKey = import.meta.env.REACT_APP_GOOGLE_API_KEY;
  const apiKey = 'AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k';
  const myProxy = 'https://juliocorsproxy.herokuapp.com/';

  const { t } = useTranslation();
  const { selectedLanguage } = useContext(LanguageContext);


  const [data, setData] = useState(citiesEn);
  const clinicsPerPage = 3;
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
  const [newArrayWithoutDuplicates, setNewArrayWithoutDuplicates] = useState([]);
  const [placesDistancesToUserPosition, setPlacesDistancesToUserPosition] = useState([]);


  const setDataForSelects = () => {
    // Choose the correct JSON file based on the selected language
    console.log('selectedLanguage en setDataForSelects', selectedLanguage)
    switch (selectedLanguage) {
      case 'en':
        setData(citiesEn);
        break;
      case 'ru':
        setData(citiesRu);
        break;
      // case 'es':
      //   setData(citiesEs);
      //   break;
      // case 'fr':
      //   setData(citiesFr);
      //   break;
      // case 'pt':
      //   setData(citiesPt);
      //   break;
      // case 'it':
      //   setData(citiesIt);
      //   break;
      // case 'hi':
      //   setData(citiesHi);
      //   break;
      // case 'ar':
      //   setData(citiesAr);
      //   break;
      // case 'zh':
      //   setData(citiesZh);
      //   break;
      // case 'ja':
      //   setData(citiesJa);
      //   break;
      // case 'el':
      //   setData(citiesEl);
      //   break;
      default:
        setData(citiesEn);
        break;
    }
    console.log('data', data);
  };


  useEffect(() => {
    setDataForSelects();
  }, [selectedLanguage]);


  newArrayWithoutDuplicates
  const [cardArray, setCardArray] = useState([]);

  const fillCardArray = (cardArray) => {
    console.log('cardArray en fillcardaraay', cardArray)
    setTimeout(() => {
      const newArrayWithoutDuplicates = [...new Set(cardArray.map((clinic) => clinic.name))].map((name) => {
        return cardArray.find((clinic) => clinic.name === name);
      });


      setCardArray(newArrayWithoutDuplicates)
    }, 10);
  }

  const onSubmit = (data) => {
  };

  const handleChangeEspecialitation = (event) => {
    if (event.target.innerText !== "" && event.target.innerText !== "Specialization") {
      setSpeciality(event.target.innerText);
      setMapWidth('57vw');
    }
  };

  const handleChangeClinics = (event) => {
    setMapWidth('17vw');
    if (event.target.value !== "") {
      if (event.key === "Enter") {
        setClinicSelected(true);
        event.preventDefault();
        let url = `${myProxy}https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinic.value}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;
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
            let clinicToDisplayObj = { lat, lng, name, openNow, address, rating, phone, photos, id, placeId }
            setClinicsToDisplay([clinicToDisplayObj])
          })
      }
    };
  }

  const handleChangeCities = (event) => {
    setCardArray([]);
    if (event.target.innerText !== "" && event.target.innerText !== "City") {
      const ciudadSeleccionada = event.target.innerText;
      setCityValue(ciudadSeleccionada);
      setMapWidth('57vw');
    }
  };

  const handleCountryChange = (event) => {
    setCardArray([]);
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
    setDataForSelects();
    return data.paises.map((country) => country.name);
  }, [data.paises]);

  const selectedCountryData = useMemo(() => {
    setDataForSelects();
    return data.paises.find((country) => country.name === selectedCountry) || {};
  }, [data.paises, selectedCountry]);

  const selectedCountryCities = useMemo(() => {
    return Object.keys(selectedCountryData.cities || {});
  }, [selectedCountryData]);

  useEffect(() => {
    const links = document.querySelectorAll('.filter-icon');

    links.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        links.forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
    setCountries(countriesArray);
  }, []);


  useEffect(() => {
    setCityValue('');
    nameOfClinic.value = '';
    setMapWidth('100%');
    MapaMultiMarker(selectedCountry, cityValue, speciality, fillCardArray, setPlacesDistancesToUserPosition);
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
    MapaMultiMarker(selectedCountry, cityValue, speciality, fillCardArray, setPlacesDistancesToUserPosition);
  }, [selectedCountry, cityValue, speciality]);

  useEffect(() => {
    const delay = 500; // tiempo de espera en milisegundos
    const timeoutId = setTimeout(() => {
      console.log('placesDistancesToUserPosition:', placesDistancesToUserPosition);
    }, delay);
    return () => clearTimeout(timeoutId); // Limpiar el temporizador
  }, [placesDistancesToUserPosition]);

  useEffect(() => {
    setMapWidth('60%')
    MapaMultiMarker(selectedCountry, cityValue, speciality, fillCardArray, setPlacesDistancesToUserPosition);
  }, [clinicsToDisplay]);

  const [page, setPage] = React.useState(1);

  const handlePaginationChange = (event, value) => {
    setPage(value);
  };

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
            renderInput={(params) => <TextField {...params} label={t('Specialization')}
              sx={{ backgroundColor: 'theme.palette.background.default', }} />}
          />
          {/* Date */}
          <DatePicker_requestForm register={register} />
          {/* Search Button */}
          <SearchIcon className='search-icon' fontSize="large" />

          <ChangeLanguage />

        </form>
        {/* second row */}

        <form className="h2 top-form-inputs">
          {/* countries */}
          <Autocomplete className='req-form-input'
            id="country-selected"
            {...register('country-selected')}
            onChange={(ev) => handleCountryChange(ev)}
            options={countries}
            renderInput={(params) => <TextField {...params} label={t('Country')} />}
          />
          {/* cities */}
          <Autocomplete className='req-form-input' id="city-selected"
            {...register('city-selected')}
            onChange={(ev) => handleChangeCities(ev)}
            options={cities} renderInput={(params) => <TextField {...params} label={t('City')} />}
          />
        </form>
        {/* third row */}

        <form className="h2 top-form-inputs" onSubmit={handleSubmit(onSubmit)}>
          {/* Name Of Clinics */}
          <TextField label={t('Clinic Name')} variant="outlined"
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
            <div className='filter-icon'>
              <RoomSharpIcon className='search-icon' />
              <span className=''>{t('Destination')}</span>
            </div>
            <div className='filter-icon'>
              <TranslateRoundedIcon className='search-icon' />
              <span className=''>{t('Translator')}</span>
            </div>
            <div className='filter-icon'>
              <DescriptionRoundedIcon className='search-icon' />
              <span className='int-acc'>{t('International Accreditation')}</span>
            </div>
          </div>
          <div className="slider_wrapper">
            <div className="slider_leyent_top">
              <span className="T4">{t('Average service cost')}</span>
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
          <div className="clinic-cards-container">
            {
              (cardArray.length === 0 && selectedCountry && cityValue) ?
                <>
                  <span className="no-results-container">no results found</span>
                </> :
                (
                  <>
                    {cardArray && cardArray.slice((page - 1) * clinicsPerPage, page * clinicsPerPage).map((clinic, index) => {
                      console.log('cardArray con valor!! :D', cardArray);
                      return (
                        <MediaCard
                          name={clinic.name}
                          phone={clinic.distance}
                          address={clinic.address}
                          rating={clinic.rating}
                          id={index}
                          distance={placesDistancesToUserPosition[index]}
                        />
                      );
                    })}
                    {cardArray.length >= 2 &&
                      <Pagination
                        count={Math.ceil(cardArray.length / clinicsPerPage)}
                        color="secondary"
                        onChange={handlePaginationChange}
                      />
                    }
                  </>
                )
            }
          </div>
          <div css={{ width: `${mapWidth}`, maxHeight: '70vh' }}>
            <div id="panel"></div>
            <div className="map" id="map"></div>
          </div>
        </div>
      </div>
    </>
  )
}