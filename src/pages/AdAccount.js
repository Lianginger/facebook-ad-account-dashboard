import React, { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import { Line } from 'react-chartjs-2'
import { navigate } from '@reach/router'

function AdAccount({ adAccountId }) {
  const [loading, setLoading] = useState(true)
  const [adAccount, setAdAccount] = useImmer({
    data: [],
    dateArray: [],
    leadSpendArray: [],
    leadArray: [],
    preLaunchSpendArray: [],
    roasSpendArray: [],
    roasArray: [],
  })
  const [paging, setPaging] = useState({})
  const chartConfigOptions = {
    maintainAspectRatio: false,
    hover: {
      intersect: false,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
  }

  function generateChartData() {
    let dateArray = Object.keys(adAccount.data)
    let leadSpendArray = []
    let leadArray = []
    let preLaunchSpendArray = []
    let roasSpendArray = []
    let roasArray = []

    Object.values(adAccount.data).map((dateData) => {
      if( dateData['預熱']) {
        const adCampaignArray = dateData['預熱']
        let totalSpend = 0

        adCampaignArray.map((adCampaign) => {
          if (parseInt(adCampaign.spend) === 0 ) {
            return
          }
    
          const adCampaignSpend = parseInt(adCampaign.spend)

          totalSpend += adCampaignSpend
        })
        if(totalSpend !== 0 ) {
          preLaunchSpendArray.push(totalSpend)
        } else {
          preLaunchSpendArray.push(null)
        }
      } else {
        preLaunchSpendArray.push(null)
      }

      if (dateData['前測']) {
        const adCampaignArray = dateData['前測']
        let totalSpend = 0
        let totalLead = 0

        adCampaignArray.map((adCampaign) => {
          if (parseInt(adCampaign.spend) === 0 || !adCampaign.actions) {
            return
          }
    
          const adCampaignSpend = parseInt(adCampaign.spend)
          const adCampaignLeadAction = adCampaign.actions.find(
            (action) =>
              action.action_type === 'offsite_conversion.fb_pixel_custom'
          )

          totalSpend += adCampaignSpend
          totalLead += adCampaignLeadAction ? parseInt(adCampaignLeadAction.value) : 0
        })
        if(totalSpend !== 0 && totalLead !== 0) {
          leadSpendArray.push(totalSpend)
          leadArray.push((totalSpend/totalLead).toFixed(2))
        } else {
          leadSpendArray.push(null)
          leadArray.push(null)
        }
      } else {
        leadSpendArray.push(null)
        leadArray.push(null)
      }

      if (dateData['嘖嘖']) {
        const adCampaignArray = dateData['嘖嘖']
        let totalSpend = 0
        let totalRevenue = 0

        adCampaignArray.map((adCampaign) => {
          if (parseInt(adCampaign.spend) === 0 || !adCampaign.action_values) {
            return
          }

          const adCampaignSpend = parseInt(adCampaign.spend)
          const adCampaignOmniPurchaseAction = adCampaign.action_values.find(
            (action) => action.action_type === 'omni_purchase'
          )
          totalSpend += adCampaignSpend
          totalRevenue += adCampaignOmniPurchaseAction
            ? parseInt(adCampaignOmniPurchaseAction.value)
            : 0
        })

        if (totalSpend !== 0 && totalRevenue !== 0) {
          roasSpendArray.push(totalSpend)
          roasArray.push((totalRevenue / totalSpend).toFixed(2))
        } else {
          roasSpendArray.push(null)
          roasArray.push(null)
        }
      } else {
        roasSpendArray.push(null)
        roasArray.push(null)
      }
    })

    setAdAccount(state => {
      state.dateArray = dateArray
      state.leadSpendArray = leadSpendArray
      state.leadArray = leadArray
      state.preLaunchSpendArray = preLaunchSpendArray
      state.roasSpendArray = roasSpendArray
      state.roasArray = roasArray
    })
  }


  const purchaseLineChartData = {
    labels: [...adAccount.dateArray].reverse(),
    datasets: [
      {
        label: 'ROAS',
        fill: false,
        borderColor: 'red',
        pointBackgroundColor: 'red',
        pointHoverBackgroundColor: 'red',
        data: [...adAccount.roasArray].reverse(),
      },
    ],
  }
  const leadLineChartData = {
    labels: [...adAccount.dateArray].reverse(),
    datasets: [
      {
        label: 'CPL',
        fill: false,
        borderColor: '#666',
        pointBackgroundColor: '#666',
        pointHoverBackgroundColor: '#666',
        data: [...adAccount.leadArray].reverse()
      },
    ],
  }

  useEffect(() => {
    fetchData()
  }, [adAccountId])

  useEffect(() => {
    generateChartData()
  }, [adAccount.data])

  return (
    <div className='container my-3'>
      {loading ? (
        <div className='text-center my-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='sr-only'>Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div
            className='btn btn-primary'
            onClick={() => navigate('/facebook-ad-account-dashboard/')}
          >
            Home
          </div>
          <h1 className='text-center my-3'>{adAccount.name}</h1>

          {/* 圖表 */}
          <div className='my-2' style={{ height: '200px' }}>
            <Line data={purchaseLineChartData} options={chartConfigOptions} />
          </div>
          <div className='my-2' style={{ height: '200px' }}>
            <Line data={leadLineChartData} options={chartConfigOptions} />
          </div>

          {/* 走速表 */}
          <table className='table'>
            <thead>
              <tr>
                <th scope='col'>Date</th>
                <th scope='col'>前測花費</th>
                <th scope='col'>CPL</th>
                <th scope='col'>預熱花費</th>
                <th scope='col'>上線花費</th>
                <th scope='col'>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {adAccount.dateArray.map(
                (
                  date,
                  index
                ) => {
                 

                  return (
                    <tr key={`daily-adAccount-data-${index}`}>
                      <th>{date}</th>
                      <td>{adAccount.leadSpendArray[index]}</td>
                      <td>{adAccount.leadArray[index]}</td>
                      <td>{adAccount.preLaunchSpendArray[index]}</td>
                      <td>{adAccount.roasSpendArray[index]}</td>
                      <td>{adAccount.roasArray[index]}</td>
                    </tr>
                  )
                }
              )}
            </tbody>
          </table>
          {/* Paging */}
          {/* <div className='row'>
            <div className='col-6 text-left'>
              {paging.hasPrevious ? (
                <div
                  className='btn btn-primary'
                  onClick={() => fetchData('before', paging.cursors.before)}
                >
                  Previous
                </div>
              ) : (
                ''
              )}
            </div>
            <div className='col-6 text-right'>
              {paging.hasNext ? (
                <div
                  className='btn btn-primary'
                  onClick={() => fetchData('after', paging.cursors.after)}
                >
                  Next
                </div>
              ) : (
                ''
              )}
            </div>
          </div> */}
        </>
      )}
    </div>
  )

  function fetchData(cursorKey = '', cursorValue = '') {
    setLoading(true)
    fetch(
      // `http://localhost:8000/ad-account/${adAccountId}?${cursorKey}=${cursorValue}`
      `https://fb-ads-api.herokuapp.com/ad-account/${adAccountId}?${cursorKey}=${cursorValue}`
    )
      .then((res) => res.json())
      .then((res) => {
        // console.log(res)
        setAdAccount((state) => {
          state.data = formatDataMart(res.data)
          state.name = res.data[0].account_name
        })
        setPaging(res.paging)
        setLoading(false)
      })
  }

  function formatDataMart(rawData) {
    const dataMart = {}
    rawData.map((data) => {
      const date = data.date_start
      const campaignType = getCampaignType(data)

      dataMart[date]
        ? dataMart[date][campaignType]
          ? dataMart[date][campaignType].push(data)
          : (dataMart[date][campaignType] = [data])
        : (dataMart[date] = { [campaignType]: [data] })
    })
    // console.log('dataMart:', dataMart)
    return dataMart
  }

  function getCampaignType(data) {
    return data.campaign_name.includes('預熱')
      ? '預熱'
      : data.campaign_name.includes('前測')
      ? '前測'
      : data.campaign_name.includes('嘖嘖')
      ? '嘖嘖'
      : 'none'
  }
}

export default AdAccount
