import React, { useState, useEffect } from 'react'
import RuntoHealth from '../assets/images/svg/RunToHealth.svg'
import { Link } from 'react-router-dom'
import clinics from '../assets/images/svg/clinics.svg'
import icon from '../assets/images/svg/icon.svg'
import { reusable_classes } from '../assets/css/reusable-styles'





export default function Header(props) {

  const [info, setInfo] = useState(false)

  useEffect(()=>  setInfo((props.info)? true : false),[])

  return (

    <header style={{  width: '50vw', height: '100vh' }}>
      <div className='header' style={{
            display: 'flex',
            flexFlow: 'column',
			width: '50vw'
      }}>
         <div className="RHT-wrapper" style={{
          display: 'flex',
          flexFlow: 'column wrap',
          justifyContent: 'space-between',
          marginTop: '3.698630137vh',
          gap: '2vh'
         }}>
           <div className="app-icon">
               <img  src={RuntoHealth} alt="baloom" style={{
                width: '33.919413919vw',
                height: '8.937728938vw',
               }}/>
            </div>

           {info &&  <div className="RTH-info" style={{
              display: 'flex',
              flexFlow: 'column wrap',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              marginLeft: '4vw',
              gap: '1vh'
           }}>
             <p className="header-info header-info">
             RunToHealth is a platform for finding medical services around the world quickly and easily. <br/>
             We believe that with our help you will be able to find the best solution to your problem.
             </p>
             <Link to='../AboutUs' style={{ textDecoration: 'none',
            }} className="header-info-link link"><span style={{
              marginLeft: '1.2vw'
            }}>More about as...</span></Link>
             </div>}
        </div>
        <div className='icons' style = {{ marginTop: '0.2vh' }}>
		<button className="button_blue"><Link to='../RequestForm' style={{ textDecoration: 'none', color: '#000' }}>SEARCH</Link></button>
           
           {/*} <Link to='' style={{ textDecoration: 'none', }} className="header-info-link link">
                <img src={clinics} alt="clinics" style={{
                      width: '4.395604396vw',
                      height: '8.108108108vh'
                }}/>
            </Link>
            <Link to='' style={{ textDecoration: 'none', }} className="header-info-link link">
                <img src={icon} alt="icon" style={{
                      width: '4.395604396vw',
                      height: '8.108108108vh'
                }}/>
              </Link> */}
            </div>
      </div>
    </header>
  )
}
