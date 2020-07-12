import React, { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { navigate } from '@reach/router'
import { format } from './utils'

import './AdAccount.css'

function AdAccount({ adAccountId }) {
  const [loading, setLoading] = useState(true)
  const [adAccount, setAdAccount] = useImmer({
    name: '',
    platformId: '',
    projectId: '',
    data: [],
    dateArray: [],
    leadSpendArray: [],
    leadArray: [],
    preLaunchSpendArray: [],
    fundRaisingSpendArray: [],
    adsDirectRoasArray: [],
    dailyOrderCount:[],
    dailyFunding:[],
    totalRoasArray: [],
  })
  const [project, setProject] = useImmer({
    dailyFundingDiff: undefined,
    dailyOrderDiff: undefined
  })

  const chartConfigOptions = {
    maintainAspectRatio: false,
    hover: {
      intersect: false,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          id: 'y-axis-1',
          gridLines: {
            drawOnChartArea: false,
          },
          scaleLabel: {
            display: true,
            labelString: '名單取得成本',
          },
        },
        {
          type: 'linear',
          display: true,
          position: 'right',
          id: 'y-axis-2',
          scaleLabel: {
            display: true,
            labelString: 'ROAS',
          },
        },
      ],
    },
    plugins: {
      datalabels: {
        color: 'black',
        align: 'top',
        offset: 8,
      },
    },
  }

  const lineChartData = {
    labels: [...adAccount.dateArray].reverse(),
    datasets: [
      {
        label: 'CPL',
        fill: false,
        borderColor: '#1f4068',
        pointBackgroundColor: '#1f4068',
        pointHoverBackgroundColor: '#1f4068',
        data: [...adAccount.leadArray].reverse(),
        yAxisID: 'y-axis-1',
      },
      // {
      //   label: '廣告直接 ROAS',
      //   fill: false,
      //   borderColor: '#1b1b2f',
      //   pointBackgroundColor: '#1b1b2f',
      //   pointHoverBackgroundColor: '#1b1b2f',
      //   data: [...adAccount.adsDirectRoasArray].reverse(),
      //   yAxisID: 'y-axis-2',
      // },
      {
        label: '總體 ROAS',
        fill: false,
        borderColor: '#e43f5a',
        pointBackgroundColor: '#e43f5a',
        pointHoverBackgroundColor: '#e43f5a',
        data: [...adAccount.totalRoasArray].reverse(),
        yAxisID: 'y-axis-2',
      },
    ],
  }

  useEffect(() => {
    fetchAdAccountInfo()
    fetchAdAccountInsights()

    function fetchAdAccountInfo() {
      fetch(
        // `http://localhost:8000/ad-account/info/${adAccountId}`
        `https://fb-ads-api.herokuapp.com/ad-account/info/${adAccountId}`
      )
        .then((res) => res.json())
        .then((res) => {
          setAdAccount((state) => {
            state.name = res.name
            state.platformId = res.business_street
            state.projectId = res.business_street2
          })
        })
    }

    function fetchAdAccountInsights() {
      setLoading(true)
      fetch(
        // `http://localhost:8000/ad-account/insights/${adAccountId}`
        `https://fb-ads-api.herokuapp.com/ad-account/insights/${adAccountId}`
      )
        .then((res) => res.json())
        .then((res) => {
          // console.log(res)
          setAdAccount((state) => {
            state.data = formatDataMart(res.data)
          })
          setLoading(false)
        })
    }

    function formatDataMart(rawData) {
      const dataMart = {}
      rawData.forEach((data) => {
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
        : data.campaign_name.includes('上線')
        ? '上線'
        : 'none'
    }
  }, [adAccountId, setAdAccount])

  useEffect(() => {
    generateChartData()

    function generateChartData() {
      let dateArray = Object.keys(adAccount.data)
      let leadSpendArray = []
      let leadArray = []
      let preLaunchSpendArray = []
      let fundRaisingSpendArray = []
      let adsDirectRoasArray = []

      Object.values(adAccount.data).forEach((dateData) => {
        if (dateData['預熱']) {
          const adCampaignArray = dateData['預熱']
          let totalSpend = 0

          adCampaignArray.forEach((adCampaign) => {
            if (parseInt(adCampaign.spend) === 0) {
              return
            }

            const adCampaignSpend = parseInt(adCampaign.spend)

            totalSpend += adCampaignSpend
          })
          if (totalSpend !== 0) {
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

          adCampaignArray.forEach((adCampaign) => {
            if (parseInt(adCampaign.spend) === 0 || !adCampaign.actions) {
              return
            }

            const adCampaignSpend = parseInt(adCampaign.spend)
            const adCampaignLeadAction = adCampaign.actions.find(
              (action) =>
                action.action_type === 'offsite_conversion.fb_pixel_custom' ||
                action.action_type === 'lead'
            )

            totalSpend += adCampaignSpend
            totalLead += adCampaignLeadAction
              ? parseInt(adCampaignLeadAction.value)
              : 0
          })
          if (totalSpend !== 0 && totalLead !== 0) {
            leadSpendArray.push(totalSpend)
            leadArray.push((totalSpend / totalLead).toFixed(1))
          } else {
            leadSpendArray.push(null)
            leadArray.push(null)
          }
        } else {
          leadSpendArray.push(null)
          leadArray.push(null)
        }

        if (dateData['上線']) {
          const adCampaignArray = dateData['上線']
          let totalSpend = 0
          let totalRevenue = 0

          adCampaignArray.forEach((adCampaign) => {
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
            fundRaisingSpendArray.push(totalSpend)
            adsDirectRoasArray.push((totalRevenue / totalSpend).toFixed(1))
          } else {
            fundRaisingSpendArray.push(null)
            adsDirectRoasArray.push(null)
          }
        } else {
          fundRaisingSpendArray.push(null)
          adsDirectRoasArray.push(null)
        }
      })

      // console.log(adAccount.data, leadSpendArray, leadArray)

      setAdAccount((state) => {
        state.dateArray = dateArray
        state.leadSpendArray = leadSpendArray
        state.leadArray = leadArray
        state.preLaunchSpendArray = preLaunchSpendArray
        state.fundRaisingSpendArray = fundRaisingSpendArray
        state.adsDirectRoasArray = adsDirectRoasArray
      })
    }
  }, [adAccount.data, setAdAccount])

  useEffect(() => {
    const platformId = adAccount.platformId
    const projectId = adAccount.projectId
    if (platformId && projectId) {
      fetchFundingData(platformId, projectId)
    }

    function fetchFundingData(platformId, projectId) {
      fetch(
        `https://drip.zectrack.today/api/platform/${platformId}/projects/${projectId}`
      )
        .then((res) => res.json())
        .then((res) => {
          setProject((state) => ({
            ...state,
            ...res,
            timeline: JSON.parse(res.timeline).sort((a, b) => a[0] - b[0]),
            sponsor_count: format(res.sponsor_count).toNumber(),
            funding_target: format(res.funding_target).toDollar(),
            funding_current: format(res.funding_current).toDollar(),
            started_at: format(res.started_at).toProjectTime(),
            finished_at: format(res.finished_at).toProjectTime(),
          }))
        })
    }
  }, [adAccount.platformId, adAccount.projectId, setProject])

  useEffect(() => {
    if (!project.timeline) return

    // Add datetime.slice(0,-1) to cut the denoted by the suffix "Z"
    let projectStartAt =
      new Date(project.started_at.slice(0, -1)).getTime() / 1000
    let projectFinishAt =
      new Date(project.finished_at.slice(0, -1)).getTime() / 1000
    // Minus one hour to get the zero data.
    projectStartAt = projectStartAt - 60 * 60

    const timelineDataMart = {}
    project.timeline.forEach((data) => {
      if (data[0] < projectStartAt || data[0] > projectFinishAt) return

      const date = format(data[0] * 1000).toDate()
      const time = format(data[0] * 1000).toTime()
      const fundingData = [time, data[1], data[2]]

      timelineDataMart[date]
        ? timelineDataMart[date].push(fundingData)
        : (timelineDataMart[date] = [fundingData])
    })

    const dailyFundingDiff = {}
    const dailyOrderDiff = {}
    let fundingOfThePreviousDay = 0
    let orderOfThePreviousDay = 0
    for (let [date, fundingData] of Object.entries(timelineDataMart)) {
      const fundingToday = fundingData[fundingData.length - 1][2]
      const orderToday = fundingData[fundingData.length - 1][1]
      dailyFundingDiff[date] = fundingToday - fundingOfThePreviousDay
      dailyOrderDiff[date] = orderToday -orderOfThePreviousDay
      fundingOfThePreviousDay = fundingToday
      orderOfThePreviousDay = orderToday
    }

    setProject((state) => {
      state.dailyFundingDiff = dailyFundingDiff
      state.dailyOrderDiff = dailyOrderDiff
    })
  }, [project.timeline, project.started_at, project.finished_at, setProject])

  useEffect(() => {
    if (
      project.dailyFundingDiff &&
      adAccount.fundRaisingSpendArray.length > 0
    ) {
      const dailyOrderCount = []
      const dailyFunding = []
      const totalRoasArray = []
      adAccount.dateArray.forEach((date, index) => {
        if (
          project.dailyFundingDiff[date] &&
          project.dailyOrderDiff[date] &&
          adAccount.fundRaisingSpendArray[index]
        ) {
          dailyOrderCount.push(project.dailyOrderDiff[date])
          dailyFunding.push(project.dailyFundingDiff[date])
          totalRoasArray.push(
            (
              project.dailyFundingDiff[date] /
              adAccount.fundRaisingSpendArray[index]
            ).toFixed(1)
          )
        } else {
          dailyOrderCount.push(null)
          dailyFunding.push(null)
          totalRoasArray.push(null)
        }
      })
      setAdAccount((state) => {
        state.dailyOrderCount = dailyOrderCount
        state.dailyFunding = dailyFunding
        state.totalRoasArray = totalRoasArray
      })
    }
  }, [
    project.dailyFundingDiff,
    project.dailyOrderDiff,
    adAccount.fundRaisingSpendArray,
    adAccount.dateArray,
    setAdAccount,
  ])

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

          {/* 集資資料 */}
          {project.name ? (
            <div className='row'>
              <div className='col-12 col-md-6'>
                <div
                  style={{
                    margin: '0 auto',
                    maxWidth: '480px',
                  }}
                >
                  <div
                    style={{
                      paddingTop: '56.25%',
                      backgroundImage: `url(${project.og_image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  ></div>
                </div>
              </div>
              <div className='col-12 col-md-6 p-3'>
                <p>
                  {/* TODO: 串接其他平台 */}
                  <a
                    href={
                      'https://www.zeczec.com/projects/' + adAccount.projectId
                    }
                    target='blank'
                  >
                    {project.name}
                  </a>
                </p>
                <h3>{project.funding_current}</h3>
                <hr />
                <p>
                  <span className='font-weight-bolder mr-3'>目標</span>
                  <span className='text-secondary'>
                    {project.funding_target}
                  </span>
                </p>
                <p>
                  <span className='font-weight-bolder mr-3'>贊助人數</span>
                  <span className='text-secondary'>
                    {project.sponsor_count}
                  </span>
                </p>
                <p>
                  <span className='font-weight-bolder mr-3'>時程</span>
                  <span className='text-secondary'>
                    {project.started_at} ~ {project.finished_at}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            ''
          )}

          {/* 圖表 */}
          <div className='my-5' style={{ height: '300px' }}>
            <Line data={lineChartData} options={chartConfigOptions} />
          </div>

          {/* 走速表 */}
          <div className='table-responsive'>
            <div className='tableFixHead'>
              <table className='table'>
                <thead>
                  <tr>
                    <th scope='col'>Date</th>
                    <th scope='col'>前測花費</th>
                    <th scope='col'>CPL</th>
                    <th scope='col'>預熱花費</th>
                    <th scope='col'>上線花費</th>
                    <th scope='col'>廣告直接 ROAS</th>
                    <th scope='col'>每日訂單數</th>
                    <th scope='col'>每日集資金額</th>
                    <th scope='col'>總體 ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {adAccount.dateArray.map((date, index) => {
                    return (
                      <tr key={`daily-adAccount-data-${index}`}>
                        <th>{date}</th>
                        <td>
                          {format(adAccount.leadSpendArray[index]).toDollar()}
                        </td>
                        <td>{format(adAccount.leadArray[index]).toDollar()}</td>
                        <td>
                          {format(
                            adAccount.preLaunchSpendArray[index]
                          ).toDollar()}
                        </td>
                        <td>
                          {format(
                            adAccount.fundRaisingSpendArray[index]
                          ).toDollar()}
                        </td>
                        <td>{adAccount.adsDirectRoasArray[index]}</td>
                        <td>{adAccount.dailyOrderCount[index]}</td>
                        <td>{format(adAccount.dailyFunding[index]).toDollar()}</td>
                        <td>{adAccount.totalRoasArray[index]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdAccount
