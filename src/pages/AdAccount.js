import React, { useEffect, useState, useCallback } from 'react'
import { useImmer } from 'use-immer'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { format, debounce, textareaAutoResize } from '../utils/utils'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { HeaderContainer, ProjectContainer } from '../containers'
import { useGoogleAnalytics } from '../hooks'

import './AdAccount.scss'

function AdAccount({ adAccountId, user }) {
  const [loading, setLoading] = useState(true)

  const LEAD = 'lead'
  const FUND_RAISING = 'fundRaising'
  const BREW = 'brew'
  const [tabTopic, setTabTopic] = useState(LEAD)

  const timeZoneOffset = new Date().getTimezoneOffset() * 60 * 1000
  const initialTimeRange90Days = 90 * 24 * 60 * 60 * 1000
  const initialSinceTime =
    new Date().getTime() - timeZoneOffset - initialTimeRange90Days
  const initialUntilTime = new Date().getTime() - timeZoneOffset
  const initialSinceDate = new Date(initialSinceTime)
    .toISOString()
    .split('T')[0]
  const initialUntilDate = new Date(initialUntilTime)
    .toISOString()
    .split('T')[0]
  const [timeRangeSince, setTimeRangeSince] = useState(initialSinceDate)
  const [timeRangeUntil, setTimeRangeUntil] = useState(initialUntilDate)
  const [numberOfReload, setNumberOfReload] = useState(1)

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

    brewData: {
      adsDirectRoasDaily: [],
    },
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

  const [chatbot, setChatbot] = useImmer(false)
  const [brew, setBrew] = useImmer({
    isOpen: false,
    totalOrderCount: 0,
    totalOrderSum: 0,
    orderStatsDaily: [],
    dateArray: [],
    dateToOrderSum: {},
  })

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
        label: 'CPL(FB)',
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

  const brewLineChartData = {
    labels: [...brew.dateArray],
    datasets: [],
  }

  if (brew.isOpen && adAccount.brewData.brewAdsSpendTotal) {
    const brewTotalRoasDaily = []
    const brewAdsDirectRoasDaily = []
    brew.dateArray.forEach((date) => {
      if (adAccount.brewData[date]?.spend === 0) {
        brewTotalRoasDaily.push(null)
        brewAdsDirectRoasDaily.push(null)
        return
      }
      brewTotalRoasDaily.push(
        (brew.dateToOrderSum[date] / adAccount.brewData[date]?.spend).toFixed(1)
      )
      brewAdsDirectRoasDaily.push(
        (
          adAccount.brewData[date]?.revenue / adAccount.brewData[date]?.spend
        ).toFixed(1)
      )
    })
    brewLineChartData.datasets.push(
      {
        label: '總體 ROAS',
        fill: false,
        borderColor: '#21912a',
        pointBackgroundColor: '#21912a',
        pointHoverBackgroundColor: '#21912a',
        datalabels: {
          color: '#21912a',
          align: 'top',
          offset: 8,
        },
        data: brewTotalRoasDaily,
      },
      {
        label: '廣告 ROAS',
        fill: false,
        borderColor: '#48bf53',
        pointBackgroundColor: '#48bf53',
        pointHoverBackgroundColor: '#48bf53',
        datalabels: {
          color: '#48bf53',
          align: 'bottom',
          offset: 8,
        },
        data: brewAdsDirectRoasDaily,
      }
    )
  }

  const brewLineChartOptions = {
    ...chartGlobalOptions,
    scales: {
      yAxes: [
        {
          type: 'linear',
          display: true,
          position: 'left',
          scaleLabel: {
            fontColor: '#48bf53',
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

  const initialGaViewIdMap = {}
  initialGaViewIdMap[LEAD] = ''
  initialGaViewIdMap[FUND_RAISING] = ''
  const [gaViewIdMap, setGaViewIdMap] = useImmer(initialGaViewIdMap)
  // console.log('gaViewIdMap', gaViewIdMap)

  const leadGAReportRequests = [
    {
      viewId: gaViewIdMap[LEAD],
      dateRanges: [
        {
          startDate: timeRangeSince,
          endDate: timeRangeUntil,
        },
      ],
      metrics: [
        {
          expression: 'ga:goalCompletionsAll',
        },
      ],
      dimensions: [{ name: 'ga:date' }],
    },
  ]
  const [fetchLeadGACount, setFetchLeadGACount] = useState(0)
  const leadGAData = useGoogleAnalytics(leadGAReportRequests, fetchLeadGACount)
  // console.log('leadGAData', leadGAData)

  if (
    gaViewIdMap[LEAD] &&
    leadGAData.total &&
    adAccount.leadSpendDaily.length
  ) {
    let costPerGALeadDaily = []
    adAccount.dateArray.map((date, index) => {
      if (leadGAData[date]) {
        costPerGALeadDaily.push(
          (adAccount.leadSpendDaily[index] / leadGAData[date]).toFixed(1)
        )
      } else {
        costPerGALeadDaily.push(null)
      }
    })

    leadLineChartData.datasets.push({
      label: 'CPL(GA)',
      fill: false,
      borderColor: '#f9af0b',
      pointBackgroundColor: '#f9af0b',
      pointHoverBackgroundColor: '#f9af0b',
      datalabels: {
        color: '#f9af0b',
        align: 'top',
        offset: 8,
      },
      data: project.projectStartIndex
        ? [...costPerGALeadDaily]
            .reverse()
            .slice(0, project.projectStartIndex + 1)
        : [...costPerGALeadDaily].reverse(),
    })
  }

  const fundRaisingGAReportRequests = [
    {
      viewId: gaViewIdMap[FUND_RAISING],
      dateRanges: [
        {
          startDate: timeRangeSince,
          endDate: timeRangeUntil,
        },
      ],
      metrics: [
        {
          expression: 'ga:transactionRevenue',
        },
      ],
      dimensions: [{ name: 'ga:date' }],
    },
  ]
  const [fetchFundRaisingGACount, setFetchFundRaisingGACount] = useState(0)
  const fundRaisingGAData = useGoogleAnalytics(
    fundRaisingGAReportRequests,
    fetchFundRaisingGACount
  )
  // console.log('fundRaisingGAData', fundRaisingGAData)

  // 取得廣告帳號資料、廣告數據資料
  useEffect(() => {
    if (timeRangeSince >= timeRangeUntil) {
      alert('開始時間必須小於結束時間')
      return
    }
    fetchAdAccountInfo()
    fetchAdAccountInsights()
    fetchChatbotData()
    fetchBrewData()

    function fetchAdAccountInfo() {
      fetch(
        // `http://localhost:8000/ad-account/info/${adAccountId}`
        `https://syphon-api.crowdfunding.coffee/ad-account/info/${adAccountId}`
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
        // `http://localhost:8000/ad-account/insights/${adAccountId}?timeRangeSince=${timeRangeSince}&timeRangeUntil=${timeRangeUntil}`
        `https://syphon-api.crowdfunding.coffee/ad-account/insights/${adAccountId}?timeRangeSince=${timeRangeSince}&timeRangeUntil=${timeRangeUntil}`
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(res)
          if (res.data) {
            setAdAccount((state) => {
              state.data = formatDataMart(res.data)
            })
          } else {
            setAdAccount((state) => {
              state.data = {}
            })
          }

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

        dataMart[date].date = date
      })
      console.log('dataMart:', dataMart)
      return dataMart
    }

    function getCampaignType(data) {
      return data.campaign_name.includes('預熱')
        ? '預熱'
        : data.campaign_name.includes('前測')
        ? '前測'
        : data.campaign_name.includes('上線')
        ? '上線'
        : data.campaign_name.toLowerCase().includes('brew')
        ? 'BREW'
        : 'none'
    }

    function fetchChatbotData() {
      fetch(
        `https://beans-logistics.crowdfunding.coffee/openapi/syphon.php?act=${adAccountId.slice(
          4
        )}&start=${timeRangeSince}&end=${timeRangeUntil}`
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.length > 0) {
            const chatbotMap = {}
            let chatbotTotal = 0
            res.forEach(({ date_time, order_audience }) => {
              chatbotTotal += order_audience
              chatbotMap[format(date_time).toDate()] = order_audience
            })
            // console.log(chatbotMap)
            setChatbot((state) => chatbotMap)
            setAdAccount((state) => {
              state.chatbotTotal = chatbotTotal
            })
          } else {
            setChatbot((state) => false)
            setAdAccount((state) => {
              state.chatbotTotal = 0
            })
          }
        })
        .catch((res) => {
          console.error(res)
          setChatbot((state) => false)
          setAdAccount((state) => {
            state.chatbotTotal = 0
          })
        })
    }

    function fetchBrewData() {
      fetch(
        `https://brew-logistics.crowdfunding.coffee/openapi/syphon_preorder.php?act=${adAccountId.slice(
          4
        )}&start=${timeRangeSince}&end=${timeRangeUntil}`
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.length > 0) {
            const isOpen = true
            let orderStatsDaily = []
            let totalOrderCount = 0
            let totalOrderSum = 0
            let dateArray = []
            let dateToOrderSum = {}

            res.forEach(({ date_time, order_sum, order_count }) => {
              totalOrderSum += order_sum
              totalOrderCount += order_count
              orderStatsDaily.push({
                date: format(date_time).toDate(),
                orderSum: order_sum,
                orderCount: order_count,
              })

              dateArray.push(format(date_time).toDate())
              dateToOrderSum[format(date_time).toDate()] = order_sum
            })
            orderStatsDaily = orderStatsDaily.reverse()

            setBrew((state) => ({
              isOpen,
              orderStatsDaily,
              totalOrderCount,
              totalOrderSum,
              dateArray,
              dateToOrderSum,
            }))
          }
        })
        .catch((res) => {
          console.error(res)
          setBrew((state) => {
            state.isOpen = false
          })
        })
    }
  }, [adAccountId, setAdAccount, numberOfReload])

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

      let brewData = {
        brewAdsSpendTotal: 0,
        brewAdsRevenueTotal: 0,
      }

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
            const adCampaignLeadAction = adCampaign.actions.find((action) => {
              if (
                adCampaign.campaign_name.toLowerCase().includes('surveycake')
              ) {
                return action.action_type.startsWith(
                  'offsite_conversion.custom.'
                )
              } else {
                return (
                  action.action_type === 'offsite_conversion.fb_pixel_custom' ||
                  (action.action_type === 'lead') |
                    (action.action_type ===
                      'offsite_conversion.fb_pixel_complete_registration')
                )
              }
            })

            totalSpend += adCampaignSpend
            totalLead += adCampaignLeadAction
              ? parseInt(adCampaignLeadAction.value)
              : 0
          })
          if (totalSpend !== 0) {
            leadSpendTotal += totalSpend
            leadSpendDaily.push(totalSpend)
          } else {
            leadSpendDaily.push(null)
          }

          if (totalLead !== 0) {
            leadTotal += totalLead
            leadDaily.push(totalLead)
          } else {
            leadDaily.push(null)
          }

          if (totalSpend !== 0 && totalLead !== 0) {
            costPerLeadDaily.push((totalSpend / totalLead).toFixed(1))
          } else {
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

        if (dateData['BREW']) {
          const adCampaignArray = dateData['BREW']
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

          brewData[dateData.date] = {
            spend: totalSpend,
            revenue: totalRevenue,
          }
          brewData.brewAdsSpendTotal += totalSpend
          brewData.brewAdsRevenueTotal += totalRevenue
        }
      })

      // console.log(adAccount.data, leadSpendDaily, costPerLeadDaily)
      // console.log('brewData', brewData)

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

        state.brewData = brewData
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
          setProject((state) => {
            let timeline = JSON.parse(res.timeline)

            if (res.customize_timeline) {
              const customize_timeline = JSON.parse(res.customize_timeline)
              timeline.push(...customize_timeline)
            }

            return {
              ...state,
              ...res,
              timeline: timeline.sort((a, b) => a[0] - b[0]),
              sponsor_count: format(res.sponsor_count).toNumber(),
              funding_target: format(res.funding_target).toDollar(),
              funding_current: format(res.funding_current).toDollar(),
              started_at: format(res.started_at).toProjectTime(),
              finished_at: format(res.finished_at).toProjectTime(),
            }
          })
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
      setTabTopic(FUND_RAISING)
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

  // 取得 GA ViewId
  useEffect(() => {
    fetch(
      `https://drip-plugin.crowdfunding.coffee/api/adAccountId/${adAccountId}/ga-viewId`
      // `http://localhost:3050/api/adAccountId/${adAccountId}/ga-viewId`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.length > 0) {
          res.forEach(({ topic, viewId }) => {
            setGaViewIdMap((state) => {
              state[topic] = viewId
            })
          })
          setFetchLeadGACount((state) => state + 1)
          setFetchFundRaisingGACount((state) => state + 1)
        }
      })
  }, [])

  return (
    <>
      <div className="container my-3">
        <HeaderContainer title={adAccount.name} />
      </div>
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 起迄日期選擇器 */}
          <div className="container">
            <div className="row time-range">
              <div className="col-sm-12 col-md-2 time-range__title">
                資料選取範圍
              </div>
              <div className="col-sm-6 col-md-4 time-picker">
                <label htmlFor="timeRangeSince">開始時間</label>
                <input
                  id="timeRangeSince"
                  type="date"
                  value={timeRangeSince}
                  max={initialUntilDate}
                  onChange={(e) => {
                    setTimeRangeSince(e.target.value)
                  }}
                />
              </div>
              <div className="col-sm-6 col-md-4 time-picker">
                <label htmlFor="timeRangeUntil">結束時間</label>
                <input
                  id="timeRangeUntil"
                  type="date"
                  value={timeRangeUntil}
                  max={initialUntilDate}
                  onChange={(e) => {
                    setTimeRangeUntil(e.target.value)
                  }}
                />
              </div>
              <div className="col-sm-12 col-md-2 time-range__button">
                <div
                  className="btn btn-primary btn-block m-1"
                  onClick={() => {
                    setNumberOfReload((state) => state + 1)
                  }}
                >
                  更新
                </div>
              </div>
            </div>
          </div>
          {/* GA ViewId */}
          {
            <div className="container">
              <div className="row ga-view-id">
                <div className="col-sm-12 col-md-6 ga-view-id-group">
                  <label htmlFor="lead-ga-view-id">
                    前測問卷{' '}
                    <a
                      target="blank"
                      href="https://keyword-hero.com/documentation/finding-your-view-id-in-google-analytics"
                    >
                      GA View ID
                    </a>
                  </label>
                  <input
                    id="lead-ga-view-id"
                    value={gaViewIdMap[LEAD]}
                    onChange={(event) => {
                      event.persist()
                      setGaViewIdMap((state) => {
                        state[LEAD] = event.target.value
                      })
                    }}
                    disabled={!user.isLogin}
                  />
                  <div
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      updateGaViewId(LEAD, gaViewIdMap[LEAD])
                      setFetchLeadGACount((state) => state + 1)
                    }}
                  >
                    更新
                  </div>
                </div>
                <div className="col-sm-12 col-md-6  ga-view-id-group">
                  <label htmlFor="fund-raising-ga-view-id">
                    嘖嘖{' '}
                    <a
                      target="blank"
                      href="https://keyword-hero.com/documentation/finding-your-view-id-in-google-analytics"
                    >
                      GA View ID
                    </a>
                  </label>
                  <input
                    id="fund-raising-ga-view-id"
                    value={gaViewIdMap[FUND_RAISING]}
                    onChange={(event) => {
                      event.persist()
                      setGaViewIdMap((state) => {
                        state[FUND_RAISING] = event.target.value
                      })
                    }}
                    disabled={!user.isLogin}
                  />
                  <div
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      updateGaViewId(FUND_RAISING, gaViewIdMap[FUND_RAISING])
                      setFetchFundRaisingGACount((state) => state + 1)
                    }}
                  >
                    更新
                  </div>
                </div>
              </div>
            </div>
          }
          {/* 集資資料 */}
          <div className="container">
            <ProjectContainer
              project={project}
              adAccount={adAccount}
              gaViewIdMap={gaViewIdMap}
              leadGAData={leadGAData}
            />
          </div>
          {/* 切換 tab */}
          <div className="container">
            <div
              className={`ad-stats-nav-tabs ${
                tabTopic === LEAD
                  ? 'ad-stats-nav-tabs--lead'
                  : tabTopic === FUND_RAISING
                  ? 'ad-stats-nav-tabs--fund-raising'
                  : tabTopic === BREW
                  ? 'ad-stats-nav-tabs--brew'
                  : ''
              }`}
            >
              <div
                className={`tab__item tab__item--lead ${
                  tabTopic === LEAD ? 'active' : ''
                }`}
                onClick={() => {
                  setTabTopic(LEAD)
                }}
              >
                前測
              </div>
              {project.id && (
                <div
                  className={`tab__item tab__item--fund-raising ${
                    tabTopic === FUND_RAISING ? 'active' : ''
                  }`}
                  onClick={() => {
                    setTabTopic(FUND_RAISING)
                  }}
                >
                  上線
                </div>
              )}
              {brew.isOpen && (
                <div
                  className={`tab__item tab__item--brew ${
                    tabTopic === BREW ? 'active' : ''
                  }`}
                  onClick={() => {
                    setTabTopic(BREW)
                  }}
                >
                  Brew
                </div>
              )}
            </div>
          </div>
          {/* 集資廣告數據 */}
          {project.id && tabTopic === FUND_RAISING && (
            <>
              <div
                className="container my-3 line-chart"
                style={{ height: '300px' }}
              >
                <Line
                  data={fundRaisingLineChartData}
                  options={fundRaisingLineChartOptions}
                />
              </div>
              <div className="adAccount__table adAccount__table--fund-raising">
                <div className="adAccount__table-title">每日數據</div>
                <div className="container table-responsive">
                  <div className="tableFixHead">
                    <table className="table">
                      <thead>
                        <tr>
                          <td>Date</td>
                          <td className="table--hide-in-mobile">
                            每日集資金額
                          </td>
                          <td className="table--hide-in-mobile">每日訂單數</td>
                          <td>上線廣告花費</td>
                          <td>廣告直接轉換金額</td>
                          {gaViewIdMap[FUND_RAISING] && <td>GA 收益</td>}
                          <td>廣告直接 ROAS</td>
                          <td>總體 ROAS</td>
                          {user.isLogin && (
                            <td className="table--hide-in-mobile">備註</td>
                          )}
                        </tr>
                        <tr>
                          <th>總計</th>
                          <th className="table--hide-in-mobile">
                            {format(adAccount.fundRaisingTotal).toDollar()}
                          </th>
                          <th className="table--hide-in-mobile">
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
                          {gaViewIdMap[FUND_RAISING] && (
                            <th>
                              {format(fundRaisingGAData.total).toDollar()}
                            </th>
                          )}
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
                            <th className="table--hide-in-mobile"></th>
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
                              <td className="table--hide-in-mobile">
                                {format(
                                  adAccount.fundRaisingDaily[index]
                                ).toDollar()}
                              </td>
                              <td className="table--hide-in-mobile">
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
                              {gaViewIdMap[FUND_RAISING] && (
                                <td>
                                  {format(fundRaisingGAData[date]).toDollar()}
                                </td>
                              )}
                              <td>{adAccount.adsDirectRoasDaily[index]}</td>
                              <td>{adAccount.totalRoasDaily[index]}</td>
                              {user.isLogin && (
                                <td
                                  className="table--hide-in-mobile"
                                  style={{ padding: '8px' }}
                                >
                                  <textarea
                                    value={comment[date]}
                                    className="form-control form-control-sm"
                                    rows="1"
                                    cols="20"
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
          {tabTopic === LEAD && (
            <>
              <div
                className="container my-3 line-chart"
                style={{ height: '300px' }}
              >
                <Line data={leadLineChartData} options={leadLineChartOptions} />
              </div>
              <div className="adAccount__table adAccount__table--lead">
                <div className="adAccount__table-title">每日數據</div>
                <div className="container table-responsive">
                  <div className="tableFixHead">
                    <table className="table">
                      <thead>
                        <tr>
                          <td>Date</td>
                          <td>前測花費</td>
                          <td>名單數(FB)</td>
                          {gaViewIdMap[LEAD] && <td>名單數(GA)</td>}
                          <td>
                            <abbr title="分母以 GA 名單優先，沒有 GA 資料再用 FB 名單數">
                              CPL
                            </abbr>
                          </td>
                          {chatbot && (
                            <td className="table--hide-in-mobile">Chatbot</td>
                          )}
                          {chatbot && (
                            <td
                              title="（chatbot/名單數）"
                              className="table--hide-in-mobile"
                            >
                              訂閱率
                            </td>
                          )}

                          <td className="table--hide-in-mobile">預熱花費</td>
                          {(user.isLogin ||
                            adAccountId === 'act_318137636023754') && (
                            <td className="table--hide-in-mobile">備註</td>
                          )}
                        </tr>
                        <tr>
                          <th>總計</th>
                          <th>{format(adAccount.leadSpendTotal).toDollar()}</th>
                          <th>{format(adAccount.leadTotal).toNumber()}</th>
                          {gaViewIdMap[LEAD] && (
                            <th>{format(leadGAData.total).toNumber()}</th>
                          )}
                          <th>
                            {gaViewIdMap[LEAD] && leadGAData.total
                              ? (
                                  adAccount.leadSpendTotal / leadGAData.total
                                ).toFixed(1)
                              : (
                                  adAccount.leadSpendTotal / adAccount.leadTotal
                                ).toFixed(1)}
                          </th>
                          {chatbot && (
                            <th className="table--hide-in-mobile">
                              {format(adAccount.chatbotTotal).toNumber()}
                            </th>
                          )}
                          {chatbot && (
                            <th className="table--hide-in-mobile">
                              {format(
                                gaViewIdMap[LEAD] && leadGAData.total
                                  ? (
                                      adAccount.chatbotTotal / leadGAData.total
                                    ).toFixed(3)
                                  : (
                                      adAccount.chatbotTotal /
                                      adAccount.leadTotal
                                    ).toFixed(3)
                              ).toPercentage()}
                            </th>
                          )}
                          <th className="table--hide-in-mobile">
                            {format(adAccount.preLaunchSpendTotal).toDollar()}
                          </th>
                          {user.isLogin && (
                            <th className="table--hide-in-mobile"></th>
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
                              {gaViewIdMap[LEAD] && (
                                <td>{format(leadGAData[date]).toNumber()}</td>
                              )}
                              <td>
                                {gaViewIdMap[LEAD] && leadGAData.total
                                  ? format(
                                      (
                                        adAccount.leadSpendDaily[index] /
                                        leadGAData[date]
                                      ).toFixed(1)
                                    ).toDollar()
                                  : format(
                                      adAccount.costPerLeadDaily[index]
                                    ).toDollar()}
                              </td>
                              {chatbot && (
                                <td className="table--hide-in-mobile">
                                  {format(chatbot[date]).toNumber()}
                                </td>
                              )}
                              {chatbot && (
                                <td className="table--hide-in-mobile">
                                  {format(
                                    (chatbot[date]
                                      ? gaViewIdMap[LEAD] && leadGAData.total
                                        ? chatbot[date] / leadGAData[date]
                                        : chatbot[date] /
                                          adAccount.leadDaily[index]
                                      : 0
                                    ).toFixed(3)
                                  ).toPercentage()}
                                </td>
                              )}

                              <td className="table--hide-in-mobile">
                                {format(
                                  adAccount.preLaunchSpendDaily[index]
                                ).toDollar()}
                              </td>
                              {user.isLogin && (
                                <td
                                  className="table--hide-in-mobile"
                                  style={{ padding: '8px' }}
                                >
                                  <textarea
                                    value={comment[date]}
                                    className="form-control form-control-sm"
                                    rows="1"
                                    cols="20"
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
          {/* Brew 廣告數據 */}
          {tabTopic === BREW && (
            <>
              <div
                className="container my-3 line-chart"
                style={{ height: '300px' }}
              >
                <Line data={brewLineChartData} options={brewLineChartOptions} />
              </div>
              <div className="adAccount__table adAccount__table--brew">
                <div className="adAccount__table-title">每日數據</div>
                <div className="container table-responsive">
                  <div className="tableFixHead">
                    <table className="table">
                      <thead>
                        <tr>
                          <td>Date</td>
                          <td className="table--hide-in-mobile">
                            每日集資金額
                          </td>
                          <td className="table--hide-in-mobile">每日訂單數</td>
                          <td>上線廣告花費</td>
                          <td>廣告直接轉換金額</td>
                          <td>廣告直接 ROAS</td>
                          <td>總體 ROAS</td>
                          {user.isLogin && (
                            <td className="table--hide-in-mobile">備註</td>
                          )}
                        </tr>
                        <tr>
                          <th>總計</th>
                          <th className="table--hide-in-mobile">
                            {format(brew.totalOrderSum).toDollar()}
                          </th>
                          <th className="table--hide-in-mobile">
                            {format(brew.totalOrderCount).toNumber()}
                          </th>
                          <th>
                            {format(
                              adAccount.brewData.brewAdsSpendTotal
                            ).toDollar()}
                          </th>
                          <th>
                            {format(
                              adAccount.brewData.brewAdsRevenueTotal
                            ).toDollar()}
                          </th>
                          <th>
                            {(
                              adAccount.brewData.brewAdsRevenueTotal /
                              adAccount.brewData.brewAdsSpendTotal
                            ).toFixed(1)}
                          </th>
                          <th>
                            {(
                              brew.totalOrderSum /
                              adAccount.brewData.brewAdsSpendTotal
                            ).toFixed(1)}
                          </th>
                          {user.isLogin && (
                            <th className="table--hide-in-mobile"></th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {brew.orderStatsDaily.map(
                          ({ date, orderSum, orderCount }) => {
                            return (
                              <tr key={`daily-adAccount-data-${date}`}>
                                <th>{date.slice(5)}</th>
                                <td className="table--hide-in-mobile">
                                  {format(orderSum).toDollar()}
                                </td>
                                <td className="table--hide-in-mobile">
                                  {orderCount}
                                </td>
                                <td>
                                  {format(
                                    adAccount.brewData[date]?.spend
                                  ).toDollar()}
                                </td>
                                <td>
                                  {format(
                                    adAccount.brewData[date]?.revenue
                                  ).toDollar()}
                                </td>
                                <td>
                                  {(
                                    adAccount.brewData[date]?.revenue /
                                    adAccount.brewData[date]?.spend
                                  ).toFixed(1)}
                                </td>
                                <td>
                                  {(
                                    orderSum / adAccount.brewData[date]?.spend
                                  ).toFixed(1)}
                                </td>
                                {user.isLogin && (
                                  <td
                                    className="table--hide-in-mobile"
                                    style={{ padding: '8px' }}
                                  >
                                    <textarea
                                      value={comment[date]}
                                      className="form-control form-control-sm"
                                      rows="1"
                                      cols="20"
                                      data-date={date}
                                      style={{ overflowY: 'hidden' }}
                                      onChange={handleCommentInputChange}
                                    />
                                  </td>
                                )}
                              </tr>
                            )
                          }
                        )}
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

  function updateGaViewId(topic, viewId) {
    fetch(
      `https://drip-plugin.crowdfunding.coffee/api/ga-viewId/create-or-update`,
      // `http://localhost:3050/api/ga-viewId/create-or-update`
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adAccountId,
          topic,
          viewId,
        }),
      }
    )
  }
}

const mapStateToProps = ({ user }) => ({
  user,
})

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(AdAccount)
