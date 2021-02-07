import React, { useEffect, useState, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { format, debounce, textareaAutoResize } from '../utils/utils'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { HeaderContainer, ProjectContainer } from '../containers'

import './AdAccount.scss'

function AdAccount({ adAccountId, user }) {
  const [loading, setLoading] = useState(true)
  const [isShowLeadStats, setIsShowLeadStats] = useState(true)
  const [isShowFundRaisingStats, setIsShowFundRaisingStats] = useState(false)

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
  // console.log(adAccount.dateArray)
  const [project, setProject] = useImmer({
    started_at: undefined,
    fundRaisingDateMap: undefined,
    orderCountDateMap: undefined,
  })
  const [comment, setComment] = useImmer({})
  const updateCommentCallback = useCallback(
    debounce((value, date) => {
      updateComment(value, date)
    }, 600),
    []
  )

  const chartGlobalOptions = {
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0,
        borderWidth: 2,
      },
      point: {
        radius: 0,
      },
    },
    hover: {
      intersect: false,
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
  }

  const fundRaisingLineChartData = {
    labels:
      project.projectStartIndex !== undefined
        ? project.projectStartIndex === -1
          ? [...adAccount.dateArray].reverse()
          : [...adAccount.dateArray].reverse().slice(project.projectStartIndex)
        : [],
    datasets: [
      {
        label: '總體 ROAS',
        fill: false,
        borderColor: '#1060AB',
        pointBackgroundColor: '#1060AB',
        pointHoverBackgroundColor: '#1060AB',
        datalabels: {
          color: '#1060AB',
          align: 'top',
          offset: 8,
        },
        data:
          project.projectStartIndex !== undefined
            ? project.projectStartIndex === -1
              ? [...adAccount.totalRoasDaily].reverse()
              : [...adAccount.totalRoasDaily]
                  .reverse()
                  .slice(project.projectStartIndex)
            : [],
      },
      {
        label: '廣告 ROAS',
        fill: false,
        borderColor: '#1FA3EE',
        pointBackgroundColor: '#1FA3EE',
        pointHoverBackgroundColor: '#1FA3EE',
        datalabels: {
          color: '#1FA3EE',
          align: 'bottom',
          offset: 8,
        },
        data:
          project.projectStartIndex !== undefined
            ? project.projectStartIndex === -1
              ? [...adAccount.adsDirectRoasDaily].reverse()
              : [...adAccount.adsDirectRoasDaily]
                  .reverse()
                  .slice(project.projectStartIndex)
            : [],
      },
    ],
  }
  const fundRaisingLineChartOptions = {
    ...chartGlobalOptions,
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: 'ROAS',
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            callback: function (value, index, values) {
              return value.slice(5)
            },
          },
        },
      ],
    },
  }

  const leadLineChartData = {
    labels: project.projectStartIndex
      ? [...adAccount.dateArray]
          .reverse()
          .slice(0, project.projectStartIndex + 1)
      : [...adAccount.dateArray].reverse(),
    datasets: [
      {
        label: 'CPL',
        fill: false,
        borderColor: '#D07D00',
        pointBackgroundColor: '#D07D00',
        pointHoverBackgroundColor: '#D07D00',
        datalabels: {
          color: '#D07D00',
          align: 'top',
          offset: 8,
        },
        data: project.projectStartIndex
          ? [...adAccount.costPerLeadDaily]
              .reverse()
              .slice(0, project.projectStartIndex + 1)
          : [...adAccount.costPerLeadDaily].reverse(),
      },
    ],
  }
  const leadLineChartOptions = {
    ...chartGlobalOptions,
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          scaleLabel: {
            fontColor: '#D07D00',
            display: true,
            labelString: '名單取得成本',
          },
        },
      ],
      xAxes: [
        {
          ticks: {
            callback: function (value, index, values) {
              return value.slice(5)
            },
          },
        },
      ],
    },
  }

  // 取得廣告帳號資料、廣告數據資料
  useEffect(() => {
    fetchAdAccountInfo()
    fetchAdAccountInsights()

    function fetchAdAccountInfo() {
      fetch(
        // `http://localhost:8000/ad-account/info/${adAccountId}`
        `https://syphon-api.zectrack.today/ad-account/info/${adAccountId}`
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
        `https://syphon-api.zectrack.today/ad-account/insights/${adAccountId}`
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
            if (parseInt(adCampaign.spend) === 0) {
              return
            }

            const adCampaignSpend = parseInt(adCampaign.spend)
            const adCampaignOmniPurchaseAction =
              adCampaign.action_values &&
              adCampaign.action_values.find(
                (action) => action.action_type === 'omni_purchase'
              )
            totalSpend += adCampaignSpend
            totalRevenue += adCampaignOmniPurchaseAction
              ? parseInt(adCampaignOmniPurchaseAction.value)
              : 0
          })

          if (totalSpend !== 0) {
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
        `https://drip-plugin.crowdfunding.coffee/api/platform/${platformId}/projects/${projectId}`
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

    const projectStartDate = project.started_at.slice(0, 10)
    const projectStartIndex = [...adAccount.dateArray]
      .reverse()
      .findIndex((e) => e === projectStartDate)
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
    // console.log(fundRaisingDateMap, orderCountDateMap)

    setProject((state) => {
      state.fundRaisingDateMap = fundRaisingDateMap
      state.orderCountDateMap = orderCountDateMap
      state.projectStartIndex = projectStartIndex
    })
  }, [
    project.timeline,
    project.started_at,
    project.finished_at,
    setProject,
    adAccount.dateArray,
  ])

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
        fundRaisingTotal += project.fundRaisingDateMap[date]
          ? project.fundRaisingDateMap[date]
          : 0
        fundRaisingDaily.push(project.fundRaisingDateMap[date])
        orderCountTotal += project.orderCountDateMap[date]
          ? project.orderCountDateMap[date]
          : 0
        orderCountDaily.push(project.orderCountDateMap[date])
        if (
          project.fundRaisingDateMap[date] &&
          adAccount.fundRaisingSpendDaily[index]
        ) {
          totalRoasDaily.push(
            (
              project.fundRaisingDateMap[date] /
              adAccount.fundRaisingSpendDaily[index]
            ).toFixed(1)
          )
        } else {
          totalRoasDaily.push(0)
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

  useEffect(() => {
    if (project.id) {
      setIsShowLeadStats(false)
      setIsShowFundRaisingStats(true)
    }
  }, [project.id])

  // 取得備註資料
  useEffect(() => {
    fetch(
      `https://drip-plugin.crowdfunding.coffee/api/adAccountId/${adAccountId}/comment/`
    )
      .then((res) => res.json())
      .then((res) => {
        const commentMap = {}
        res.forEach(({ date, comment }) => {
          commentMap[date] = comment
        })

        setComment((state) => commentMap)
      })
  }, [adAccountId])

  useEffect(() => {
    textareaAutoResize()
  }, [user.isLogin, adAccount])

  return (
    <>
      <div className='container my-3'>
        <HeaderContainer title={adAccount.name} />
      </div>
      {loading ? (
        <div className='text-center my-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='sr-only'>Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 集資資料 */}
          <div className='container'>
            <ProjectContainer project={project} adAccount={adAccount} />
          </div>

          {/* 切換 tab */}
          <div className='container'>
            <div
              className={`ad-stats-nav-tabs ${
                isShowLeadStats ? 'ad-stats-nav-tabs--lead' : ''
              } ${
                isShowFundRaisingStats ? 'ad-stats-nav-tabs--fund-raising' : ''
              }`}
            >
              <div
                className={`tab__item tab__item--lead ${
                  isShowLeadStats ? 'active' : ''
                }`}
                onClick={() => {
                  setIsShowLeadStats(true)
                  setIsShowFundRaisingStats(false)
                }}
              >
                前測
              </div>
              {project.id && (
                <div
                  className={`tab__item tab__item--fund-raising ${
                    isShowFundRaisingStats ? 'active' : ''
                  }`}
                  onClick={() => {
                    setIsShowLeadStats(false)
                    setIsShowFundRaisingStats(true)
                  }}
                >
                  上線
                </div>
              )}
            </div>
          </div>

          {/* 集資廣告數據 */}
          {project.id && isShowFundRaisingStats && (
            <>
              <div
                className='container my-3 line-chart'
                style={{ height: '300px' }}
              >
                <Line
                  data={fundRaisingLineChartData}
                  options={fundRaisingLineChartOptions}
                />
              </div>
              <div className='adAccount__table adAccount__table--fund-raising'>
                <div className='adAccount__table-title'>每日數據</div>
                <div className='container table-responsive'>
                  <div className='tableFixHead'>
                    <table className='table'>
                      <thead>
                        <tr>
                          <td>Date</td>
                          <td className='table--hide-in-mobile'>
                            每日集資金額
                          </td>
                          <td className='table--hide-in-mobile'>每日訂單數</td>
                          <td>上線廣告花費</td>
                          <td>廣告直接轉換金額</td>
                          <td>廣告直接 ROAS</td>
                          <td>總體 ROAS</td>
                          {user.isLogin && (
                            <td className='table--hide-in-mobile'>備註</td>
                          )}
                        </tr>
                        <tr>
                          <th>總計</th>
                          <th className='table--hide-in-mobile'>
                            {format(adAccount.fundRaisingTotal).toDollar()}
                          </th>
                          <th className='table--hide-in-mobile'>
                            {format(adAccount.orderCountTotal).toNumber()}
                          </th>
                          <th>
                            {format(adAccount.fundRaisingSpendTotal).toDollar()}
                          </th>
                          <th>
                            {format(
                              adAccount.adsDirectFundRaisingTotal
                            ).toDollar()}
                          </th>
                          <th>
                            {(
                              adAccount.adsDirectFundRaisingTotal /
                              adAccount.fundRaisingSpendTotal
                            ).toFixed(1)}
                          </th>
                          <th>
                            {(
                              adAccount.fundRaisingTotal /
                              adAccount.fundRaisingSpendTotal
                            ).toFixed(1)}
                          </th>
                          {user.isLogin && (
                            <th className='table--hide-in-mobile'></th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {adAccount.dateArray.map((date, index) => {
                          const reserveDayCount =
                            adAccount.dateArray.length -
                            project.projectStartIndex -
                            1
                          if (index > reserveDayCount) {
                            return null
                          }

                          return (
                            <tr key={`daily-adAccount-data-${index}`}>
                              <th>{date.slice(5)}</th>
                              <td className='table--hide-in-mobile'>
                                {format(
                                  adAccount.fundRaisingDaily[index]
                                ).toDollar()}
                              </td>
                              <td className='table--hide-in-mobile'>
                                {adAccount.orderCountDaily[index]}
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
                              <td>{adAccount.totalRoasDaily[index]}</td>
                              {user.isLogin && (
                                <td
                                  className='table--hide-in-mobile'
                                  style={{ padding: '8px' }}
                                >
                                  <textarea
                                    value={comment[date]}
                                    className='form-control form-control-sm'
                                    rows='1'
                                    cols='20'
                                    data-date={date}
                                    style={{ overflowY: 'hidden' }}
                                    onChange={handleCommentInputChange}
                                  />
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 前測廣告數據 */}
          {isShowLeadStats && (
            <>
              <div
                className='container my-3 line-chart'
                style={{ height: '300px' }}
              >
                <Line data={leadLineChartData} options={leadLineChartOptions} />
              </div>
              <div className='adAccount__table adAccount__table--lead'>
                <div className='adAccount__table-title'>每日數據</div>
                <div className='container table-responsive'>
                  <div className='tableFixHead'>
                    <table className='table'>
                      <thead>
                        <tr>
                          <td>Date</td>
                          <td>前測花費</td>
                          <td>名單數</td>
                          <td>CPL</td>
                          <td className='table--hide-in-mobile'>預熱花費</td>
                          {user.isLogin && (
                            <td className='table--hide-in-mobile'>備註</td>
                          )}
                        </tr>
                        <tr>
                          <th>總計</th>
                          <th>{format(adAccount.leadSpendTotal).toDollar()}</th>
                          <th>{format(adAccount.leadTotal).toNumber()}</th>
                          <th>
                            {(
                              adAccount.leadSpendTotal / adAccount.leadTotal
                            ).toFixed(1)}
                          </th>
                          <th className='table--hide-in-mobile'>
                            {format(adAccount.preLaunchSpendTotal).toDollar()}
                          </th>
                          {user.isLogin && (
                            <th className='table--hide-in-mobile'></th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {adAccount.dateArray.map((date, index) => {
                          const filterDayCount =
                            adAccount.dateArray.length -
                            project.projectStartIndex -
                            1

                          if (index < filterDayCount) {
                            return null
                          }
                          return (
                            <tr key={`daily-adAccount-data-${index}`}>
                              <th>{date.slice(5)}</th>
                              <td>
                                {format(
                                  adAccount.leadSpendDaily[index]
                                ).toDollar()}
                              </td>
                              <td>
                                {format(adAccount.leadDaily[index]).toNumber()}
                              </td>
                              <td>
                                {format(
                                  adAccount.costPerLeadDaily[index]
                                ).toDollar()}
                              </td>
                              <td className='table--hide-in-mobile'>
                                {format(
                                  adAccount.preLaunchSpendDaily[index]
                                ).toDollar()}
                              </td>
                              {user.isLogin && (
                                <td
                                  className='table--hide-in-mobile'
                                  style={{ padding: '8px' }}
                                >
                                  <textarea
                                    value={comment[date]}
                                    className='form-control form-control-sm'
                                    rows='1'
                                    cols='20'
                                    data-date={date}
                                    style={{ overflowY: 'hidden' }}
                                    onChange={handleCommentInputChange}
                                  />
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  )

  function handleCommentInputChange(event) {
    const value = event.target.value
    const date = event.target.dataset.date
    // event.target.style.height = event.target.scrollHeight + 'px'
    setComment((state) => ({
      ...state,
      [date]: value,
    }))
    updateCommentCallback(value, date)
  }

  function updateComment(comment, date) {
    fetch(`https://drip-plugin.crowdfunding.coffee/api/comment/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adAccountId,
        date,
        comment,
      }),
    })
  }
}

const mapStateToProps = ({ user }) => ({
  user,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(AdAccount)
