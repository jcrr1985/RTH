import React from 'react'
import globe1 from './globe.svg'
import globe2 from './globe2.svg'
import './globe.scss'

function Globe3D(){

  return(
    <div className='globe-wrappe'>
          <div className='front-side globe1'>
              <img className='img1' src={globe1} alt='globe-front-side'/>
          </div>
          <div className='back-side globe2'>
              <img className='img2 back-side' src={globe2} alt='globe-back-side'/>
          </div>
    </div>
  )
}

export default Globe3D
