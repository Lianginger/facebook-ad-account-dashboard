import React, { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'
import { Line } from 'react-chartjs-2'
import { navigate } from '@reach/router'

function AdAccount({ adAccountId }) {
  const [loading, setLoading] = useState(true)
  const [adAccount, setAdAccount] = useImmer({ data: [] })
  const [paging, setPaging] = useState({})
  const lineChartData = {
    labels: adAccount.data.map(({ date_start }) => date_start).reverse(),
    datasets: [
      {
        label: 'ROAS',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: adAccount.data
          .map(({ purchase_roas }) =>
            purchase_roas ? purchase_roas[0].value : null
          )
          .reverse(),
      },
      {
        label: 'CPL',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: '#666',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: '#666',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#666',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: adAccount.data
          .map(({ cost_per_action_type }) => {
            const costPerLead = cost_per_action_type.find(
              (item) =>
                item.action_type === 'offsite_conversion.fb_pixel_custom'
            )
            return costPerLead ? costPerLead.value : null
          })
          .reverse(),
      },
    ],
  }

  useEffect(() => {
    fetchData()
  }, [adAccountId])

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
          <div className='btn btn-primary' onClick={() => navigate('/')}>
            Home
          </div>
          <h1 className='text-center my-3'>{adAccount.name}</h1>

          {/* 圖表 */}
          <div className='my-2' style={{ height: '200px' }}>
            <Line
              data={lineChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>

          {/* 走速表 */}
          {adAccountId ? (
            <table className='table'>
              <thead>
                <tr>
                  <th scope='col'>Date</th>
                  <th scope='col'>Spend</th>
                  <th scope='col'>CPC</th>
                  <th scope='col'>CPL</th>
                  <th scope='col'>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {adAccount.data.map(
                  (
                    {
                      cpc,
                      spend,
                      date_start,
                      purchase_roas,
                      cost_per_action_type,
                    },
                    index
                  ) => {
                    const costPerLead = cost_per_action_type.find(
                      (item) =>
                        item.action_type ===
                        'offsite_conversion.fb_pixel_custom'
                    )

                    return (
                      <tr key={`daily-adAccount-data-${index}`}>
                        <th>{date_start}</th>
                        <td>{spend}</td>
                        <td>{cpc}</td>
                        <td>{costPerLead ? costPerLead.value : null}</td>
                        <td>{purchase_roas ? purchase_roas[0].value : ''}</td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          ) : (
            ''
          )}
          {/* Paging */}
          <div className='row'>
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
          </div>
        </>
      )}
    </div>
  )

  function fetchData(cursorKey = '', cursorValue = '') {
    setLoading(true)
    fetch(
      `http://localhost:8000/ad-account/${adAccountId}?${cursorKey}=${cursorValue}`
    )
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
        setAdAccount((state) => {
          state.data = res.data
          state.name = res.data[0].account_name
        })
        setPaging(res.paging)
        setLoading(false)
      })
  }
}

export default AdAccount
