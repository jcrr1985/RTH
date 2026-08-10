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
import { enrichClinics } from "../helpers/enrichClinics.js";
import "./../App.css";
import getDiagnosis from "./../api/openai";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";

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

  // Renders clinics as soon as the search results arrive, without waiting
  // on the slower per-clinic phone/website/travel-time lookups. Those are
  // fetched lazily, only for the page currently on screen (see the
  // enrichment effect below), so the UI is never blocked behind N x
  // Google API round trips for results the user hasn't scrolled to yet.
  const fillCardArray = (places) => {
    const seenPlaceIds = new Set();
    const deduped = places.filter((place) => {
      if (seenPlaceIds.has(place.placeId)) return false;
      seenPlaceIds.add(place.placeId);
      return true;
    });

    setCardArray(deduped);
    setPage(1);
  };

  useEffect(() => {
    reset({
      "city-selected": null,
    });
  }, [selectedOptions.country]);

  const handleChangeCities = (ciudadSeleccionada) => {
    setCardArray([]);
    setCityValue(ciudadSeleccionada || "");
  };

  const handleChangeCountry = (paisSeleccionado) => {
    setCityValue("");
    setCardArray([]);
    setSelectedCountry(paisSeleccionado || "");

    if (!paisSeleccionado) {
      setCities([]);
      return;
    }

    const selectedCountryData = data.paises.find(
      (country) => country.name === paisSeleccionado
    );
    setCities(selectedCountryData ? selectedCountryData.cities || [] : []);
  };

  const countriesArray = useMemo(() => {
    return data.paises.map((country) => country.name);
  }, [data.paises, selectedLanguage]);

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

  // Lazily fetch phone/website/travel-time details only for the clinics on
  // the currently visible page. enrichClinics caches by placeId, so paging
  // back and forth never re-fetches the same clinic twice.
  useEffect(() => {
    const start = (page - 1) * clinicsPerPage;
    const visibleClinics = cardArray.slice(start, start + clinicsPerPage);
    const clinicsToEnrich = visibleClinics.filter((clinic) => !clinic.enriched);

    if (clinicsToEnrich.length === 0) return;

    let cancelled = false;
    setIsLoading(true);

    enrichClinics(clinicsToEnrich, userPosition)
      .then((enrichedResults) => {
        if (cancelled) return;
        const enrichedByPlaceId = new Map(
          enrichedResults.map((result) => [result.placeId, result])
        );
        setCardArray((prevCardArray) =>
          prevCardArray.map((clinic) =>
            enrichedByPlaceId.has(clinic.placeId)
              ? { ...clinic, ...enrichedByPlaceId.get(clinic.placeId) }
              : clinic
          )
        );
      })
      .catch((error) => {
        console.error("Error enriching clinic details:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cardArray, page, userPosition]);

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
                handleChangeCountry(value);
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
                handleChangeCities(value);
                handleAutocompleteChange(value, "city");
              }}
              options={cities}
              renderInput={(params) => (
                <TextField {...params} label={t("City")} />
              )}
              clearIcon={<></>}
            />
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
                            carRouteAvailable={clinic.carRouteAvailable}
                            footRouteAvailable={clinic.footRouteAvailable}
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
