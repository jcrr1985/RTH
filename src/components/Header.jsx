import RuntoHealth from '../assets/images/svg/RunToHealth.svg'
import { Link } from 'react-router-dom'
import '../App.css'


export default function Header() {

  return (
    <header>
      <div className='header'>
        <div className="RHT-wrapper" style={{
          display: 'flex',
          flexFlow: 'column wrap',
          justifyContent: 'space-between',
          marginTop: '3.698630137vh',
          gap: '2vh'
        }}>
          <div className="app-icon">
            <img src={RuntoHealth} alt="baloon" style={{
              width: '33.919413919vw',
              height: '8.937728938vw',
            }} />
          </div>

          <div className="rth-info">
            <p className="header-info header-info" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              RunToHealth is a platform for finding medical services around the world quickly and easily. <br />
              We believe that with our help you will be able to find the best solution to your problem.
              <Link to='../AboutUs' style={{ textDecoration: 'none', }} className="header-info-link link">
                <span>More about us...</span>
              </Link>
              <button className="button_blue">
                <Link to='../RequestForm' style={{ textDecoration: 'none', color: '#000' }}>SEARCH</Link>
              </button>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
