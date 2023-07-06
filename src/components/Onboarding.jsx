import Header from './Header'
import amworld from './amworld';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCountry } from '../redux/actions';


export const Onboarding = ({ setCountryInAmworld, countryInAmworld }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      amworld(setCountryInAmworld)
    }, 1)
  }, []);

  useEffect(() => {
    console.log('countryInAmworld in onboarding', countryInAmworld)
    dispatch(setCountry(countryInAmworld));

  }, [countryInAmworld])

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div> <Header /> </div>
      <div className="" id='chartdiv' style={{ width: '50vw', height: '100vh' }}></div>
    </div>
  );
}
