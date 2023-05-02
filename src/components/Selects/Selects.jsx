import { useForm } from "react-hook-form";
import { useReducer, useEffect, useState } from "react";
import data from "../models/cities_coords.json";
import specialities from "./RequestForm/specialities.js";

import "./RequestForm/RequestForm.css";
//import Tooltip from '@mui/material/Tooltip';
//import dayjs, { Dayjs } from 'dayjs'
//import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
//import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
//import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import searchIcon from '../assets/images/svg/search.svg'
import './Selects/Selects.css'


export default function Test() {
  const [paisSelect, setPaisSelect] = useState(null);
  const [ciudadSelect, setCiudadSelect] = useState(null);

  const [speState, setSpeState] = useState(true);

  const [pais, setPais] = useState("Seleccione un País");
  const [ciudad, setCiudad] = useState("");

  //const [date, setDate] = useState(dayjs('2014-08-18T21:11:54')); // change to today

  //const [showTooltip ,setShowTooltip] = useState("You must select any specialization first")


    useEffect(() => {
          setPaisSelect(document.getElementById("pais"));
          setCiudadSelect(document.getElementById("ciudad"));
              if (!speState) chargePaises();
     }, [speState]);

  const chargePaises = () => {
    if (paisSelect) {
        paisSelect.innerHTML = "";
        paisSelect.options[0] = new Option("Selecciona un País", "");
          data.paises.forEach((p) => {
               paisSelect.options[paisSelect.options.length] = new Option(
               p.name.toLowerCase(), p.name.toLowerCase());
           });
    }
  };

  const paisOnChangeHandler = (ev) => {
    setPais(ev.target.value);
    const paisL = data.paises.find((p) => p.name.toLowerCase() === ev.target.value.toLowerCase());
        paisSelect.value = ev.target.value.toLowerCase();
        ciudadSelect.innerHTML = "";
        ciudadSelect.options[0] = new Option("Selecciona una ciudad", "");
        Object.keys(paisL.cities).forEach((clave) => {
          const ciudad = paisL.cities[clave];
          ciudadSelect.options[ciudadSelect.options.length] = new Option(
            clave.toLowerCase(), clave.toLowerCase());
        });
  };

  const ciudadOnChangeHandler = (ev) => {
    setCiudad(ev.target.value);
  };

  const specialityOnChangeHandler = (ev) => {
    if (ev.target.value != "" || ev.target.value != "Selecciona una especialidad")
      setSpeState(false);
      setShowTooltip('');
  };

 //setting date picker value onChange event
  //const handleChange = (newValue) => {
    //setDate(newValue);
  //};
  
  return (
   <div className = "selects-wrapper"> 
    <div className = "container1">
      <div className = "selects flex-row specialits-wrapper">
        <label htmlFor = "specialities"></label>
        <select className = "select-borde-box selects specialits"
          id = "specialities"
          onChange = {(ev) => specialityOnChangeHandler(ev)}
        >
          <option value = "">Selecciona una especialidad</option>
          {specialities.map((s, index) => (
            <option key = {index} value={s.toLowerCase()}>
              {s.toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className = "calendar">
            
      </div>
          <div>
             <img src={searchIcon} width={39} height={41} alt="Magnifying glass icon"
                          onClick={ 
                            console.log('data', data)
                        } />
          </div>              
    </div>
    <div className = "container2">  
      <div className = "pais-wrapper selects flex-row">
        <label htmlFor = "pais"></label>
        <select className = "select-borde-box selects pais"
          id="pais"
          disabled = {speState}
          onChange = {(ev) => paisOnChangeHandler(ev)}
        >
          <option value="">{pais}</option>
        </select>
      </div>
      <div className = "ciudad selects flex-row">
        <label htmlFor ="ciudad"></label>
        <select className = "select-borde-box selects"
          id="ciudad"
          disabled = {speState}
          onChange = {(ev) => ciudadOnChangeHandler(ev)}
         > 
      <option value = "">Selecciona una ciudad</option>
    </select>
  </div>
</div>
<div className = "container3">

</div>
</div>
    );
  }