import React from 'react'
import { Link } from 'react-router-dom'
import Header from "./Header"
import Back from '../assets/images/svg/Back.svg'
// import '../assets/css/reuseble-styles'
import { reusable_classes } from '../assets/css/reusable-styles'

export default function RegisterForm() {
      
  return (
      <div>
           <Header/>
        
          <div className="center" style={reusable_classes.center}>
           <form className="" name="enter-app" style={reusable_classes.form_base}>
      
                    <div className="inline-link" style={reusable_classes.inline_line}>
                       <Link to='../' style={{ textDecoration: 'none', }}>
                          <img src={ Back } alt="home-page"/></Link>
                          <p className="link-enter-page" style={reusable_classes.link_enter_page}>Уже зарегистрированы? 
                       <Link to='../LoginForm' style={{ textDecoration: 'none', }}>
                       <span className="link" style={{paddingLeft: '5px'}}>Вход.</span></Link></p>
                    </div>

           <div className="center" style={reusable_classes.center}>
            <div className="form" style={reusable_classes.form_content}>  
              <h1 className="leyend" style={reusable_classes.legent}>Зарегистрироваться</h1>

              <label name="email" className="label" style={reusable_classes.label}>Email</label>
              <input type="email" name="email" className="input" placeholder="Введите ваш электронный адрес" style={reusable_classes.input}/>

              <label name="Пароль" className="label" style={reusable_classes.label}>Пароль</label>
              <input type="password" name="Пароль" className="input input2" placeholder="Введите пароль для входа" style={reusable_classes.input}/>

              {/* <Link to='./Onboarding' style={{ textDecoration: 'none', }}> */}
              <button name="Кнопка_push" className="button" type="submit" style={reusable_classes.button}>Зарегистрироваться</button>
              {/* </Link> */}
            </div>
          </div>  

          </form>
        </div>    
    </div>


  )
}
