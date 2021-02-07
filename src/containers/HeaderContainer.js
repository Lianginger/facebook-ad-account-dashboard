import React, { useEffect, useState } from 'react'
import { navigate } from '@reach/router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { SvgLogo, SvgArrowLeft } from '../svgs'

import './HeaderContainer.scss'

import {
  fetchUserAndAdAccountsAsync,
  setUser,
} from '../features/user/userSlice'
import { setAdAccounts } from '../features/adAccounts/adAccountsSlice'

const HeaderContainer = ({
  title,
  setAdAccounts,
  user,
  setUser,
  isHome,
  fetchUserAndAdAccountsAsync,
}) => {
  useEffect(() => {
    setUser({ isLoading: true })
    window.checkLoginState = function () {
      window.FB
        ? window.FB.getLoginStatus((res) => {
            setUser({ isLoading: true })
            if (res.status === 'connected') {
              // Logged into your webpage and Facebook.
              // fetchUserAndAdAccounts()
              fetchUserAndAdAccountsAsync()
            } else {
              // Not logged into your webpage or we are unable to tell.
              console.log('Please log into this webpage.')
              setUser({ isLoading: false })
            }
          })
        : console.log('FB not loaded.')
    }
    window.checkLoginState()

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: '2772453809519165',
        cookie: true,
        xfbml: true,
        version: 'v9.0',
      })

      window.FB.AppEvents.logPageView()
      window.checkLoginState()
    }
    ;(function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      js = d.createElement(s)
      js.id = id
      js.src =
        'https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v7.0&appId=2772453809519165&autoLogAppEvents=1'
      fjs.parentNode.insertBefore(js, fjs)
    })(document, 'script', 'facebook-jssdk')
  }, [])

  return (
    <header className='header'>
      <div className='header__line-left'>
        {!isHome && (
          <div className='header__back-to-home' onClick={() => navigate('/')}>
            <SvgArrowLeft className='header__arrow-left' />
            <span className='header__back-to-home-text'>Home</span>
          </div>
        )}
        <div className='header__title'>{title}</div>
      </div>
      <SvgLogo className='header__logo' />
      <div className='header__line-right'></div>
      <div className='header__account'>
        {user.isLoading && (
          <div
            className='spinner-border text-primary spinner-border-sm mx-3'
            role='status'
          >
            <span className='sr-only'>Loading...</span>
          </div>
        )}
        {user.isNoAuth && !user.isLoading ? (
          <span className='text-danger'>你沒有權限</span>
        ) : (
          ''
        )}
        {/* Avatar、登出 */}
        {user.isLogin && !user.isLoading ? (
          <div className='text-right'>
            <div
              className='bg-primary rounded'
              onClick={() => {
                setUser(false)
                setAdAccounts(false)
              }}
            >
              <div className='d-flex align-items-center'>
                <span className='mx-2 text-light font-weight-bold'>登出</span>
                <img
                  src={user.pictureURL}
                  alt='avatar'
                  className='rounded'
                  style={{ width: '28px' }}
                />
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        {/* 臉書登入 */}
        <div className='w-100 text-center'>
          <div
            className='fb-login-button'
            data-size='medium'
            data-button-type='continue_with'
            data-layout='default'
            data-auto-logout-link='false'
            data-use-continue-as='true'
            data-width=''
            data-onlogin='checkLoginState();'
            data-scope='public_profile,email,ads_read'
            style={{
              display:
                user.isLogin || user.isLoading || user.isNoAuth
                  ? 'none'
                  : 'block',
            }}
          ></div>
        </div>
      </div>
    </header>
  )
}

const mapStateToProps = ({ user }) => ({
  user,
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchUserAndAdAccountsAsync,
      setUser,
      setAdAccounts,
    },
    dispatch
  )

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContainer)
