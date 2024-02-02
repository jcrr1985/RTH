import React, { useEffect, useState, useMemo, useContext, useRef } from "react";
// import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, TextField, Autocomplete, Pagination } from "@mui/material";
// import { Slider } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import RoomSharpIcon from "@mui/icons-material/RoomSharp";
// import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
// import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import ChangeLanguage from "./ChangeLanguage";
import specialities_en from "../assets/specialities_en.js";
import specialities_ru from "../assets/specialities_ru.js";
import specialities_it from "../assets/specialities_it.js";
import specialities_zh from "../assets/specialities_zh.js";
import specialities_fr from "../assets/specialities_fr.js";
import specialities_es from "../assets/specialities_es.js";

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
import { useSelector } from "react-redux";
import FeedbackModal from "./FeedbackModal";

import "./../App.css";
// import { clinicImg } from "@/assets/images/svg/clinic-image.svg";

export default function Test() {
  const countryInAmworld = useSelector((state) => state.countryInAmworld);
  const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";
  const proxy = "https://rth-server-d3n1.onrender.com";
  // const proxy = "http://http://localhost:5000/";

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
  const [cities, setCities] = useState([]);
  const [mapWidth, setMapWidth] = useState("100vw");
  const [clinicsToDisplay, setClinicsToDisplay] = useState(null);
  const [sliderValue, setSliderValue] = useState(0);
  // const [newArrayWithoutDuplicates, setNewArrayWithoutDuplicates] = useState(
  //   []
  // );
  const [placesDistancesToUserPosition, setPlacesDistancesToUserPosition] =
    useState([]);

  const [selectedOptions, setSelectedOptions] = useState({
    country: "",
    city: "",
    speciality: "",
  });

  useEffect(() => {
    !!countryInAmworld && handleChangeCountry(null, countryInAmworld);
  }, [countryInAmworld]);

  const handleAutocompleteChange = (value, nameField) => {
    console.log("nameField", nameField);

    console.log("value", value);
    switch (nameField) {
      case "speciality":
        setSpeciality(value);
        setSelectedOptions((prevOptions) => ({
          ...prevOptions,
          speciality: value,
        }));
        break;
      case "country":
        setSelectedCountry(value);
        setSelectedOptions((prevOptions) => ({
          ...prevOptions,
          country: value,
        }));
        break;
      case "city":
        setCityValue(value);
        setSelectedOptions((prevOptions) => ({
          ...prevOptions,
          city: value,
        }));
        break;
      default:
        break;
    }
  };

  const setDataForSelects = () => {
    // Choosing the correct JSON file based on the selected language
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
        const apiUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${nameOfClinicValue}&inputtype=textquery&fields=name,formatted_address,rating,opening_hours,geometry,place_id&key=${apiKey}`;
        const url = `${proxy}/${apiUrl}`;

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

  const fillCardArray = async (cardArray) => {
    const map = document.getElementById("map");
    const service = new google.maps.places.PlacesService(map);

    //  Promise.all para esperar a que todas las llamadas getDetails se completen
    const detailsPromises = cardArray.map((card) => {
      return new Promise((resolve) => {
        const request = {
          placeId: card.placeId,
          fields: ["formatted_phone_number", "website"],
        };
        service.getDetails(request, (details, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            card.formatted_phone_number =
              details.formatted_phone_number || null;
            card.website = details.website || null;
          }
          resolve();
        });
      });
    });

    // Esperando a que todas las promesas se resuelvan antes de actualizar el estado
    await Promise.all(detailsPromises);

    const newArrayWithoutDuplicates = [
      ...new Set(cardArray.map((clinic) => clinic.name)),
    ].map((name) => {
      return cardArray.find((clinic) => clinic.name === name);
    });

    setCardArray(newArrayWithoutDuplicates);
  };

  useEffect(() => {
    reset({
      "city-selected": null,
    });
  }, [selectedOptions.country]);

  const onSubmit = (data) => {};

  const handleChangeEspecialitation = (event) => {
    if (
      event.target.innerText !== "" &&
      event.target.innerText !== "Specialization"
    ) {
      setSpeciality(event.target.innerText);
    }
  };

  const handleChangeCities = (event) => {
    setCardArray([]);
    if (event.target.innerText !== "" && event.target.innerText !== "City") {
      const ciudadSeleccionada = event.target.innerText;
      setCityValue(ciudadSeleccionada);
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
    const validLanguages = ["en", "ru", "it", "zh", "fr", "es"];
    if (validLanguages.includes(selectedLanguage)) {
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

  useEffect(() => {
    MapaMultiMarker(
      selectedCountry,
      cityValue,
      speciality,
      fillCardArray,
      setPlacesDistancesToUserPosition,
      selectedLanguage,
      null
    );
  }, [cityValue]);

  useEffect(() => {
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
      null
    );
  }, [selectedCountry, cityValue, speciality]);

  useEffect(() => {
    const clinicObj = clinicsToDisplay && clinicsToDisplay[0];
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

  useEffect(() => {
    const elementsWithTitle = document.querySelectorAll('[title="Open"]');

    elementsWithTitle.forEach((element) => {
      element.style.position = "absolute";
      element.style.left = "0px";
    });
  });

  return (
    <>
      <FeedbackModal />
      <div className="whole-wrapper">
        <div className="logo-container header-wide-screen">
          <div className="logo-container-text">
            <span className="logo-title">Run To Health</span>
            <span className="logo-text">
              A platform for finding medical services around the world quickly
              and easily
            </span>
          </div>
          <ChangeLanguage
            selectedLanguage={selectedLanguage}
            handleChangeLanguage={handleChangeLanguage}
          />
        </div>

        {/* header small screen */}

        <div className="logo-container header-smaller-screen">
          <div className="logo-container-text">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span className="logo-title">Run To Health</span>
              <ChangeLanguage
                selectedLanguage={selectedLanguage}
                handleChangeLanguage={handleChangeLanguage}
              />
            </div>
            <span className="logo-text">
              A platform for finding medical services around the world quickly
              and easily
            </span>
          </div>
        </div>

        {/* filters form  */}

        {/* wide-screen */}

        <Box className="form-wrapper filter-box-wide-screen" id="formParentBox">
          {/* First row */}
          <form
            className="h2 top-form-inputs"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* SPECIALITIES */}
            <Autocomplete
              className="h2 req-form-input"
              id="specialization"
              value={selectedOptions.speciality}
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
              value={selectedOptions.country}
              renderInput={(params) => (
                <TextField {...params} label={t("Country")} />
              )}
            />
            {/* cities */}
            <Autocomplete
              className="req-form-input"
              id="city-selected"
              value={selectedOptions.city}
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
            {/* Date */}
            <DatePicker_requestForm register={register} />
            {/* Search Button */}
            {/* <SearchIcon className="search-icon" fontSize="large" /> */}

            {/* second row */}

            {/* Name Of Clinics */}
          </form>
          <div className="row-clinic">
            <TextField
              label={t("Clinic Name")}
              variant="outlined"
              id="nameOfClinic"
              className="req-form-input clinic"
              {...register("nameOfClinic")}
              onKeyDown={(ev) => handleChangeClinics(ev)}
              sx={{ width: "100%" }}
            />
          </div>
        </Box>

        {/* smaller screen */}

        <Box
          className="form-wrapper filter-box-smaller-screen"
          id="formParentBox"
        >
          {/* First row */}
          <form
            className="h2 top-form-inputs"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* specialities */}
            <div className="filter-row">
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
            </div>

            <div className="filter-row">
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
              {/* Date */}
              <DatePicker_requestForm register={register} />
              {/* Search Button */}
              {/* <SearchIcon className="search-icon" fontSize="large" /> */}
            </div>

            {/* third row */}

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
        </Box>

        <div className="search-and-results-container">
          <div className="results-and-map-wrapper">
            {cardArray.length !== 0 && (
              <div className="clinic-cards-container">
                {cardArray &&
                cardArray.length === 0 &&
                selectedCountry &&
                cityValue ? (
                  <>
                    {showNoResults ?? (
                      <span className="no-results-container">
                        no results found
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {cardArray &&
                      cardArray
                        .slice(
                          (page - 1) * clinicsPerPage,
                          page * clinicsPerPage
                        )
                        .map((clinic, index) => {
                          console.log("clinic", clinic);
                          return (
                            <MediaCard
                              key={clinic.placeId}
                              name={clinic.name}
                              phone={clinic.phone}
                              address={clinic.address}
                              rating={clinic.rating}
                              distance={placesDistancesToUserPosition[index]}
                              openNow={clinic.openNow}
                              formatted_phone_number={
                                clinic.formatted_phone_number
                              }
                              website={clinic.website}
                              //there's a photo property too (array). in [0] I can access to html_attributions[0]
                              //and the value is smth like <a href=\"https://maps.google.com/maps/contrib/102888846898940690071\">A Google User</a>"
                              //from there I can to extract the href, to get the photos of the clinic.
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
            )}
            <div style={{ width: `${mapWidth}`, height: "auto" }}>
              <div id="panel"></div>
              <div className="map" id="map"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
