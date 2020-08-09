import React from 'react'
import { navigate } from '@reach/router'
import { SvgLogo, SvgArrowLeft } from '../svgs'

import './Header.scss'

const Header = () => {
  return (
    <header className='header'>
      <div className='header__line-left'>
        <div
          className='header__back-to-home'
          onClick={() => navigate('/facebook-ad-account-dashboard/')}
        >
          <SvgArrowLeft className='header__arrow-left' />
          <span className='header__back-to-home-text'>Home</span>
        </div>
      </div>
      <SvgLogo className='header__logo' />
      <div className='header__line-right'></div>
    </header>
  )
}

export default Header
