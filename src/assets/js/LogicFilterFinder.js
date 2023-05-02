import { useState } from 'react';

export function logicFilterFinder(array, filter) {

  let parametroBusqueda = '';
  const filters = ['low price', 'high price', 'closest to me', 'soon', 'translator from English', 'JCI international accreditation'];

  function sortingFn(a, b) {
   // console.log('parametroBusqueda!!!', parametroBusqueda)
    switch (parametroBusqueda) {
      case 'low price':
     //   console.log('low price en sortingFn')
        return a.price - b.price;
      case 'high price':
       // console.log('high price en sortingFn')
        return b.price - a.price;
      case 'closest to me':
        //console.log('closest to me en sortingFn')
        return a.distance - b.distance;
      case 'soon':
        //console.log('soon')
        return a.date - b.date;
      default:
        break;
    }
  }

  const lowPrice = (data) => {
    parametroBusqueda = 'low price';
    const lowP = data.sort(sortingFn);
    return lowP;
  }

  const hightPrice = (data) => {
    parametroBusqueda = 'high price';
    const higthP = data.sort(sortingFn);
    return higthP;
  }

  const closest = (data) => {
    parametroBusqueda = 'closest to me';
    let mapedData = data.sort(sortingFn);
    return mapedData;
  }

  const soon = (data) => {
    parametroBusqueda = 'soon';
    const soonDate = data.sort(sortingFn);
    return soonDate;
  }

  const translatorEngtoLang = (data) => {
   // parametroBusqueda = 'translator from English';
    const translator = data.filter(clinic =>  clinic.englishTranslator == true);
    console.log('translator: ', translator);
    return translator;
  }

  const jciAcreditation = (data) => {
    const jciA = data.filter(clinic => clinic.JCI == true);
    console.log('jciA: ', jciA);
    return jciA;
  }

  const ejecutarFiltros = (test, filtro = 'low price') => {
    switch (filtro) {
      case 'low price':
        lowPrice(test);
        break;
      case 'high price':
        hightPrice(test);
        break;
      case 'closest to me':
        closest(test);
        break;
      case 'soon':
        soon(test);
        break;
      case 'translator from English':
        translatorEngtoLang(test);
        break;
      case 'JCI international accreditation':
        jciAcreditation(test);
        break;
      default:
        return null;
    }
  }

  return ejecutarFiltros(array, filter);
}
