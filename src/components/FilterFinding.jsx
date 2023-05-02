// import * as React from 'react';
// import { Modal } from '@mui/material'
// import Button from '@mui/material/Button';
import React, { useState, useEffect, useContext } from 'react'
import Settings from '../assets/images/svg/SettingsSlider.svg'
import FilterBox from './FilterBox'
import { FinderFilterContext } from '../helpers/FinderFilterContext.js'
// import { FinderFilterContext } from './RequestForm'

export default function FilterFinding() {
  const { open, setOpen } = useContext(FinderFilterContext)

  {
    // const findingFilterWrapper = document.querySelector('.finding-filter-wrapper');
    // const findingFilterWrapperParent = findingFilterWrapper.parentElement;
  }
  return (

    <div className="filter-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      margin: '0 auto'

    }}>
      <button style={{backgroundColor: 'transparent', border: 'none'}} onChange={() => console.log('button click', open)} onClick={(event) => {
        console.log(open)
        setOpen(true)
        event.stopPropagation()
      }}>
        <img src={Settings} alt="Settings" className="settings-image"
        /></button>
      {open && <FilterBox />}
    </div>

  )
}
