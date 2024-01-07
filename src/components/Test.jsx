import React, { useEffect, useState, useMemo, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, TextField, Autocomplete, Pagination } from "@mui/material";
import { Slider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RoomSharpIcon from "@mui/icons-material/RoomSharp";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import ChangeLanguage from "./ChangeLanguage";
import specialities_en from "../assets/specialities_en.js";
import specialities_ru from "../assets/specialities_ru.js";
import specialities_it from "../assets/specialities_it.js";
import specialities_zh from "../assets/specialities_zh.js";
import specialities_fr from "../assets/specialities_fr.js";
import specialities_es from "../assets/specialities_es.js";

import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

import DatePicker_requestForm from "./datePicker";
import Back from "../assets/images/svg/Back.svg";
import { MediaCard } from "./MediaCard";

import citiesEn from "../models/cities_en.json";
import citiesRu from "../models/cities_ru.json";
import citiesEs from "../models/cities_es.json";
import citiesFr from "../models/cities_fr.json";
import citiesIt from "../models/cities_it.json";
import citiesZh from "../models/cities_zh.json";

import { MapaMultiMarker } from "./MapaMultiMarker";
import LanguageContext from "../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import "./../App.css";
import { useSelector } from "react-redux";
import FeedbackModal from "./FeedbackModal";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function Test(props) {
  const countryInAmworld = useSelector((state) => state.countryInAmworld);
  const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";

  const { t } = useTranslation();
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);

  const handleChangeLanguage = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const [data, setData] = useState(citiesEn);
  const [specialities, setSpecialities] = useState(specialities_en);
  const clinicsPerPage = 3;
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cityValue, setCityValue] = useState("");
  const { register, handleSubmit, getValues, reset, setValue } = useForm();
  const [speciality, setSpeciality] = useState("");
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [mapWidth, setMapWidth] = useState("80vw");
  const [clinicsToDisplay, setClinicsToDisplay] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [newArrayWithoutDuplicates, setNewArrayWithoutDuplicates] = useState(
    []
  );
  const [placesDistancesToUserPosition, setPlacesDistancesToUserPosition] =
    useState([]);

  const [selectedOptions, setSelectedOptions] = useState({
    country: "",
    city: "",
    speciality: "",
  });

  useEffect(() => {
    console.log("countryInAmworld yeyyy", countryInAmworld);
    !!countryInAmworld && handleChangeCountry(null, countryInAmworld);
  }, [countryInAmworld]);

  const handleAutocompleteChange = (value, nameField) => {
    let selectedIndices;

    switch (nameField) {
      case "speciality":
        selectedIndices = specialities.findIndex(
          (speciality) => speciality === value
        );
        setSelectedOptions((prevOptions) => ({
          ...prevOptions,
          speciality: selectedIndices,
        }));
        // setSpeciality(specialities[selectedIndices]);
        break;
      case "country":
        selectedIndices = countriesArray.findIndex(
          (country) => country === value
        );
        setSelectedOptions((prevOptions) => ({
          ...prevOptions,
          country: selectedIndices,
        }));
        // setSelectedCountry(countriesArray[selectedIndices]);
        break;
      case "city":
        selectedIndices = cities.findIndex((city) => city === value);
        setSelectedOptions((prevOptions) => ({
          ...prevOptions,
          city: selectedIndices,
        }));
        setCityValue(cities[selectedIndices]);
        break;
      default:
        break;
    }
  };

  const setDataForSelects = () => {
    // Choose the correct JSON file based on the selected language
    switch (selectedLanguage) {
      case "en":
        setData(citiesEn);
        setSpecialities(specialities_en);
        updateSelectLabels();
        break;
      case "ru":
        setData(citiesRu);
        setSpecialities(specialities_ru);
        updateSelectLabels();
        break;
      case "it":
        setData(citiesIt);
        setSpecialities(specialities_it);
        updateSelectLabels();
        break;
      case "zh":
        setData(citiesZh);
        setSpecialities(specialities_zh);
        updateSelectLabels();
        break;
      case "fr":
        setData(citiesFr);
        setSpecialities(specialities_fr);
        updateSelectLabels();
        break;
      case "es":
        setData(citiesEs);
        setSpecialities(specialities_es);
        updateSelectLabels();
        break;
      default:
        setData(citiesEn);
        setSpecialities(specialities_en);
        break;
    }
  };

  const handleChangeClinics = (event) => {
    setMapWidth("17vw");
    if (event.target.value !== "") {
      if (event.key === "Enter") {
        event.preventDefault();
        const nameOfClinicValue = getValues("nameOfClinic");

        const corsAnywhereProxy = "https://cors-anywhere.herokuapp.com/";
        const url = `${corsAnywhereProxy}https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinicValue}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;

        // let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinicValue}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;

        // let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinicValue}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;
        console.log("url", url);
        fetch(url)
          .then((nameOfClinicFetchResponse) => {
            return nameOfClinicFetchResponse.json();
          })
          .then((nameOfClinicFetchResponseJson) => {
            setClinicsToDisplay([]);
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
            let clinicToDisplayObj = {
              lat,
              lng,
              name,
              openNow,
              address,
              rating,
              phone,
              photos,
              id,
              placeId,
              data,
            };
            console.log("clinicToDisplayObj", clinicToDisplayObj);
            setClinicsToDisplay([clinicToDisplayObj]);
            reset({
              "country-selected": null,
              "city-selected": null,
            });
          })
          .catch((error) => {
            console.error("Error en la solicitud fetch:", error);
          });
      }
    }
  };

  const updateSelectLabels = () => {
    if (selectedOptions.city !== null && selectedOptions.city !== undefined) {
      const cityIndex = selectedOptions.city;
      if (cityIndex >= 0 && cityIndex < cities.length) {
        setCityValue(cities[cityIndex]);
      }
    }
    if (
      selectedOptions.country !== null &&
      selectedOptions.country !== undefined
    ) {
      const countryIndex = selectedOptions.country;
      if (countryIndex >= 0 && countryIndex < countriesArray.length) {
        setSelectedCountry(countriesArray[countryIndex]);
      }
    }
    if (
      selectedOptions.speciality !== null &&
      selectedOptions.speciality !== undefined
    ) {
      const specialityIndex = selectedOptions.speciality;
      if (specialityIndex >= 0 && specialityIndex < specialities.length) {
        setSpeciality(specialities[specialityIndex]);
      }
    }
  };

  useEffect(() => {
    setDataForSelects();
    updateSelectLabels();
  }, [selectedLanguage]);

  useEffect(() => {
    updateSelectLabels();
  }, [selectedOptions]);

  const [cardArray, setCardArray] = useState([]);

  const fillCardArray = (cardArray) => {
    setTimeout(() => {
      const newArrayWithoutDuplicates = [
        ...new Set(cardArray.map((clinic) => clinic.name)),
      ].map((name) => {
        return cardArray.find((clinic) => clinic.name === name);
      });

      setCardArray(newArrayWithoutDuplicates);
    }, 10);
  };

  useEffect(() => {
    reset({
      "city-selected": null,
    });
  }, [selectedCountry]);

  const onSubmit = (data) => {};

  const handleChangeEspecialitation = (event) => {
    if (
      event.target.innerText !== "" &&
      event.target.innerText !== "Specialization"
    ) {
      setSpeciality(event.target.innerText);
      setMapWidth("57vw");
    }
  };

  const handleChangeCities = (event) => {
    setCardArray([]);
    if (event.target.innerText !== "" && event.target.innerText !== "City") {
      const ciudadSeleccionada = event.target.innerText;
      setCityValue(ciudadSeleccionada);
      setMapWidth("57vw");
    }
  };

  const handleChangeCountry = (event, countryInAmworld) => {
    setCityValue("");

    if (!event) {
      const paisSeleccionado = countryInAmworld;
      setSelectedCountry(paisSeleccionado);
      const selectedCountryData = data.paises.find(
        (country) => country.name === paisSeleccionado
      );
      console.log("selectedCountryData", selectedCountryData);
      const selectedCountryCities = selectedCountryData.cities || [];
      setCities(selectedCountryCities);
      return;
    }

    setCardArray([]);
    if (event.target.innerText !== "" && event.target.innerText !== "Country") {
      const paisSeleccionado = event.target.innerText;
      setSelectedCountry(paisSeleccionado);
      setCityValue("");
      const selectedCountryData = data.paises.find(
        (country) => country.name === paisSeleccionado
      );
      const selectedCountryCities = selectedCountryData.cities || [];
      setCities(selectedCountryCities);
    }
  };

  const getValue = (e, val) => {
    console.warn(val);
    setSliderValue(val);
  };

  const countriesArray = useMemo(() => {
    return data.paises.map((country) => country.name);
  }, [data.paises, selectedLanguage]);

  const selectedCountryCities = useMemo(() => {
    if (selectedCountry) {
      const selectedCountryData = data.paises.find(
        (country) => country.name === selectedCountry
      );
      return selectedCountryData?.cities;
    }
    return [];
  }, [data.paises, selectedCountry, selectedLanguage]);

  useEffect(() => {
    updateSelectLabels();
  }, [cities, countriesArray, specialities]);

  useEffect(() => {
    console.log("1 11111111111111111111111");
    setMapWidth("60%");

    const validLanguages = ["en", "ru", "it", "zh", "fr", "es"];
    if (validLanguages.includes(selectedLanguage)) {
      console.log("000000000000000");

      MapaMultiMarker(
        selectedCountry,
        cityValue,
        speciality,
        fillCardArray,
        setPlacesDistancesToUserPosition,
        selectedLanguage
      );
    } else {
      console.log("selectedLanguage no es un código de idioma válido");
    }

    // ...
  }, [selectedCountry, cityValue, speciality, selectedLanguage]);

  useEffect(() => {
    nameOfClinic.value = "";
    setMapWidth("100%");
    MapaMultiMarker(
      selectedCountry,
      cityValue,
      speciality,
      fillCardArray,
      setPlacesDistancesToUserPosition,
      selectedLanguage
    );
    if (selectedCountry) {
      setCities(selectedCountryCities);
      setMapWidth("57vw");
    }
  }, [selectedCountry]);

  const [showNoResults, setShowNoResults] = useState(false);

  function xxx(a) {
    console.log(" ~ trueOrFalse:", a);
    setShowNoResults(a);
    setTimeout(() => {
      console.log(
        "🚀 ~ file: Test.jsx:378 ~ Test ~ showNoResults:",
        showNoResults
      );
    }, 2000);
  }
  useEffect(() => {
    MapaMultiMarker(
      selectedCountry,
      cityValue,
      speciality,
      fillCardArray,
      setPlacesDistancesToUserPosition,
      selectedLanguage,
      null,
      xxx
    );
  }, [cityValue]);

  useEffect(() => {
    console.log("22222222222222222");

    nameOfClinic.value = "";
    setMapWidth("100%");
    setClinicsToDisplay(null);
    MapaMultiMarker(
      selectedCountry,
      cityValue,
      speciality,
      fillCardArray,
      setPlacesDistancesToUserPosition,
      selectedLanguage,
      null,
      xxx
    );
  }, [selectedCountry, cityValue, speciality]);

  useEffect(() => {
    const delay = 500;
    const timeoutId = setTimeout(() => {}, delay);
    return () => clearTimeout(timeoutId);
  }, [placesDistancesToUserPosition]);

  useEffect(() => {
    console.log("3333333333333333");

    setMapWidth("60%");
    const clinicObj = clinicsToDisplay && clinicsToDisplay[0];
    console.log("clinicObj linicsToDisplay[0]", clinicObj);
    MapaMultiMarker(
      null,
      null,
      null,
      fillCardArray,
      null,
      selectedLanguage,
      clinicObj
    );
  }, [clinicsToDisplay]);

  const [page, setPage] = React.useState(1);

  const handlePaginationChange = (event, value) => {
    setPage(value);
  };

  const autocompleteRef = useRef(null);

  const handleTyping = () => {
    autocompleteRef.current.dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true })
    );
    autocompleteRef.current.value = "brazil";
    autocompleteRef.current.dispatchEvent(
      new Event("change", { bubbles: true })
    );
  };

  return (
    <>
      <FeedbackModal />
      <Box className="back-arrow">
        <Link to="../" style={{ textDecoration: "none" }}>
          <img src={Back} alt="home-page" />
        </Link>
      </Box>
      <Box className="form-wrapper" id="formParentBox">
        {/* First row */}
        <form className="h2 top-form-inputs" onSubmit={handleSubmit(onSubmit)}>
          {/* SPECIALITIES */}
          <Autocomplete
            className="h2 req-form-input"
            id="specialization"
            {...register("specialization")}
            onChange={(event, value) => {
              setSpeciality(value);
              handleChangeEspecialitation(event);
              handleAutocompleteChange(value, "speciality");
            }}
            style={{
              width: "33%",
              height: "56px",
            }}
            options={specialities}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Specialization")}
                sx={{ backgroundColor: "theme.palette.background.default" }}
              />
            )}
          />
          {/* Date */}
          <DatePicker_requestForm register={register} />
          {/* Search Button */}
          <SearchIcon className="search-icon" fontSize="large" />

          <ChangeLanguage
            selectedLanguage={selectedLanguage}
            handleChangeLanguage={handleChangeLanguage}
          />
        </form>
        {/* second row */}

        <form className="h2 top-form-inputs">
          {/* countries */}
          <Autocomplete
            ref={autocompleteRef}
            className="req-form-input"
            id="country-selected"
            {...register("country-selected")}
            onChange={(event, value) => {
              handleChangeCountry(event, countryInAmworld);
              handleAutocompleteChange(value, "country");
            }}
            options={countriesArray}
            // value={countryInAmworld}
            renderInput={(params) => (
              <TextField {...params} label={t("Country")} />
            )}
          />
          {/* cities */}
          <Autocomplete
            className="req-form-input"
            id="city-selected"
            {...register("city-selected")}
            onChange={(event, value) => {
              handleChangeCities(event);
              handleAutocompleteChange(value, "city");
            }}
            options={cities}
            renderInput={(params) => (
              <TextField {...params} label={t("City")} />
            )}
          />
        </form>
        {/* third row */}

        <form className="h2 top-form-inputs" onSubmit={handleSubmit(onSubmit)}>
          {/* Name Of Clinics */}
          <TextField
            label={t("Clinic Name")}
            variant="outlined"
            id="nameOfClinic"
            className="req-form-input"
            {...register("nameOfClinic")}
            onKeyDown={(ev) => handleChangeClinics(ev)}
            sx={{ width: "100%" }}
          />
        </form>
        {/* cuarta fila */}
        <form className="filters" onSubmit={handleSubmit(onSubmit)}>
          <div className="icons_wrapper">
            <div className="filter-icon">
              <RoomSharpIcon className="search-icon" />
              <span className="">{t("Destination")}</span>
            </div>
            <div className="filter-icon">
              <TranslateRoundedIcon className="search-icon" />
              <span className="">{t("Translator")}</span>
            </div>
            <div className="filter-icon">
              <DescriptionRoundedIcon className="search-icon" />
              <span className="int-acc">
                {t("International Accreditation")}
              </span>
            </div>
          </div>
          <div className="slider_wrapper">
            <div className="slider_leyent_top">
              <span className="T4">{t("Average service cost")}</span>
              <span className="T4"> {sliderValue} </span>
            </div>
            <div className="slider_bar">
              {/* marks={marks} */}
              <Slider
                color="bar"
                defaultValue={0}
                max={10000}
                step={25}
                onChange={getValue}
                valueLabelDisplay="auto"
              />
            </div>
            <div className="slider_leyent_button">
              <span className="T4">0</span>
              <span className="T4">~</span>
            </div>
          </div>
        </form>
      </Box>
      <div className="search-and-results-container">
        <div className="results-and-map-wrapper">
          <div className="clinic-cards-container">
            {cardArray &&
            cardArray.length === 0 &&
            selectedCountry &&
            cityValue ? (
              <>
                {showNoResults ?? (
                  <span className="no-results-container">no results found</span>
                )}
              </>
            ) : (
              <>
                {cardArray &&
                  cardArray
                    .slice((page - 1) * clinicsPerPage, page * clinicsPerPage)
                    .map((clinic, index) => {
                      return (
                        <MediaCard
                          name={clinic.name}
                          phone={clinic.distance}
                          address={clinic.address}
                          rating={clinic.rating}
                          key={index}
                          distance={placesDistancesToUserPosition[index]}
                          openNow={clinic.openNow}
                          fono={clinic.phone}
                        />
                      );
                    })}
                {cardArray && cardArray.length >= 2 && (
                  <Pagination
                    count={Math.ceil(cardArray.length / clinicsPerPage)}
                    color="secondary"
                    onChange={handlePaginationChange}
                  />
                )}
              </>
            )}
          </div>
          <div css={{ width: `${mapWidth}`, maxHeight: "70vh" }}>
            <div id="panel"></div>
            <div className="map" id="map"></div>
          </div>
        </div>
      </div>
    </>
  );
}
