import React, { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { format } from './utils'

import { HeaderContainer, ProjectContainer } from '../containers'

import './AdAccount.scss'

function AdAccount({ adAccountId }) {
  const [loading, setLoading] = useState(true)
  const [adAccount, setAdAccount] = useImmer({
    name: '',
    platformId: '',
    projectId: '',
    data: [],
    dateArray: [],

    leadSpendTotal: 0,
    leadSpendDaily: [],
    leadTotal: 0,
    leadDaily: [],
    costPerLeadDaily: [],

    preLaunchSpendTotal: 0,
    preLaunchSpendDaily: [],

    fundRaisingSpendTotal: 0,
    fundRaisingSpendDaily: [],
    adsDirectFundRaisingTotal: 0,
    adsDirectFundRaisingDaily: [],
    adsDirectRoasDaily: [],

    fundRaisingTotal: 0,
    fundRaisingDaily: [],
    orderCountTotal: 0,
    orderCountDaily: [],
    totalRoasDaily: [],
  })
  const [project, setProject] = useImmer({
    started_at: undefined,
    fundRaisingDateMap: undefined,
    orderCountDateMap: undefined,
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

  const leadLineChartData = {
    labels: [...adAccount.dateArray].reverse(),
    datasets: [
      {
        label: 'CPL',
        fill: false,
        borderColor: '#1f4068',
        pointBackgroundColor: '#1f4068',
        pointHoverBackgroundColor: '#1f4068',
        data: [...adAccount.costPerLeadDaily].reverse(),
        yAxisID: 'y-axis-1',
      },
    ],
  }

  const fundRaisingLineChartData = {
    labels: [...adAccount.dateArray].reverse(),
    datasets: [
      {
        label: '總體 ROAS',
        fill: false,
        borderColor: '#e43f5a',
        pointBackgroundColor: '#e43f5a',
        pointHoverBackgroundColor: '#e43f5a',
        data: [...adAccount.totalRoasDaily].reverse(),
        yAxisID: 'y-axis-2',
      },
    ],
  }

  // 取得廣告帳號資料、廣告數據資料
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

  // 處理廣告數據資料
  useEffect(() => {
    generateChartData()

    function generateChartData() {
      let dateArray = Object.keys(adAccount.data)

      let leadSpendTotal = 0
      let leadSpendDaily = []
      let leadTotal = 0
      let leadDaily = []
      let costPerLeadDaily = []

      let preLaunchSpendTotal = 0
      let preLaunchSpendDaily = []

      let fundRaisingSpendTotal = 0
      let fundRaisingSpendDaily = []
      let adsDirectFundRaisingTotal = 0
      let adsDirectFundRaisingDaily = []
      let adsDirectRoasDaily = []

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
            preLaunchSpendTotal += totalSpend
            preLaunchSpendDaily.push(totalSpend)
          } else {
            preLaunchSpendDaily.push(null)
          }
        } else {
          preLaunchSpendDaily.push(null)
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
            leadSpendTotal += totalSpend
            leadSpendDaily.push(totalSpend)

            leadTotal += totalLead
            leadDaily.push(totalLead)
            costPerLeadDaily.push((totalSpend / totalLead).toFixed(1))
          } else {
            leadSpendDaily.push(null)
            leadDaily.push(null)
            costPerLeadDaily.push(null)
          }
        } else {
          leadSpendDaily.push(null)
          leadDaily.push(null)
          costPerLeadDaily.push(null)
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
            fundRaisingSpendTotal += totalSpend
            fundRaisingSpendDaily.push(totalSpend)
            adsDirectFundRaisingTotal += totalRevenue
            adsDirectFundRaisingDaily.push(totalRevenue)
            adsDirectRoasDaily.push((totalRevenue / totalSpend).toFixed(1))
          } else {
            fundRaisingSpendDaily.push(null)
            adsDirectFundRaisingDaily.push(null)
            adsDirectRoasDaily.push(null)
          }
        } else {
          fundRaisingSpendDaily.push(null)
          adsDirectFundRaisingDaily.push(null)
          adsDirectRoasDaily.push(null)
        }
      })

      // console.log(adAccount.data, leadSpendDaily, costPerLeadDaily)

      setAdAccount((state) => {
        state.dateArray = dateArray

        state.leadSpendTotal = leadSpendTotal
        state.leadSpendDaily = leadSpendDaily
        state.leadTotal = leadTotal
        state.leadDaily = leadDaily
        state.costPerLeadDaily = costPerLeadDaily

        state.preLaunchSpendTotal = preLaunchSpendTotal
        state.preLaunchSpendDaily = preLaunchSpendDaily

        state.fundRaisingSpendTotal = fundRaisingSpendTotal
        state.fundRaisingSpendDaily = fundRaisingSpendDaily
        state.adsDirectFundRaisingTotal = adsDirectFundRaisingTotal
        state.adsDirectFundRaisingDaily = adsDirectFundRaisingDaily
        state.adsDirectRoasDaily = adsDirectRoasDaily
      })
    }
  }, [adAccount.data, setAdAccount])

  // 取得嘖嘖集資資料
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

  // 處理嘖嘖集資資料
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

    const fundRaisingDateMap = {}
    const orderCountDateMap = {}
    let fundingOfThePreviousDay = 0
    let orderOfThePreviousDay = 0
    for (let [date, fundingData] of Object.entries(timelineDataMart)) {
      const fundingToday = fundingData[fundingData.length - 1][2]
      const orderToday = fundingData[fundingData.length - 1][1]
      fundRaisingDateMap[date] = fundingToday - fundingOfThePreviousDay
      orderCountDateMap[date] = orderToday - orderOfThePreviousDay
      fundingOfThePreviousDay = fundingToday
      orderOfThePreviousDay = orderToday
    }

    setProject((state) => {
      state.fundRaisingDateMap = fundRaisingDateMap
      state.orderCountDateMap = orderCountDateMap
    })
  }, [project.timeline, project.started_at, project.finished_at, setProject])

  // 嘖嘖集資資料 => 廣數數據資料
  useEffect(() => {
    if (
      project.fundRaisingDateMap &&
      adAccount.fundRaisingSpendDaily.length > 0
    ) {
      let fundRaisingTotal = 0
      const fundRaisingDaily = []
      let orderCountTotal = 0
      const orderCountDaily = []

      const totalRoasDaily = []
      adAccount.dateArray.forEach((date, index) => {
        if (
          project.fundRaisingDateMap[date] &&
          project.orderCountDateMap[date] &&
          adAccount.fundRaisingSpendDaily[index]
        ) {
          fundRaisingTotal += project.fundRaisingDateMap[date]
          fundRaisingDaily.push(project.fundRaisingDateMap[date])
          orderCountTotal += project.orderCountDateMap[date]
          orderCountDaily.push(project.orderCountDateMap[date])
          totalRoasDaily.push(
            (
              project.fundRaisingDateMap[date] /
              adAccount.fundRaisingSpendDaily[index]
            ).toFixed(1)
          )
        } else {
          orderCountDaily.push(null)
          fundRaisingDaily.push(null)
          totalRoasDaily.push(null)
        }
      })
      setAdAccount((state) => {
        state.fundRaisingTotal = fundRaisingTotal
        state.fundRaisingDaily = fundRaisingDaily
        state.orderCountTotal = orderCountTotal
        state.orderCountDaily = orderCountDaily
        state.totalRoasDaily = totalRoasDaily
      })
    }
  }, [
    project.fundRaisingDateMap,
    project.orderCountDateMap,
    adAccount.fundRaisingSpendDaily,
    adAccount.dateArray,
    setAdAccount,
  ])

  return (
    <div className='container my-3'>
      <HeaderContainer title={adAccount.name} />
      {loading ? (
        <div className='text-center my-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='sr-only'>Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 集資資料 */}
          <ProjectContainer project={project} adAccount={adAccount} />

          {/* 圖表 */}
          <div className='my-5' style={{ height: '300px' }}>
            <Line data={leadLineChartData} options={chartConfigOptions} />
          </div>
          <div className='my-5' style={{ height: '300px' }}>
            <Line
              data={fundRaisingLineChartData}
              options={chartConfigOptions}
            />
          </div>

          {/* 走速表 */}
          <div className='table-responsive'>
            <div className='tableFixHead'>
              <table className='table'>
                <thead>
                  <tr>
                    <th scope='col'>Date</th>
                    <th scope='col'>前測花費</th>
                    <th scope='col'>名單數</th>
                    <th scope='col'>CPL</th>
                    <th scope='col'>預熱花費</th>
                    <th scope='col'>上線花費</th>
                    <th scope='col'>廣告直接轉換金額</th>
                    <th scope='col'>廣告直接 ROAS</th>
                    <th scope='col'>每日訂單數</th>
                    <th scope='col'>每日集資金額</th>
                    <th scope='col'>總體 ROAS</th>
                  </tr>
                  <tr>
                    <td>總計</td>
                    <td>{format(adAccount.leadSpendTotal).toDollar()}</td>
                    <td>{format(adAccount.leadTotal).toNumber()}</td>
                    <td>
                      {(adAccount.leadSpendTotal / adAccount.leadTotal).toFixed(
                        1
                      )}
                    </td>
                    <td>{format(adAccount.preLaunchSpendTotal).toDollar()}</td>
                    <td>
                      {format(adAccount.fundRaisingSpendTotal).toDollar()}
                    </td>
                    <td>
                      {format(adAccount.adsDirectFundRaisingTotal).toDollar()}
                    </td>
                    <td>
                      {(
                        adAccount.adsDirectFundRaisingTotal /
                        adAccount.fundRaisingSpendTotal
                      ).toFixed(1)}
                    </td>
                    <td>{format(adAccount.orderCountTotal).toNumber()}</td>
                    <td>{format(adAccount.fundRaisingTotal).toDollar()}</td>
                    <td>
                      {(
                        adAccount.fundRaisingTotal /
                        adAccount.fundRaisingSpendTotal
                      ).toFixed(1)}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {adAccount.dateArray.map((date, index) => {
                    return (
                      <tr key={`daily-adAccount-data-${index}`}>
                        <th>{date}</th>
                        <td>
                          {format(adAccount.leadSpendDaily[index]).toDollar()}
                        </td>
                        <td>{format(adAccount.leadDaily[index]).toNumber()}</td>
                        <td>
                          {format(adAccount.costPerLeadDaily[index]).toDollar()}
                        </td>
                        <td>
                          {format(
                            adAccount.preLaunchSpendDaily[index]
                          ).toDollar()}
                        </td>
                        <td>
                          {format(
                            adAccount.fundRaisingSpendDaily[index]
                          ).toDollar()}
                        </td>
                        <td>
                          {format(
                            adAccount.adsDirectFundRaisingDaily[index]
                          ).toDollar()}
                        </td>
                        <td>{adAccount.adsDirectRoasDaily[index]}</td>
                        <td>{adAccount.orderCountDaily[index]}</td>
                        <td>
                          {format(adAccount.fundRaisingDaily[index]).toDollar()}
                        </td>
                        <td>{adAccount.totalRoasDaily[index]}</td>
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
