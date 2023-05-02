import React, { useContext } from 'react'
import Settings from '../assets/images/svg/SettingsSlider.svg'
import FilterBox from './FilterBox'
import { FinderFilterContext } from '../helpers/FinderFilterContext.js'

export default function FilterFinding() {
  const { open, setOpen } = useContext(FinderFilterContext)

  return (
    <div className="filter-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
      <button style={{ backgroundColor: 'transparent', border: 'none' }} onClick={() => {
        setOpen(true)
      }}>
        <img src={Settings} alt="Settings" className="settings-image"
        /></button>
      {open && <FilterBox />}
    </div>

  )
}
