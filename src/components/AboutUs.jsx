import React from 'react'
import { infoHeader } from '../assets/css/reusable-styles'
import { Link } from 'react-router-dom'
import arrow from '../assets/images/svg/Arrow.svg'

export default function AboutUs() {
  return (
    <div>
        <Link to='../' style={infoHeader.arrow} className="header-info-link link">
            <img src={arrow} alt="Go_Back"/>
        </Link>
     <div className='wrapper' style={infoHeader.wrapper}>  
      <div className='info_header_wrapper' style={infoHeader.info_header_wrapper}>
            <h1 className='h1' style={infoHeader.h1}>
            Кто мы и в чем наши преимущества?
            </h1>
            <h2 className='h2' style={infoHeader.h2}>
            RunToHealth - платформа для быстрого и простого поиска клиники с нужными параметрами по всему миру.
            </h2>
            <h2 className='h2' style={infoHeader.h2}>
            Наша миссия - сделать медицинский туризм простым и удобным. Мы верим, что с помощью нашей платформы вы сможете найти быстрое решение своей проблемы.
            </h2>
        </div>
        <div className='info_main_wrapper' style={infoHeader.info_main_wrapper}>
       <div className='main_row' style={infoHeader.main_row}>     
        <div className='main_content' style={infoHeader.main_content}>
          <p className='title' style={infoHeader.title}>Преимущество ✓</p>
           <h3 className='content' style={infoHeader.content}>     
            Возможные варианты клиник для вас подбирается, учитывая индивидуальные запросы, специфику заболеваний и времени, когда бы вы хотели прийти.
           </h3>
        </div>
        <div className='main_content' style={infoHeader.main_content}>
          <p className='title' style={infoHeader.title}>Преимущество ✓</p>
           <h3 className='content' style={infoHeader.content}>     
            большой выбор клиник, собранный в одном месте.
           </h3> 
        </div>
        <div className='main_content' style={infoHeader.main_content}>
          <p className='title' style={infoHeader.title}>Преимущество ✓</p>
           <h3 className='content' style={infoHeader.content}>     
            Предложения клиник ранжируются по стоимости лечения и возможности быстро оказать помощь.
            </h3>
        </div>
      </div>
      <div className='main_row' style={infoHeader.main_row}>  
        <div className='main_content' style={infoHeader.main_content}>
         <p className='title' style={infoHeader.title}>Преимущество ✓</p>
           <h3 className='content' style={infoHeader.content}>     
            Бронирование онлайн без комиссии. Мы не взимаем комиссию за оформление бронирования или другие услуги.
            </h3>
        </div>
        <div className='main_content' style={infoHeader.main_content}>
         <p className='title' style={infoHeader.title}>Преимущество ✓</p>
           <h3 className='content' style={infoHeader.content}>     
            Легкая и интуитивно понятная платформа для взаимодействия с клиникой.
            </h3>
        </div>
      </div>
     </div>
    </div>
  </div>
  )
}
