import React, { useEffect, useState } from 'react'
import { navigate } from '@reach/router'

function Home() {
  const [adAccounts, setAdAccounts] = useState([])
  const [user, setUser] = useState({})

  useEffect(() => {
    window.checkLoginState = function () {
      window.FB
        ? window.FB.getLoginStatus((res) => {
            console.log(res)

            if (res.status === 'connected') {
              // Logged into your webpage and Facebook.
              setUser((state) => ({
                ...state,
                isLogin: true,
              }))

              console.log('fetchUserAndAdAccounts')
              fetchUserAndAdAccounts()
            } else {
              // Not logged into your webpage or we are unable to tell.
              console.log('Please log into this webpage.')
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
        version: 'v6.0',
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
    <div className='container my-3'>
      {/* Avatar、登出 */}
      {user.pictureURL ? (
        <div className='text-right my-3'>
          <div
            className='btn btn-primary'
            onClick={() =>
              window.FB.logout(function (response) {
                setUser({})
                setAdAccounts([])
              })
            }
          >
            <div className=' d-flex align-items-center'>
              <img
                src={user.pictureURL}
                alt='avatar'
                className='rounded-circle'
                style={{ width: '30px' }}
              />
              <span className='mx-2'>登出</span>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
      <h1 className='text-center my-3'>廣告帳號</h1>
      {/* 臉書登入 */}
      <div className='w-100 text-center my-3'>
        <div
          className='fb-login-button'
          data-size='large'
          data-button-type='continue_with'
          data-layout='default'
          data-auto-logout-link='false'
          data-use-continue-as='true'
          data-width=''
          data-onlogin='checkLoginState();'
          data-scope='public_profile,email,ads_read,business_management'
          style={{ display: user.isLogin ? 'none' : 'block' }}
        ></div>
      </div>

      {/* 廣告帳戶列表 */}
      <main className='col-12 col-md-6 m-auto'>
        {adAccounts.length > 0 ? (
          <div className='list-group'>
            {adAccounts.map(({ name, id }) => (
              <button
                key={id}
                type='button'
                className='list-group-item list-group-item-action'
                onClick={() =>
                  navigate(`/facebook-ad-account-dashboard/ad-account/${id}`)
                }
              >
                {name}
              </button>
            ))}
          </div>
        ) : (
          ''
        )}
      </main>
    </div>
  )

  function fetchUserAndAdAccounts() {
    window.FB.api(
      '/me?fields=name,picture{url},adaccounts{name,account_id,age}',
      function (res) {
        setUser((state) => ({
          ...state,
          name: res.name,
          pictureURL: res.picture.data.url,
        }))
        setAdAccounts(res.adaccounts.data)
      }
    )
  }
}

export default Home
