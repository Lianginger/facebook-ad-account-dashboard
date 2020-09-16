import React, { useEffect, useState } from 'react'
import { navigate } from '@reach/router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { format } from '../utils/utils'

import './Home.scss'

import Switch from '../components/Switch'
import { HeaderContainer } from '../containers'

function Home({ adAccounts }) {
  const [isFilter, setIsFilter] = useState(true)

  let filteredAdAccounts = isFilter
    ? [...adAccounts.data].filter((adAccount) => adAccount.adAccountLive)
    : [...adAccounts.data]
  filteredAdAccounts = filteredAdAccounts.sort(
    (a, b) => b.campaignStatus.value - a.campaignStatus.value
  )
  useEffect(() => {
    const params = new URL(document.location).searchParams
    const path = params.get('p')
    if (path) {
      navigate(`${path}`)
    }
  }, [])

  return (
    <div className='container position-relative my-3'>
      <HeaderContainer title={'廣告帳戶'} isHome={true} />
      <div className='ad-accounts__switch'>
        <Switch
          labelFor={'isFilter'}
          isOn={isFilter}
          handleToggle={() => setIsFilter(!isFilter)}
          onColor='#e43f5a'
          title='只顯示活躍廣告帳戶'
        />
      </div>

      {/* 廣告帳戶列表 */}
      {!adAccounts.isLoading ? (
        <>
          <main className='d-flex flex-wrap justify-content-center'>
            {filteredAdAccounts.map(
              ({ name, id, adAccountLive, campaignStatus, amount_spent }) => (
                <div
                  key={id}
                  className='card m-2 ad-account-card'
                  style={{ width: '18rem', opacity: !adAccountLive && 0.3 }}
                >
                  <div
                    className='card-body'
                    onClick={() => navigate(`/ad-account/${id}`)}
                  >
                    <span
                      className={
                        'float-right badge badge-' +
                        (campaignStatus.value === 3
                          ? 'launch'
                          : campaignStatus.value === 2
                          ? 'pre-launch'
                          : campaignStatus.value === 1
                          ? 'lead'
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
}

const mapStateToProps = ({ adAccounts }) => ({
  adAccounts,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Home)
