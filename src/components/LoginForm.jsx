import React from 'react'
import Header from "./Header"
import { Link } from 'react-router-dom'
import Back from '../assets/images/svg/Back.svg'
import { reusable_classes } from '../assets/css/reusable-styles'

export default function LoginForm() {
  return (
    <div>
      <Header />
      <div className="center" style={reusable_classes.center}>

        <form className="enter-form" name="enter-app" style={reusable_classes.form_base}>
          <div className="inline-link" style={reusable_classes.inline_line}>
            <Link to='../RegisterForm' style={{ textDecoration: 'none', }}>
              <img className="link-enter-page back" src={Back} alt="link-enter-page" /></Link>
          </div>
          <div className="center" style={reusable_classes.center}>
            <div className="form" style={reusable_classes.form_content}>
              <h1 className="leyend" style={reusable_classes.legent}>Вход</h1>
              <label name="email" className="label" style={reusable_classes.label}>Email</label>
              <input type="email" name="email" className="input" placeholder="Введите ваш электронный адрес" style={reusable_classes.input} />
              <label name="Пароль" className="label" style={reusable_classes.label}>Пароль</label>
              <input type="password" name="Пароль" className="input input2" placeholder="Введите пароль для входа" style={reusable_classes.input} />
              <button name="Кнопка_push" className="button" style={reusable_classes.button}>Вход</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
