import React, { useEffect, useState, useMemo, useContext } from "react";
import CircularProgress from "@mui/material/CircularProgress";

import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  Box,
  TextField,
  Autocomplete,
  Pagination,
  useMediaQuery,
  Button,
} from "@mui/material";
import "sweetalert2/src/sweetalert2.scss";
import axios from "axios";

import * as specialitiesArray from "../assets/js/specialities/specialities.js";
import {
  citiesEn,
  citiesRu,
  citiesEs,
  citiesFr,
  citiesIt,
  citiesZh,
} from "../assets/js/countries-cities/countries-cities.js";
import ChangeLanguage from "./ChangeLanguage";
import MediaCard from "./MediaCard";
import { MapaMultiMarker } from "./MapaMultiMarker";
import LanguageContext from "../contexts/LanguageContext";
import FeedbackModal from "./FeedbackModal";
import wideChevron from "../../public/chevron-down.png";
import { centrar } from "./centrar.js";
import createClinicObj from "../helpers/createClinicObj.js";
import "./../App.css";
import getDiagnosis from "./../api/openai";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

const apiKey = "AIzaSyDlqhte9y0XRMqlkwF_YJ6Ynx8HQrNyF3k";
const proxy = "http://localhost:5000";
const clinicsPerPage = 4;

export default function Test() {
  // Hooks
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:768px)");

  // States
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext);
  const [userPosition, setUserPosition] = useState();
  const [mapy, setMapy] = useState();
  const [data, setData] = useState(citiesEn);
  const [specialities, setSpecialities] = useState(
    specialitiesArray.specialities_en
  );
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cityValue, setCityValue] = useState("");
  const { register, handleSubmit, getValues, reset, setValue } = useForm();
  const [speciality, setSpeciality] = useState("");
  const [cities, setCities] = useState([]);
  const [clinicsToDisplay, setClinicsToDisplay] = useState(null);
  const [placesDistancesToUserPosition, setPlacesDistancesToUserPosition] =
    useState([]);
  const [selectedOptions, setSelectedOptions] = useState({
    country: "",
    city: "",
    speciality: "",
  });
  const [diagnosis, setDiagnosis] = useState("");
  const [cardArray, setCardArray] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [page, setPage] = React.useState(1);

  // Handlers
  const handleChangeLanguage = (languageCode) => {
    setSelectedLanguage(languageCode);
  };
  const setUserCurrentPosition = (userPos) => {
    setUserPosition(userPos);
  };
  const setsetMapyMapy = (mapy) => {
    setMapy(mapy);
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleAutocompleteChange = (value, nameField) => {
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
        setSpecialities(specialitiesArray.specialities_en);
        break;
      case "ru":
        setData(citiesRu);
        setSpecialities(specialitiesArray.specialities_ru);
        break;
      case "it":
        setData(citiesIt);
        setSpecialities(specialitiesArray.specialities_it);
        break;
      case "zh":
        setData(citiesZh);
        setSpecialities(specialitiesArray.specialities_zh);
        break;
      case "fr":
        setData(citiesFr);
        setSpecialities(specialitiesArray.specialities_fr);
        break;
      case "es":
        setData(citiesEs);
        setSpecialities(specialitiesArray.specialities_es);
        break;
      default:
        setData(citiesEn);
        setSpecialities(specialitiesArray.specialities_en);
        break;
    }
  };

  const handleChangeClinics = (event) => {
    if (event.target.value !== "") {
      if (event.key === "Enter") {
        event.preventDefault();
        const nameOfClinicValue = getValues("nameOfClinic");
        console.log("nameOfClinicValue", nameOfClinicValue);

        const url = `${proxy}/clinics?name=${nameOfClinicValue}`;

        axios
          .get(url)
          .then((response) => {
            const nameOfClinicFetchResponseJson = response.data;
            setClinicsToDisplay([]);

            const clinicToDisplayObj = createClinicObj(
              nameOfClinicFetchResponseJson
            );
            setClinicsToDisplay([clinicToDisplayObj]);
            reset({
              "country-selected": null,
              "city-selected": null,
            });
          })
          .catch((error) => {
            console.error("Error en la solicitud axios:", error);
          });
      }
    }
  };

  const handleDiagnosisRequest = async (event) => {
    if (event.key === "Enter" && event.target.value !== "") {
      event.preventDefault();
      const diagnosisInput = event.target.value;
      setDiagnosis(diagnosisInput);

      try {
        Swal.showLoading();
        const diagnosisResponse = await getDiagnosis(diagnosisInput);
        const diagnosisLines = diagnosisResponse.split("\n");

        Swal.fire({
          title: "Diagnosis",
          html: `
                <div style="
                    max-height: 300px;
                    overflow-y: auto;
                    text-align: left;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                ">
                    ${diagnosisLines
                      .map(
                        (line) =>
                          `<p style="margin: 0; margin-bottom: 16px;">${line}</p>`
                      )
                      .join("")}
                </div>
            `,
          icon: "success",
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          Swal.fire({
            title: "Too Many Requests",
            text: "Please try again later. Currently, there are no available tokens.",
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Error",
            text: "An error occurred while fetching the diagnosis. Please try again later.",
            icon: "error",
          });
        }
        console.error("Error fetching diagnosis:", error);
      } finally {
        Swal.hideLoading();
      }
    }
  };

  useEffect(() => {
    setDataForSelects();
  }, [selectedLanguage]);

  //calculate time
  async function getTravelTime(origin, destination, mode) {
    const directionsService = new google.maps.DirectionsService();

    const request = {
      origin: origin, // LatLng | String | google.maps.Place,
      destination: destination, // LatLng | String | google.maps.Place,
      travelMode: google.maps.TravelMode[mode], // 'DRIVING' or 'WALKING'
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === "OK") {
          const duration = result.routes[0].legs[0].duration;
          resolve(duration.text); // or duration.value for seconds
        } else {
          reject("Directions request failed due to " + status);
        }
      });
    });
  }

  const fillCardArray = async (cardArray) => {
    setIsLoading(true);
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    // Crear un array de promesas para obtener detalles y tiempos de viaje
    const promises = cardArray.map((card) => {
      return new Promise(async (resolve) => {
        // Obtener detalles
        const request = {
          placeId: card.placeId,
          fields: ["formatted_phone_number", "website"],
        };
        service.getDetails(request, async (details, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            card.formatted_phone_number =
              details.formatted_phone_number || null;
            card.website = details.website || null;
          }

          // Obtener tiempos de viaje
          try {
            const timeByCar = await getTravelTime(
              userPosition,
              { lat: card.lat, lng: card.lng },
              "DRIVING"
            );
            card.timeByCar = timeByCar;

            const timeByFoot = await getTravelTime(
              userPosition,
              { lat: card.lat, lng: card.lng },
              "WALKING"
            );
            card.timeByFoot = timeByFoot;
          } catch (error) {
            console.error("Error obtaining travel time:", error);
          }

          resolve();
        });
      });
    });

    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);

    // Eliminar duplicados y actualizar el estado
    const newArrayWithoutDuplicates = [
      ...new Set(cardArray.map((clinic) => clinic.name)),
    ].map((name) => {
      return cardArray.find((clinic) => clinic.name === name);
    });

    setCardArray(newArrayWithoutDuplicates);
    setIsLoading(false);

    console.log("newArrayWithoutDuplicates", newArrayWithoutDuplicates);
  };

  useEffect(() => {
    reset({
      "city-selected": null,
    });
  }, [selectedOptions.country]);

  const handleChangeCities = (event) => {
    setCardArray([]);
    if (event.target.innerText !== "" && event.target.innerText !== "City") {
      const ciudadSeleccionada = event.target.innerText;
      setCityValue(ciudadSeleccionada);
    }
  };

  const handleChangeCountry = (event) => {
    setCityValue("");
    setCardArray([]);
    if (event.target.innerText !== "" && event.target.innerText !== "Country") {
      const paisSeleccionado = event.target.innerText;
      setSelectedCountry(paisSeleccionado);
      setCityValue("");
      const selectedCountryData = data.paises.find(
        (country) => country.name === paisSeleccionado
      );
      console.log("selectedCountryData", selectedCountryData);
      const selectedCountryCities = selectedCountryData.cities || [];
      setCities(selectedCountryCities);
    }
  };

  const countriesArray = useMemo(() => {
    return data.paises.map((country) => country.name);
  }, [data.paises, selectedLanguage]);

  useEffect(() => {
    centrar();
  }, []);

  useEffect(() => {
    const clinicObj = clinicsToDisplay && clinicsToDisplay[0];

    if (selectedCountry) {
      MapaMultiMarker(
        selectedCountry,
        cityValue,
        speciality,
        fillCardArray,
        setPlacesDistancesToUserPosition,
        selectedLanguage,
        clinicObj,
        setUserCurrentPosition,
        setsetMapyMapy
      );
    }
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
      clinicObj,
      setUserCurrentPosition,
      null
    );
  }, [clinicsToDisplay]);

  const handlePaginationChange = (event, value) => {
    setPage(value);
  };

  const toggleVisibility = () => {
    setShowCards((prevShowCards) => !prevShowCards);
  };

  return (
    <>
      <FeedbackModal />
      <div className="whole-wrapper">
        <header className="logo-container">
          <div className="logo-container-text">
            <h1 className="logo-title">Run To Health</h1>
            <p className="logo-text">
              A platform for finding medical services around the world quickly
              and easily
            </p>
          </div>
          <ChangeLanguage
            selectedLanguage={selectedLanguage}
            handleChangeLanguage={handleChangeLanguage}
          />
        </header>
        <main>
          <form className="top-form-inputs">
            {/* SPECIALITIES */}
            {specialities && (
              <Autocomplete
                className="req-form-input"
                id="specialization"
                value={selectedOptions.speciality}
                {...register("specialization")}
                onChange={(event, value) => {
                  setSpeciality(value);
                  handleAutocompleteChange(value, "speciality");
                }}
                options={specialities || []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("Specialization")}
                    sx={{ backgroundColor: "theme.palette.background.default" }}
                  />
                )}
                clearIcon={<></>}
              />
            )}
            {/* countries */}
            <Autocomplete
              className="req-form-input"
              id="country-selected"
              {...register("country-selected")}
              onChange={(event, value) => {
                handleChangeCountry(event);
                handleAutocompleteChange(value, "country");
              }}
              options={countriesArray}
              value={selectedOptions.country}
              renderInput={(params) => (
                <TextField {...params} label={t("Country")} />
              )}
              clearIcon={<></>}
            />
            {/* cities */}
            <Autocomplete
              className="req-form-input city"
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
              clearIcon={<></>}
            />
            {/* Name Of Clinics */}
            {/* <TextField
              label={t("Clinic Name")}
              variant="outlined"
              id="nameOfClinic"
              className="req-form-input clinic"
              {...register("nameOfClinic")}
              onKeyDown={(ev) => handleChangeClinics(ev)}
              sx={{ width: "100%" }}
            /> */}
            {/* Dianosis Request */}
            <TextField
              label={t("Quick Diagnosis Advice")}
              variant="outlined"
              id="diagnosisRequest"
              className="req-form-input clinic"
              {...register("diagnosisRequest")}
              onKeyDown={(ev) => handleDiagnosisRequest(ev)}
              sx={{ width: "100%", display: "none" }}
            />
          </form>
          {isLoading && (
            <div className="loader-container">
              <CircularProgress color="secondary" />
              <p className="loader-text">Your clinics are loading ✨✨ </p>
            </div>
          )}
          <div className="search-and-results-container">
            <div className="card-map-toggler">
              {isMobile && cardArray.length !== 0 && (
                <Button
                  onClick={toggleVisibility}
                  aria-label={
                    showCards ? "Hide clinic cards" : "Show clinic cards"
                  }
                >
                  <img
                    className={`chevron-icon ${
                      showCards ? "rotated" : "pulsar"
                    }`}
                    src={wideChevron}
                    alt="chevron icon"
                  />
                </Button>
              )}
            </div>
            <div className="results-and-map-wrapper">
              {cardArray.length !== 0 && (
                <Box
                  display={isMobile ? (showCards ? "block" : "none") : "block"}
                  className="clinic-cards-container"
                >
                  {cardArray &&
                    cardArray
                      .slice((page - 1) * clinicsPerPage, page * clinicsPerPage)
                      .map((clinic, index) => {
                        return (
                          <MediaCard
                            key={clinic.placeId + "_" + index}
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
                            mapy={mapy}
                            userPosition={userPosition}
                            destination={{ lat: clinic.lat, lng: clinic.lng }}
                            timeByCar={clinic.timeByCar}
                            timeByFoot={clinic.timeByFoot}
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
                </Box>
              )}
              <Box
                display={showCards ? "none" : "block"}
                className="map-container"
              >
                <div id="panel"></div>
                <div className="map" id="map"></div>
              </Box>
            </div>
          </div>
        </main>
        <footer>
          <FeedbackModal />
          <p className="check-out-jobs">
            check out AI Jobs Vacancies on{" "}
            <a href="https://aijobshome.com">AI JOBS HOME</a>
          </p>
        </footer>
      </div>
    </>
  );
}
