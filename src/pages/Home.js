import React, { useEffect, useState } from 'react'
import { navigate } from '@reach/router'
import { format } from '../utils/utils'

import './Home.css'

import Switch from '../components/Switch'

function Home() {
  const [adAccounts, setAdAccounts] = useState([])
  const [user, setUser] = useState({})
  const [isFilter, setIsFilter] = useState(true)

  let filteredAdAccounts = isFilter
    ? adAccounts.filter((adAccount) => adAccount.adAccountLive)
    : adAccounts
  filteredAdAccounts = filteredAdAccounts.sort(
    (a, b) => b.campaignStatus.value - a.campaignStatus.value
  )
  useEffect(() => {
    const params = new URL(document.location).searchParams
    const path = params.get('p')
    if (path) {
      navigate(`/facebook-ad-account-dashboard${path}`)
    }
  }, [])

  useEffect(() => {
    window.checkLoginState = function () {
      window.FB
        ? window.FB.getLoginStatus((res) => {
            if (res.status === 'connected') {
              // Logged into your webpage and Facebook.
              setUser((state) => ({
                ...state,
                isLogin: true,
              }))
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
      {filteredAdAccounts.length > 0 ? (
        <>
          <div className='d-flex align-items-center justify-content-center my-2'>
            <Switch
              labelFor={'isFilter'}
              isOn={isFilter}
              handleToggle={() => setIsFilter(!isFilter)}
              onColor='#e43f5a'
            />
            <span>只顯示 Active 廣告帳戶</span>
          </div>
          <main className='d-flex flex-wrap justify-content-center'>
            {filteredAdAccounts.map(
              ({ name, id, adAccountLive, campaignStatus, amount_spent }) => (
                <div
                  key={id}
                  className='card m-1 ad-account-card'
                  style={{ width: '18rem', opacity: !adAccountLive && 0.3 }}
                >
                  <div
                    className='card-body'
                    onClick={() =>
                      navigate(
                        `/facebook-ad-account-dashboard/ad-account/${id}`
                      )
                    }
                  >
                    <span
                      className={
                        'badge badge-' +
                        (campaignStatus.value === 3
                          ? 'success'
                          : campaignStatus.value === 2
                          ? 'primary'
                          : campaignStatus.value === 1
                          ? 'secondary'
                          : '')
                      }
                    >
                      {campaignStatus.name}
                    </span>

                    <h5 className='card-title'>{name}</h5>
                    <p className='card-text'>
                      總廣告花費：{format(amount_spent).toDollar()}
                    </p>
                  </div>
                </div>
              )
            )}
          </main>
        </>
      ) : (
        <div className='text-center my-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='sr-only'>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )

  function fetchUserAndAdAccounts() {
    window.FB.api(
      '/me?fields=name,picture{url},adaccounts.limit(1000){age,name,amount_spent,campaigns.limit(1000){status,name}}',
      function (res) {
        setUser((state) => ({
          ...state,
          name: res.name,
          pictureURL: res.picture.data.url,
        }))

        let sortedAdAccountsData = res.adaccounts.data.sort(
          (a, b) => a.age - b.age
        )

        // 遍歷廣告活動狀態，在廣告帳戶物件加上 adAccountLive flag
        sortedAdAccountsData = sortedAdAccountsData.map((adAccount) => {
          adAccount.adAccountLive = false
          adAccount.campaignStatus = { name: '', value: 0 }

          if (adAccount.campaigns) {
            adAccount.campaigns.data.forEach((adCampaign) => {
              if (adCampaign.status === 'ACTIVE') {
                adAccount.adAccountLive = true
              }
              adAccount.campaignStatus = handleAdCampaignStatus(
                adAccount.campaignStatus,
                adCampaign.name
              )
            })
          }

          return adAccount
        })
        setAdAccounts((state) => [...sortedAdAccountsData])
      }
    )
  }

  function handleAdCampaignStatus(originalStatus, adCampaignName) {
    // 狀態變成數字來比大小
    // 較大的為現在的狀態
    const newStatus = getAdCampaignStatus(adCampaignName)
    return newStatus.value > originalStatus.value ? newStatus : originalStatus
  }

  function getAdCampaignStatus(adCampaignName) {
    return adCampaignName.includes('上線')
      ? { name: '上線', value: 3 }
      : adCampaignName.includes('預熱')
      ? { name: '預熱', value: 2 }
      : adCampaignName.includes('前測')
      ? { name: '前測', value: 1 }
      : { name: '', value: 0 }
  }
}

export default Home
